// ==UserScript==
// @name        tv.twitch; channel - automatically click 'return to stream' button
// @match       *://www.twitch.tv/*
// @version     1.0.0
// @description 2025/11/07
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

const MODNAME = 'Return To Stream';

import { Core_Console_Log } from './lib/ericchase/Core_Console_Log.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { SubscribeToUrlChange } from './lib/HistoryObserver.js';
import { InitModuleSetupHandler, ModuleInterface } from './lib/UserScriptModule.js';

class Module implements ModuleInterface {
  observer1?: Class_WebPlatform_DOM_Element_Added_Observer_Class;
  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${MODNAME}`);
    this.observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'button',
    });
    this.observer1.subscribe((element1) => {
      if (element1 instanceof HTMLButtonElement) {
        if (element1.textContent === 'Return to stream') {
          Core_Console_Log(`[Twitch Mod] ${MODNAME}: Returning.`);
          element1.click();
        }
      }
    });
  }
  cleanup() {
    Core_Console_Log(`[Twitch Mod]: Clean Up: ${MODNAME}`);
    this.observer1?.disconnect();
  }
}

SubscribeToUrlChange(InitModuleSetupHandler(Module));
