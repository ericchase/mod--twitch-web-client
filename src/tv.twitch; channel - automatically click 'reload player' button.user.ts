// ==UserScript==
// @name        tv.twitch; channel - automatically click 'reload player' button
// @match       *://www.twitch.tv/*
// @version     1.1.0
// @description 2025/09/22
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Core_Console_Error } from './lib/ericchase/Core_Console_Error.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { SubscribeToUrlChange } from './lib/HistoryObserver.js';
import { InitModuleSetupHandler, ModuleInterface } from './lib/UserScriptModule.js';

class Module implements ModuleInterface {
  observer1?: Class_WebPlatform_DOM_Element_Added_Observer_Class;
  setup() {
    console.log('setup reload player');
    this.observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'button',
    });
    this.observer1.subscribe((element1) => {
      if (element1.textContent === 'Click Here to Reload Player') {
        Core_Console_Error('Player crashed. Reloading.');
        window.location.reload();
      }
    });
  }
  cleanup() {
    console.log('cleanup reload player');
    this.observer1?.disconnect();
  }
}

SubscribeToUrlChange(InitModuleSetupHandler(Module));
