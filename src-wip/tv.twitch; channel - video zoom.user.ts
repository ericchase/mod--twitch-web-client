// ==UserScript==
// @name        tv.twitch; channel - video zoom
// @match       *://www.twitch.tv/*
// @version     1.0.1
// @description 2025/10/09
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { WebPlatform_DOM_Element_Added_Observer_Class } from '../src/lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';

class Rect {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  top = 0;
  right = 0;
  bottom = 0;
  left = 0;
}
class Region {
  element: HTMLElement;
  startPoint: {
    x: number;
    y: number;
  };
  endPoint: {
    x: number;
    y: number;
  };
  constructor() {
    this.element = document.createElement('div');
    this.element.style.position = 'absolute';
    this.element.style.border = '2px solid red';
    this.element.style.pointerEvents = 'none';
    this.element.style.zIndex = '99999';
    this.startPoint = { x: 0, y: 0 };
    this.endPoint = { x: 0, y: 0 };
    this.hide();
  }
  attach(sibling: HTMLElement) {
    sibling.insertAdjacentElement('afterend', this.element);
  }
  setStart(x: number, y: number) {
    this.startPoint.x = x;
    this.startPoint.y = y;
  }
  setEnd(x: number, y: number) {
    this.endPoint.x = x;
    this.endPoint.y = y;
  }
  drawRegion() {
    const rect = this.getRect();
    if (rect.width > 15 && rect.height > 15) {
      this.element.style.left = rect.x + 'px';
      this.element.style.top = rect.y + 'px';
      this.element.style.width = rect.width + 'px';
      this.element.style.height = rect.height + 'px';
      this.show();
    } else {
      this.element.style.left = '0';
      this.element.style.top = '0';
      this.element.style.width = '0';
      this.element.style.height = '0';
      this.hide();
    }
  }
  getRect() {
    let x1 = this.startPoint.x > this.endPoint.x ? this.endPoint.x : this.startPoint.x;
    let y1 = this.startPoint.y > this.endPoint.y ? this.endPoint.y : this.startPoint.y;
    let x2 = this.startPoint.x > this.endPoint.x ? this.startPoint.x : this.endPoint.x;
    let y2 = this.startPoint.y > this.endPoint.y ? this.startPoint.y : this.endPoint.y;
    return {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1,
      left: x1,
      right: x2,
      top: y1,
      bottom: y2,
    };
  }
  show() {
    this.element.style.display = 'block';
  }
  hide() {
    this.element.style.display = 'none';
  }
  reset() {
    this.startPoint = { x: 0, y: 0 };
    this.endPoint = { x: 0, y: 0 };
    this.hide();
  }
}
class VideoHandler {
  element: HTMLElement;
  region: Region;
  zoomScale: number;
  zoomX: number;
  zoomY: number;
  constructor(element: HTMLElement) {
    this.element = element;
    this.region = new Region();
    this.zoomScale = 1;
    this.zoomX = 0;
    this.zoomY = 0;
  }
  isClickedInside(event: MouseEvent) {
    if (this.element && this.element.offsetParent) {
      const { x, y } = this.element.offsetParent.getBoundingClientRect();
      const left = x + this.element.offsetLeft;
      const top = y + this.element.offsetTop;
      const right = left + this.element.offsetWidth;
      const bottom = top + this.element.offsetHeight;
      return event.clientX >= left && event.clientX <= right && event.clientY >= top && event.clientY <= bottom;
    }
    return false;
  }
  getBoundingClientRect() {
    if (this.element) {
      return this.element.getBoundingClientRect();
    }
    return new Rect();
  }
  getRelativeCoords(x: number, y: number) {
    if (this.element) {
      return {
        x: x - this.getBoundingClientRect().left + this.element.offsetLeft,
        y: y - this.getBoundingClientRect().top + this.element.offsetTop,
      };
    }
    return { x, y };
  }
  reset() {
    this.resetZoom();
    // GetVideo();
  }
  applyZoom() {
    this.region.hide();
    if (this.element) {
      const regionRect = this.region.getRect();
      const offset = {
        x: this.element.offsetLeft,
        y: this.element.offsetTop,
        width: this.element.offsetWidth,
        height: this.element.offsetHeight,
      };
      const region = {
        x: regionRect.x,
        y: regionRect.y,
        width: regionRect.width,
        height: regionRect.height,
      };
      const xScale = offset.width / region.width;
      const yScale = offset.height / region.height;
      this.zoomScale = xScale < yScale ? xScale : yScale;
      this.zoomX = region.x * this.zoomScale - (offset.width - region.width * this.zoomScale) / 2 - offset.x * this.zoomScale;
      this.zoomY = region.y * this.zoomScale - (offset.height - region.height * this.zoomScale) / 2 - offset.y * this.zoomScale;
      this.zoomX = this.zoomX < 0 ? 0 : -1 * this.zoomX;
      this.zoomY = this.zoomY < 0 ? 0 : -1 * this.zoomY;
      this.element.style.transformOrigin = `0 0 0`;
      this.element.style.scale = `${this.zoomScale}`;
      this.element.style.translate = `${this.zoomX}px ${this.zoomY}px`;
    }
  }
  moveZoom(deltaX: number, deltaY: number) {
    if (this.element) {
      this.zoomX += deltaX;
      this.zoomY += deltaY;
      this.element.style.translate = `${this.zoomX}px ${this.zoomY}px`;
    }
  }
  resetZoom() {
    if (this.element) {
      this.zoomScale = 1;
      this.element.style.removeProperty('transformOrigin');
      this.element.style.removeProperty('scale');
      this.element.style.removeProperty('translate');
    }
  }
  get isZoomed() {
    return this.zoomScale !== 1;
  }
}
const mouseHandlers = {
  HandleMouse_Begin: Toggler(
    () => {
      window.addEventListener('mousedown', HandleMouse_Begin);
      window.addEventListener('mousedown', HandleMouse_Begin, true);
      window.addEventListener('click', HandleClick);
      window.addEventListener('click', HandleClick, true);
    },
    () => {
      window.removeEventListener('mousedown', HandleMouse_Begin);
      window.removeEventListener('mousedown', HandleMouse_Begin, true);
      window.removeEventListener('click', HandleClick);
      window.removeEventListener('click', HandleClick, true);
    },
  ),
  HandleMouse_Move: Toggler(
    () => window.addEventListener('mousemove', HandleMouse_Move, true),
    () => window.removeEventListener('mousemove', HandleMouse_Move, true),
  ),
  HandleMouse_End: Toggler(
    () => {
      window.addEventListener('mouseup', HandleMouse_End);
      window.addEventListener('mouseup', HandleMouse_End, true);
    },
    () => {
      window.removeEventListener('mouseup', HandleMouse_End);
      window.removeEventListener('mouseup', HandleMouse_End, true);
    },
  ),
  HandleMouse_ResetZoom: Toggler(
    () => window.addEventListener('contextmenu', HandleMouse_ResetZoom, true),
    () => window.removeEventListener('contextmenu', HandleMouse_ResetZoom, true),
  ),
};

function ConsumeEvent(event: Event) {
  event.preventDefault();
  event.stopImmediatePropagation();
  event.stopPropagation();
}
function IsLeftClick(event: MouseEvent) {
  return event.button === 0;
}
function Toggler(onEnable: () => void, onDisable: () => void) {
  let isEnabled = false;
  return (enable = false) => {
    if (isEnabled === enable) return;
    isEnabled = !isEnabled;
    isEnabled ? onEnable() : onDisable();
  };
}

let consumeNextClick = false;
let oldClientX = 0;
let oldClientY = 0;

function HandleMouse_Begin(event: MouseEvent) {
  if (IsLeftClick(event) && videoHandler.element && videoHandler.isClickedInside(event)) {
    if (event.ctrlKey || event.altKey) {
      ConsumeEvent(event);
    }
    oldClientX = event.clientX;
    oldClientY = event.clientY;
    mouseHandlers.HandleMouse_End(true);
    mouseHandlers.HandleMouse_Move(true);
    if (!videoHandler.isZoomed) {
      videoHandler.region.attach(videoHandler.element);
      const { x, y } = videoHandler.getRelativeCoords(event.clientX, event.clientY);
      videoHandler.region.setStart(x, y);
      videoHandler.region.setEnd(x, y);
    }
  }
}
function HandleMouse_Move(event: MouseEvent) {
  if (videoHandler.isZoomed) {
    if (oldClientX !== event.clientX || oldClientY !== event.clientY) {
      consumeNextClick = true;
      videoHandler.moveZoom(event.clientX - oldClientX, event.clientY - oldClientY);
      oldClientX = event.clientX;
      oldClientY = event.clientY;
    }
  } else {
    const { x, y } = videoHandler.getRelativeCoords(event.clientX, event.clientY);
    videoHandler.region.setEnd(x, y);
    videoHandler.region.drawRegion();
  }
}
function HandleMouse_End(event: MouseEvent) {
  mouseHandlers.HandleMouse_End(false);
  mouseHandlers.HandleMouse_Move(false);
  const { width, height } = videoHandler.region.getRect();
  if (width > 15 && height > 15) {
    ConsumeEvent(event);
    if (!videoHandler.isZoomed) {
      mouseHandlers.HandleMouse_ResetZoom(true);
      videoHandler.applyZoom();
      consumeNextClick = true;
    }
  }
  videoHandler.region.reset();
}
function HandleClick(event: MouseEvent) {
  if (IsLeftClick(event) && videoHandler.element && videoHandler.isClickedInside(event)) {
    if (consumeNextClick || event.ctrlKey || event.altKey) {
      consumeNextClick = false;
      ConsumeEvent(event);
    }
  }
}
function HandleMouse_ResetZoom(event: MouseEvent) {
  if (videoHandler.isZoomed && videoHandler.isClickedInside(event)) {
    ConsumeEvent(event);
    mouseHandlers.HandleMouse_ResetZoom(false);
    videoHandler.resetZoom();
  }
}

let videoHandler: VideoHandler;

const observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
  selector: 'video',
});
observer1.subscribe((element1) => {
  const { width, height } = element1.getBoundingClientRect();
  if (element1 instanceof HTMLVideoElement && width > 0 && height > 0) {
    videoHandler = new VideoHandler(element1);
    mouseHandlers.HandleMouse_Begin(true);
  }
});
