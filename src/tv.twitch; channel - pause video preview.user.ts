// ==UserScript==
// @name        tv.twitch; channel - pause video preview
// @match       *://www.twitch.tv/*
// @version     1.0.2
// @description 2026/01/09
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Core_Console_Log } from './lib/ericchase/Core_Console_Log.js';
import { WebPlatform_DOM_Attribute_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Attribute_Observer_Class.js';
import { WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { AutomatedModuleSetup, ModuleInterface } from './lib/UserScriptModule.js';

class Module implements ModuleInterface {
  name = 'Pause Video Preview';
  observer_set = new Set<{ disconnect: () => void }>();
  video_set = new Set<HTMLVideoElement>();
  mode_is_pause = false;

  clean() {
    Core_Console_Log(`[Twitch Mod]: Clean: ${this.name}`);
    for (const observer of this.observer_set) {
      observer.disconnect();
    }
    for (const element of this.video_set) {
      if (this.mode_is_pause === true) {
        element.pause();
      } else {
        element.play();
      }
    }
    this.observer_set.clear();
    this.video_set.clear();
    this.mode_is_pause = false;
  }

  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${this.name}`);
    this.createObserver1();
    this.createObserver2();
  }

  createObserver1() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'video',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      if (element instanceof HTMLVideoElement) {
        // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'createObserver1:', element);
        this.video_set.add(element);
        this.createObserver1B(element);
        if (this.mode_is_pause === true) {
          this.pauseVideo(element);
        } else {
          this.playVideo(element);
        }
      }
    });
  }

  createObserver1B(element: HTMLVideoElement) {
    const observer = WebPlatform_DOM_Attribute_Observer_Class({
      options: {
        attributeFilter: ['src'],
      },
      source: element,
    });
    this.observer_set.add(observer);
    observer.subscribe(() => {
      // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'src change:', element);
      if (this.mode_is_pause === true) {
        this.pauseVideo(element);
      } else {
        this.playVideo(element);
      }
    });
  }

  // <div class="channel-info-content">
  //   <section class="Layout-sc-1xcs6mc-0 skip-to-target" id="offline-channel-main-content" aria-label="Main Content" aria-hidden="false">
  // ...
  // <div class="channel-info-content">
  //   <section class="Layout-sc-1xcs6mc-0 skip-to-target" id="live-channel-stream-information" aria-label="Stream Information" aria-hidden="false"></section>
  // ...

  createObserver2() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: '.channel-info-content > section',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      if (element instanceof HTMLElement) {
        // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'createObserver2:', element);
        this.createObserver2B(element);
        this.processSectionElement(element);
      }
    });
  }

  createObserver2B(element: HTMLElement) {
    const observer = WebPlatform_DOM_Attribute_Observer_Class({
      options: {
        attributeFilter: ['id'],
      },
      source: element,
    });
    this.observer_set.add(observer);
    observer.subscribe(() => {
      // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'id change:', element);
      this.processSectionElement(element);
    });
  }

  processSectionElement(element: HTMLElement) {
    switch (element.getAttribute('id')) {
      case 'live-channel-stream-information':
        this.mode_is_pause = false;
        this.playVideos();
        break;
      case 'offline-channel-main-content':
        this.mode_is_pause = true;
        this.pauseVideos();
        break;
    }
  }

  pauseVideos() {
    for (const element of this.video_set) {
      this.pauseVideo(element);
    }
  }

  pauseVideo(element: HTMLVideoElement) {
    element.pause();

    const onLoadedData = (event: Event) => {
      const element = event.currentTarget;
      // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'onLoadedData', element);
      if (element instanceof HTMLVideoElement) {
        if (this.mode_is_pause === true) {
          element.pause();
        } else {
          element.play();
        }
      }
    };
    const onPlay = (event: Event) => {
      const element = event.currentTarget;
      // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'onPlay', element);
      if (element instanceof HTMLVideoElement) {
        if (this.mode_is_pause === true) {
          element.pause();
        }
      }
    };
    const onPlaying = (event: Event) => {
      const element = event.currentTarget;
      // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'onPlaying', element);
      if (element instanceof HTMLVideoElement) {
        if (this.mode_is_pause === true) {
          element.pause();
        }
      }
    };

    // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'addEventListener:', element);
    element.addEventListener('loadeddata', onLoadedData);
    element.addEventListener('play', onPlay);
    element.addEventListener('playing', onPlaying);
    setTimeout(() => {
      // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'removeEventListener:', element);
      element.removeEventListener('loadeddata', onLoadedData);
      element.removeEventListener('play', onPlay);
      element.removeEventListener('playing', onPlaying);
    }, 5000);
  }

  playVideos() {
    for (const element of this.video_set) {
      this.playVideo(element);
    }
  }

  playVideo(element: HTMLVideoElement) {
    element.play();

    const onLoadedData = (event: Event) => {
      const element = event.currentTarget;
      // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'onLoadedData', element);
      if (element instanceof HTMLVideoElement) {
        if (this.mode_is_pause === true) {
          element.pause();
        } else {
          element.play();
        }
      }
    };
    const onPlay = (event: Event) => {
      const element = event.currentTarget;
      // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'onPlay', element);
      if (element instanceof HTMLVideoElement) {
        if (this.mode_is_pause === true) {
          element.pause();
        }
      }
    };
    const onPlaying = (event: Event) => {
      const element = event.currentTarget;
      // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'onPlaying', element);
      if (element instanceof HTMLVideoElement) {
        if (this.mode_is_pause === true) {
          element.pause();
        }
      }
    };

    // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'addEventListener:', element);
    element.addEventListener('loadeddata', onLoadedData);
    element.addEventListener('play', onPlay);
    element.addEventListener('playing', onPlaying);
    setTimeout(() => {
      // Core_Console_Log(`[Twitch Mod]: ${this.name}:`, 'removeEventListener:', element);
      element.removeEventListener('loadeddata', onLoadedData);
      element.removeEventListener('play', onPlay);
      element.removeEventListener('playing', onPlaying);
    }, 5000);
  }
}

AutomatedModuleSetup(Module, () => !window.location.pathname.startsWith('/directory'));
