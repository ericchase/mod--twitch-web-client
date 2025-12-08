// ==UserScript==
// @name        tv.twitch; click x button on channel preview for unwanted twitch
// @match       *://www.twitch.tv/*
// @version     1.0.0
// @description 2025/11/21
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Core_Console_Log } from '../src/lib/ericchase/Core_Console_Log.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from '../src/lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { AutomatedModuleSetup, ModuleInterface } from '../src/lib/UserScriptModule.js';

class Module implements ModuleInterface {
  name = 'TEMP';
  observer_set = new Set<Class_WebPlatform_DOM_Element_Added_Observer_Class>();
  div_set = new Set<HTMLDivElement>();

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
    setInterval(() => {
      for (const element of this.div_set) {
        element.click();
        this.div_set.delete(element);
        break;
      }
    }, 500);
  }

  createObserver1() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'div.uttv-hide-item.uttv-channel',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      if (element instanceof HTMLDivElement) {
        this.div_set.add(element);
      }
    });
  }
}

AutomatedModuleSetup(Module, () => true);
