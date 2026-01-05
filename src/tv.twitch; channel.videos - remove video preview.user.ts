// ==UserScript==
// @name        tv.twitch; channel.videos - remove video preview
// @match       *://www.twitch.tv/*/videos
// @version     1.0.0
// @description 2026/01/05
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Core_Console_Log } from './lib/ericchase/Core_Console_Log.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { AutomatedModuleSetup, ModuleInterface } from './lib/UserScriptModule.js';

class Module implements ModuleInterface {
  name = 'Remove Video Overlay';
  observer_set = new Set<Class_WebPlatform_DOM_Element_Added_Observer_Class>();

  clean() {
    Core_Console_Log(`[Twitch Mod]: Clean: ${this.name}`);
    for (const observer of this.observer_set) {
      observer.disconnect();
    }
    this.observer_set.clear();
  }

  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${this.name}`);
    this.createObserver1();
  }

  createObserver1() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: '.persistent-player',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Removing Overlay:`, element);
      element.remove();
    });
  }
}

AutomatedModuleSetup(Module, () => window.location.pathname.endsWith('/videos'));
