// ==UserScript==
// @name        tv.twitch; channel.videos - pause video preview
// @match       *://www.twitch.tv/*/videos
// @version     1.0.1
// @description 2026/01/09
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Core_Console_Log } from './lib/ericchase/Core_Console_Log.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { AutomatedModuleSetup, ModuleInterface } from './lib/UserScriptModule.js';

class Module implements ModuleInterface {
  name = 'Pause Video Preview';
  observer_set = new Set<Class_WebPlatform_DOM_Element_Added_Observer_Class>();
  video_set = new Set<HTMLVideoElement>();

  clean() {
    Core_Console_Log(`[Twitch Mod]: Clean: ${this.name}`);
    for (const observer of this.observer_set) {
      observer.disconnect();
    }
    for (const video of this.video_set) {
      video.play();
    }
    this.observer_set.clear();
  }

  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${this.name}`);
    this.createObserver1();
  }

  createObserver1() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'video',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      if (element instanceof HTMLVideoElement) {
        const video = element;
        this.video_set.add(video);
        Core_Console_Log(`[Twitch Mod]: ${this.name}: Pausing Video:`, video);
        let done = false;
        function tryToPause() {
          if (video.paused !== true) {
            video.pause();
            setTimeout(() => {
              done = true;
            }, 1000);
          }
          if (done !== true) {
            setTimeout(tryToPause, 25);
          }
        }
        setTimeout(tryToPause, 25);
      }
    });
  }
}

AutomatedModuleSetup(Module, () => window.location.pathname.endsWith('/videos'));
