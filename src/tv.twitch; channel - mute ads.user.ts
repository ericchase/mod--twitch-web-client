// ==UserScript==
// @name        tv.twitch; channel - mute ads
// @match       *://www.twitch.tv/*
// @version     1.2.1
// @description 2025/10/09
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Core_Console_Log } from './lib/ericchase/Core_Console_Log.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { AutomatedModuleSetup, ModuleInterface } from './lib/UserScriptModule.js';

class Module implements ModuleInterface {
  name = 'Mute Ads';
  observer_set = new Set<Class_WebPlatform_DOM_Element_Added_Observer_Class>();

  primary_video?: HTMLVideoElement;
  secondary_video?: HTMLVideoElement;
  timer?: ReturnType<typeof setTimeout>;

  ads_running = false;
  player_mute_status_before_ads = false;

  clean() {
    Core_Console_Log(`[Twitch Mod]: Clean: ${this.name}`);
    for (const observer of this.observer_set) {
      observer.disconnect();
    }
    this.observer_set.clear();

    this.restorePrimaryVideo();
    this.restoreSecondaryVideo();
    clearTimeout(this.timer);
    this.timer = undefined;

    this.ads_running = false;
    this.player_mute_status_before_ads = false;
  }

  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${this.name}`);
    this.createObserver1();
    this.createObserver2();
  }

  restorePrimaryVideo() {
    if (this.primary_video) {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Primary Video Player Restored.`);
      this.primary_video.muted = this.player_mute_status_before_ads;
      this.primary_video.style.removeProperty('display');
    }
  }

  mutePrimaryVideo() {
    if (this.primary_video) {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Primary Video Player Muted.`);
      this.primary_video.muted = true;
      this.primary_video.style.setProperty('display', 'none');
    }
  }

  restoreSecondaryVideo() {
    if (this.secondary_video) {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Secondary Video Player Restored.`);
      this.secondary_video.style.removeProperty('width');
      this.secondary_video.style.removeProperty('height');
      this.secondary_video.style.removeProperty('top');
      this.secondary_video.style.removeProperty('left');
      this.secondary_video.style.removeProperty('position');
      this.secondary_video.style.removeProperty('z-index');
    }
  }

  maximizeSecondaryVideo() {
    if (this.primary_video && this.secondary_video) {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Secondary Video Player Maximized.`);
      const { width, height, top, left } = this.primary_video.getBoundingClientRect();
      this.secondary_video.style.setProperty('width', width + 'px');
      this.secondary_video.style.setProperty('height', height + 'px');
      this.secondary_video.style.setProperty('top', top + '');
      this.secondary_video.style.setProperty('left', left + '');
      this.secondary_video.style.setProperty('position', 'fixed');
      this.secondary_video.style.setProperty('z-index', '99999');
    }
  }

  createObserver1() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'video',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      if (element.matches('main video')) {
        Core_Console_Log(`[Twitch Mod]: ${this.name}: Primary Video Player Found.`);
        this.primary_video = element as HTMLVideoElement;
      } else {
        Core_Console_Log(`[Twitch Mod]: ${this.name}: Secondary Video Player Found.`);
        this.secondary_video = element as HTMLVideoElement;
        if (this.ads_running === true) {
          this.maximizeSecondaryVideo();
        }
      }
    });
  }

  createObserver2() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: '[data-a-target="video-ad-label"]',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Ad Label Connected.`);
      this.ads_running = true;
      this.player_mute_status_before_ads = this.primary_video?.muted ?? false;
      this.mutePrimaryVideo();
      this.maximizeSecondaryVideo();
      this.watchAdElement(element);
    });
  }

  watchAdElement(element: Element) {
    if (element.isConnected === false) {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Ad Label Disconnected.`);
      this.restorePrimaryVideo();
      this.restoreSecondaryVideo();
      clearTimeout(this.timer);
      this.timer = undefined;
      this.ads_running = false;
    } else {
      this.timer = setTimeout(() => void this.watchAdElement(element), 250);
    }
  }
}

AutomatedModuleSetup(Module, () => !window.location.pathname.startsWith('/directory'));
