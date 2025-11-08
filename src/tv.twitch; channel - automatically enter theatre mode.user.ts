// ==UserScript==
// @name        tv.twitch; channel - automatically enter theatre mode
// @match       *://www.twitch.tv/*
// @version     1.1.1
// @description 2025/09/23
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

const MODNAME = 'Enter Theatre Mode';

import { Core_Console_Log } from './lib/ericchase/Core_Console_Log.js';
import { Class_WebPlatform_DOM_Attribute_Observer_Class, WebPlatform_DOM_Attribute_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Attribute_Observer_Class.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { SubscribeToUrlChange } from './lib/HistoryObserver.js';
import { InitModuleSetupHandler, ModuleInterface } from './lib/UserScriptModule.js';

class Module implements ModuleInterface {
  observer1?: Class_WebPlatform_DOM_Element_Added_Observer_Class;
  observer2?: Class_WebPlatform_DOM_Attribute_Observer_Class;
  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${MODNAME}`);
    this.observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'button[aria-label="Theatre Mode (alt+t)"]',
    });
    this.observer1.subscribe((element1) => {
      if (element1 instanceof HTMLButtonElement) {
        this.observer1?.disconnect();
        this.automatedClick(element1);
        this.observer2 = WebPlatform_DOM_Attribute_Observer_Class({
          options: {
            attributeFilter: ['aria-label'],
          },
          source: element1,
        });
        this.observer2.subscribe(() => {
          if (element1.getAttribute('aria-label') === 'Theatre Mode (alt+t)') {
            Core_Console_Log(`[Twitch Mod] ${MODNAME}: Enter Theatre Mode.`);
            this.automatedClick(element1);
          }
        });
      }
    });
  }
  cleanup() {
    Core_Console_Log(`[Twitch Mod]: Clean Up: ${MODNAME}`);
    this.observer1?.disconnect();
    this.observer2?.disconnect();
  }
  automatedClick(button: HTMLButtonElement) {
    button.removeEventListener('click', this.manualClick);
    button.click();
    button.addEventListener('click', this.manualClick);
  }
  manualClick() {
    Core_Console_Log(`[Twitch Mod] ${MODNAME}: Switching To User Control.`);
    this.cleanup();
  }
}

SubscribeToUrlChange(InitModuleSetupHandler(Module));
