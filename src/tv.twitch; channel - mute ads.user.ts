// ==UserScript==
// @name        tv.twitch; channel - mute ads
// @match       *://www.twitch.tv/*
// @version     1.1.0
// @description 2025/10/09
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { SubscribeToUrlChange } from './lib/HistoryObserver.js';
import { InitModuleSetupHandler, ModuleInterface } from './lib/UserScriptModule.js';

class Module implements ModuleInterface {
  main_video?: HTMLVideoElement;
  secondary_video?: HTMLVideoElement;
  timer?: ReturnType<typeof setTimeout>;
  watchAdElement(element: Element) {
    if (element.isConnected) {
      // console.log('mute ads: ad label connected');
      this.muteMainVideo();
      this.maximizeSecondaryVideo();
      this.timer = setTimeout(() => {
        this.watchAdElement(element);
      }, 1000);
    } else {
      // console.log('mute ads: ad label not connected');
      this.unmuteMainVideo();
      this.restoreSecondaryVideo();
    }
  }
  muteMainVideo() {
    if (this.main_video) {
      this.main_video.muted = true;
      this.main_video.style.setProperty('display', 'none');
    }
  }
  unmuteMainVideo() {
    if (this.main_video) {
      this.main_video.muted = false;
      this.main_video.style.removeProperty('display');
    }
  }
  maximizeSecondaryVideo() {
    if (this.main_video && this.secondary_video) {
      const { width, height, top, left } = this.main_video.getBoundingClientRect();
      this.secondary_video.style.setProperty('width', width + 'px');
      this.secondary_video.style.setProperty('height', height + 'px');
      this.secondary_video.style.setProperty('top', top + '');
      this.secondary_video.style.setProperty('left', left + '');
      this.secondary_video.style.setProperty('position', 'fixed');
      this.secondary_video.style.setProperty('z-index', '99999');
    }
  }
  restoreSecondaryVideo() {
    if (this.secondary_video) {
      this.secondary_video.style.removeProperty('width');
      this.secondary_video.style.removeProperty('height');
      this.secondary_video.style.removeProperty('top');
      this.secondary_video.style.removeProperty('left');
      this.secondary_video.style.removeProperty('position');
      this.secondary_video.style.removeProperty('z-index');
    }
  }
  //
  observer1?: Class_WebPlatform_DOM_Element_Added_Observer_Class;
  observer2?: Class_WebPlatform_DOM_Element_Added_Observer_Class;
  setup() {
    console.log('setup mute ads');
    this.observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'video',
    });
    this.observer1.subscribe((element1) => {
      if (element1.matches('main video')) {
        // console.log('mute ads: main video found');
        this.main_video = element1 as HTMLVideoElement;
      } else {
        // console.log('mute ads: secondary video found');
        this.secondary_video = element1 as HTMLVideoElement;
      }
    });
    this.observer2 = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: '[data-a-target="video-ad-label"]',
    });
    this.observer2.subscribe((element1) => {
      // console.log('mute ads: ad label found');
      this.watchAdElement(element1);
    });
  }
  cleanup() {
    console.log('cleanup mute ads');
    clearTimeout(this.timer);
    this.observer1?.disconnect();
    this.observer2?.disconnect();
    this.unmuteMainVideo();
    this.restoreSecondaryVideo();
  }
}

SubscribeToUrlChange(InitModuleSetupHandler(Module));
