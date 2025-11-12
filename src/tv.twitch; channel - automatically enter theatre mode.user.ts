// ==UserScript==
// @name        tv.twitch; channel - automatically enter theatre mode
// @match       *://www.twitch.tv/*
// @version     1.2.1
// @description 2025/09/23
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Core_Console_Log } from './lib/ericchase/Core_Console_Log.js';
import { Class_WebPlatform_DOM_Attribute_Observer_Class, WebPlatform_DOM_Attribute_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Attribute_Observer_Class.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { AutomatedModuleSetup, ModuleInterface } from './lib/UserScriptModule.js';

class Module implements ModuleInterface {
  name = 'Enter Theatre Mode';
  event_map = new Map<HTMLElement, () => void>();
  observer_set = new Set<Class_WebPlatform_DOM_Element_Added_Observer_Class | Class_WebPlatform_DOM_Attribute_Observer_Class>();

  button_found = false;

  clean() {
    Core_Console_Log(`[Twitch Mod]: Clean: ${this.name}`);
    for (const [element, handler] of this.event_map) {
      if (handler) {
        element.removeEventListener('click', handler);
      }
    }
    this.event_map.clear();
    for (const observer of this.observer_set) {
      observer.disconnect();
    }
    this.observer_set.clear();
  }

  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${this.name}`);
    this.createObserver1();
  }

  removeButtonHandler(element: HTMLButtonElement) {
    const handler = this.event_map.get(element);
    if (handler) {
      element.removeEventListener('click', handler);
      this.event_map.delete(element);
    }
  }

  addButtonHandler(element: HTMLButtonElement) {
    const handler = () => void this.manualClick();
    this.event_map.set(element, handler);
    element.addEventListener('click', handler);
  }

  createObserver1() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'button[aria-label="Theatre Mode (alt+t)"]',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      if (this.button_found === false && element instanceof HTMLButtonElement) {
        this.button_found = true;
        observer.disconnect();
        this.createObserver2(element);
      }
    });
  }

  createObserver2(element: HTMLButtonElement) {
    this.automatedClick(element);
    const observer = WebPlatform_DOM_Attribute_Observer_Class({
      options: {
        attributeFilter: ['aria-label'],
      },
      source: element,
    });
    this.observer_set.add(observer);
    observer.subscribe(() => {
      if (element.getAttribute('aria-label') === 'Theatre Mode (alt+t)') {
        this.automatedClick(element);
      }
    });
  }

  automatedClick(element: HTMLButtonElement) {
    Core_Console_Log(`[Twitch Mod]: ${this.name}: Click Button.`);
    this.removeButtonHandler(element);
    element.click();
    this.addButtonHandler(element);
  }

  manualClick() {
    this.clean();
  }
}

AutomatedModuleSetup(Module, () => !window.location.pathname.startsWith('/directory'));
