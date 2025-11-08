// ==UserScript==
// @name        tv.twitch; channel - mute ads
// @match       *://www.twitch.tv/*
// @version     1.1.1
// @description 2025/10/09
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

const MODNAME = 'Mute Ads';

import { Core_Console_Log } from './lib/ericchase/Core_Console_Log.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { SubscribeToUrlChange } from './lib/HistoryObserver.js';
import { InitModuleSetupHandler, ModuleInterface } from './lib/UserScriptModule.js';

class Module implements ModuleInterface {
  player_mute_cache = false;
  primary_video?: HTMLVideoElement;
  secondary_video?: HTMLVideoElement;
  timer?: ReturnType<typeof setTimeout>;
  watchAdElement(element: Element) {
    if (element.isConnected === false) {
      Core_Console_Log(`[Twitch Mod] ${MODNAME}: Ad Label Disconnected.`);
      this.restorePrimaryVideo();
      // this.restoreSecondaryVideo();
    } else {
      this.timer = setTimeout(() => {
        this.watchAdElement(element);
      }, 250);
    }
  }
  mutePrimaryVideo() {
    if (this.primary_video) {
      Core_Console_Log(`[Twitch Mod] ${MODNAME}: Primary Video Player Muted.`);
      this.primary_video.muted = true;
      this.primary_video.style.setProperty('display', 'none');
    }
  }
  restorePrimaryVideo() {
    if (this.primary_video) {
      Core_Console_Log(`[Twitch Mod] ${MODNAME}: Primary Video Player Restored.`);
      this.primary_video.muted = this.player_mute_cache;
      this.primary_video.style.removeProperty('display');
    }
  }
  maximizeSecondaryVideo() {
    if (this.primary_video && this.secondary_video) {
      Core_Console_Log(`[Twitch Mod] ${MODNAME}: Secondary Video Player Maximized.`);
      const { width, height, top, left } = this.primary_video.getBoundingClientRect();
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
      Core_Console_Log(`[Twitch Mod] ${MODNAME}: Secondary Video Player Restored.`);
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
    Core_Console_Log(`[Twitch Mod]: Setup: ${MODNAME}`);
    this.observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'video',
    });
    this.observer1.subscribe((element1) => {
      if (element1.matches('main video')) {
        Core_Console_Log(`[Twitch Mod] ${MODNAME}: Primary Video Player Found.`);
        this.primary_video = element1 as HTMLVideoElement;
      } else {
        Core_Console_Log(`[Twitch Mod] ${MODNAME}: Secondary Video Player Found.`);
        this.secondary_video = element1 as HTMLVideoElement;
      }
    });
    this.observer2 = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: '[data-a-target="video-ad-label"]',
    });
    this.observer2.subscribe((element1) => {
      Core_Console_Log(`[Twitch Mod] ${MODNAME}: Ad Label Connected.`);
      this.player_mute_cache = this.primary_video?.muted ?? false;
      this.mutePrimaryVideo();
      // this.maximizeSecondaryVideo();
      this.watchAdElement(element1);
    });
  }
  cleanup() {
    Core_Console_Log(`[Twitch Mod]: Clean Up: ${MODNAME}`);
    clearTimeout(this.timer);
    this.observer1?.disconnect();
    this.observer2?.disconnect();
    this.restorePrimaryVideo();
    // this.restoreSecondaryVideo();
  }
}

SubscribeToUrlChange(InitModuleSetupHandler(Module));
