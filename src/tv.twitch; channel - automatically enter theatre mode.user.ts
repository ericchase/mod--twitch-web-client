// ==UserScript==
// @name        tv.twitch; channel - automatically enter theatre mode
// @match       *://www.twitch.tv/*
// @version     1.1.0
// @description 2025/09/23
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Class_WebPlatform_DOM_Attribute_Observer_Class, WebPlatform_DOM_Attribute_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Attribute_Observer_Class.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { SubscribeToUrlChange } from './lib/HistoryObserver.js';
import { InitModuleSetupHandler, ModuleInterface } from './lib/UserScriptModule.js';

// TODO: when theatre mode button is clicked, allow exit

class Module implements ModuleInterface {
  observer1?: Class_WebPlatform_DOM_Element_Added_Observer_Class;
  observer2?: Class_WebPlatform_DOM_Attribute_Observer_Class;
  setup() {
    console.log('setup theatre mode');
    this.observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'button[aria-label="Theatre Mode (alt+t)"]',
    });
    this.observer1.subscribe((element1) => {
      if (element1 instanceof HTMLButtonElement) {
        this.observer1?.disconnect();
        element1.click();
        this.observer2 = WebPlatform_DOM_Attribute_Observer_Class({
          options: {
            attributeFilter: ['aria-label'],
          },
          source: element1,
        });
        this.observer2.subscribe(() => {
          if (element1.getAttribute('aria-label') === 'Theatre Mode (alt+t)') {
            element1.click();
          }
        });
      }
    });
  }
  cleanup() {
    console.log('cleanup theatre mode');
    this.observer1?.disconnect();
    this.observer2?.disconnect();
  }
}

SubscribeToUrlChange(InitModuleSetupHandler(Module));
