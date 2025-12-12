// ==UserScript==
// @name        tv.twitch; channel - mute ads
// @match       *://www.twitch.tv/*
// @version     2.0.3
// @description 2025/10/09
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Core_Console_Log } from './lib/ericchase/Core_Console_Log.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { WebPlatform_Utility_Get_Ancestor_List, WebPlatform_Utility_Get_Closest_Common_Ancestor } from './lib/ericchase/WebPlatform_Utility_Ancestor_Node.js';
import { AutomatedModuleSetup, ModuleInterface } from './lib/UserScriptModule.js';

function isPrimaryVideoPlayer(element: HTMLVideoElement) {
  // as of now, the primary video players reside under the <main> tag
  if (element.matches('main video')) {
    return true;
  }
  return false;
}

interface VideoObject {
  element: HTMLVideoElement;
  is_connected: boolean;
  is_modified: boolean;
  is_muted: boolean;
  is_primary: boolean;
}

const VideoManager = new (class {
  video_map = new Map<HTMLVideoElement, VideoObject>();
  primary_video_count = 0;
  secondary_video_count = 0;
  ads_running = false;
  cache_muted = false;
  cache_volume = 0;
  /**
   * [element, property, value]
   * if value is '', call removeProperty
   */
  restore_styles_list: [HTMLElement, string, string][] = [];

  clean() {
    this.adsStopped(); // good enough for cleanup

    this.video_map.clear();
    this.primary_video_count = 0;
    this.secondary_video_count = 0;
  }

  addVideo(element: HTMLVideoElement) {
    const obj: VideoObject = {
      element,
      is_connected: true,
      is_modified: false,
      is_muted: false,
      is_primary: isPrimaryVideoPlayer(element),
    };
    this.video_map.set(element, obj);

    if (obj.is_primary === true) {
      if (this.ads_running === true) {
        this.modifyPrimaryVideo(obj);
      }
      VideoManager.primary_video_count++;
    } else {
      VideoManager.secondary_video_count++;
      if (this.ads_running === true) {
        this.modifySecondaryVideo(obj);
      } else {
        // was a bad idea
        // // testing: preemptively mute primary video just before ads start
        // setTimeout(() => {
        //   if (this.ads_running !== true) {
        //     const primary_obj = this.getPrimaryVideoObject();
        //     if (primary_obj !== undefined) {
        //       primary_obj.is_muted = true;
        //       this.cache_muted = primary_obj.element.muted;
        //       this.cache_volume = primary_obj.element.volume;
        //       primary_obj.element.muted = true;
        //     }
        //   }
        // }, 10000);
      }
    }

    return obj;
  }
  removeVideo(element: HTMLVideoElement) {
    const obj = this.video_map.get(element);
    if (obj === undefined) {
      return;
    }
    this.video_map.delete(element);

    if (obj.is_primary === true) {
      VideoManager.primary_video_count--;
    } else {
      VideoManager.secondary_video_count--;
    }
  }

  modifyPrimaryVideo(obj: VideoObject) {
    if (obj.is_modified !== true) {
      obj.is_modified = true;

      if (obj.is_muted === false) {
        obj.is_muted = true;
        // update cache from primary video
        this.cache_muted = obj.element.muted;
        this.cache_volume = obj.element.volume;
        obj.element.muted = true;
      }

      obj.element.style.setProperty('opacity', '0');
    }
  }
  modifySecondaryVideo(obj: VideoObject) {
    if (obj.is_modified !== true) {
      obj.is_modified = true;

      // set mute and volume when video starts playing
      const onVolumeChangeEventHandler = () => {
        // console.log('volumechange event triggered:', obj.element);
        if (obj.element.muted !== this.cache_muted) {
          obj.element.muted = this.cache_muted;
        }
        if (obj.element.volume !== this.cache_volume) {
          obj.element.volume = this.cache_volume;
        }
        // const { muted, volume } = obj.element;
        // console.log({ muted, volume });
      };
      const onPlayEventHandler = () => {
        // console.log('play event triggered:', obj.element);
        if (obj.element.muted !== this.cache_muted) {
          obj.element.muted = this.cache_muted;
        }
        if (obj.element.volume !== this.cache_volume) {
          obj.element.volume = this.cache_volume;
        }
        // const { muted, volume } = obj.element;
        // console.log({ muted, volume });
      };
      obj.element.addEventListener('play', onPlayEventHandler);
      obj.element.addEventListener('volumechange', onVolumeChangeEventHandler);

      obj.element.muted = this.cache_muted;
      obj.element.volume = this.cache_volume;

      const primary_obj = this.getPrimaryVideoObject();
      if (primary_obj !== undefined) {
        // move and resize secondary video over primary video
        const rect = obj.element.getBoundingClientRect();
        const primary_rect = primary_obj.element.getBoundingClientRect();
        obj.element.style.setProperty('width', `${primary_rect.width}px`);
        obj.element.style.setProperty('height', `${primary_rect.height}px`);
        obj.element.style.setProperty('top', `${primary_rect.top - rect.top}px`);
        obj.element.style.setProperty('left', `${primary_rect.left - rect.left}px`);

        const common_ancestor = WebPlatform_Utility_Get_Closest_Common_Ancestor(obj.element, primary_obj.element);
        if (common_ancestor !== undefined) {
          const secondary_ancestor_list = WebPlatform_Utility_Get_Ancestor_List(obj.element);
          const common_ancestor_index = secondary_ancestor_list.indexOf(common_ancestor);
          if (common_ancestor_index !== -1) {
            // for ancestors, set 'overflow' to 'visible' if not 'visible'
            for (let i = common_ancestor_index + 1; i < secondary_ancestor_list.length; i++) {
              const ancestor = secondary_ancestor_list[i];
              if (ancestor instanceof HTMLElement) {
                if (window.getComputedStyle(ancestor).overflow !== 'visible') {
                  this.restore_styles_list.push([ancestor, 'overflow', ancestor.style.getPropertyValue('overflow')]);
                  ancestor.style.setProperty('overflow', 'visible');
                }
              }
            }
            // for ancestor after common ancestor, add large 'z-index'
            for (let i = common_ancestor_index + 1; i < secondary_ancestor_list.length; i++) {
              const ancestor = secondary_ancestor_list[i];
              if (ancestor instanceof HTMLElement) {
                this.restore_styles_list.push([ancestor, 'z-index', ancestor.style.getPropertyValue('z-index')]);
                ancestor.style.setProperty('z-index', '99999');
                break;
              }
            }
          }
        }
      }
    }
  }

  restorePrimaryVideo(obj: VideoObject) {
    if (obj.is_modified === true) {
      obj.is_modified = false;
      obj.is_muted = false;

      obj.element.muted = this.cache_muted;
      obj.element.style.removeProperty('opacity');
    }
  }
  restoreSecondaryVideo(obj: VideoObject) {
    if (obj.is_modified === true) {
      obj.is_modified = false;

      // restore mute
      obj.element.muted = true;

      // restore position and size
      obj.element.style.removeProperty('width');
      obj.element.style.removeProperty('height');
      obj.element.style.removeProperty('top');
      obj.element.style.removeProperty('left');
    }
  }

  adsStarted() {
    this.ads_running = true;
    for (const [_, obj] of this.entries()) {
      if (obj.is_modified !== true) {
        if (obj.is_primary === true) {
          this.modifyPrimaryVideo(obj);
        } else {
          this.modifySecondaryVideo(obj);
        }
      }
    }
  }
  adsStopped() {
    this.ads_running = false;
    for (const [_, obj] of this.entries()) {
      if (obj.is_modified === true) {
        if (obj.is_primary === true) {
          this.restorePrimaryVideo(obj);
        } else {
          this.restoreSecondaryVideo(obj);
        }
      }
    }
    for (const [element, property, value] of this.restore_styles_list) {
      if (value === '') {
        element.style.removeProperty(property);
      } else {
        element.style.setProperty(property, value);
      }
    }
  }

  getPrimaryVideoObject() {
    for (const [_, obj] of this.entries()) {
      if (obj.is_primary === true) {
        return obj;
      }
    }
  }

  *entries(): Generator<[HTMLVideoElement, VideoObject]> {
    for (const [element, obj] of this.video_map) {
      if (element.isConnected === true) {
        yield [element, obj];
      } else {
        // this.removeVideo(element);
        obj.is_connected = false;
      }
    }
  }
})();

class Module implements ModuleInterface {
  name = 'Mute Ads';
  observer_set = new Set<Class_WebPlatform_DOM_Element_Added_Observer_Class>();
  adlabel_set = new Set<Element>();
  maintag_set = new Set<HTMLElement>();
  ads_timer?: ReturnType<typeof setTimeout>;

  clean() {
    Core_Console_Log(`[Twitch Mod]: Clean: ${this.name}`);
    for (const observer of this.observer_set) {
      observer.disconnect();
    }
    this.observer_set.clear();
    this.adlabel_set.clear();
    for (const element of this.maintag_set) {
      element.style.removeProperty('z-index');
    }
    this.maintag_set.clear();
    VideoManager.clean();
    clearTimeout(this.ads_timer);
    this.ads_timer = undefined;
  }

  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${this.name}`);
    this.createAddedObserver_AdLabels();
    this.createAddedObserver_MainTag();
    this.createAddedObserver_VideoElements();
  }

  // Main Methods

  adsStarted() {
    VideoManager.adsStarted();
    this.watchAdLabels();
  }

  adsStopped() {
    VideoManager.adsStopped();
  }

  /** called by `adsStarted()`, calls `adsStopped()` */
  watchAdLabels() {
    if (isAnyElementConnected(this.adlabel_set) === true) {
      this.ads_timer = setTimeout(() => this.watchAdLabels(), 250);
    } else {
      clearTimeout(this.ads_timer);
      this.ads_timer = undefined;
      this.adsStopped();
    }
  }

  // Add Methods

  addAdLabel(element: Element) {
    Core_Console_Log(`[Twitch Mod]: ${this.name}: Ad Label Found:`, element);
    this.adlabel_set.add(element);
    this.adsStarted();
  }

  addMainTag(element: HTMLElement) {
    this.maintag_set.add(element);
    // element.style.setProperty('z-index', '1000');
  }

  addVideoElement(element: HTMLVideoElement) {
    const obj = VideoManager.addVideo(element);
    Core_Console_Log(`[Twitch Mod]: ${this.name}: ${obj.is_primary ? 'Primary' : 'Secondary'} Video Found:`, obj);
  }

  // Observer Methods

  createAddedObserver_AdLabels() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: '[data-a-target="video-ad-label"]',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      this.addAdLabel(element);
    });
  }

  createAddedObserver_MainTag() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'main',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      if (element instanceof HTMLElement) {
        this.addMainTag(element);
      }
    });
  }

  createAddedObserver_VideoElements() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'video',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      if (element instanceof HTMLVideoElement) {
        this.addVideoElement(element);
      }
    });
  }
}

AutomatedModuleSetup(Module, () => !window.location.pathname.startsWith('/directory'));

function isAnyElementConnected(set: Set<Element>) {
  for (const element of set) {
    if (element.isConnected === true) {
      return true;
    }
  }
  return false;
}
