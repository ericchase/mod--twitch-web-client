// ==UserScript==
// @name        tv.twitch.m; channel - keep video visible
// @match       *://m.twitch.tv/*
// @version     1.0.8
// @description 2026/01/19
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Core_Console_Log } from './lib/ericchase/Core_Console_Log.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { AutomatedModuleSetup, ModuleInterface } from './lib/UserScriptModule.js';

class Module implements ModuleInterface {
  name = 'Keep Video Visible';
  observer_set = new Set<Class_WebPlatform_DOM_Element_Added_Observer_Class>();

  video_container_set = new Set<HTMLDivElement>();
  scrollHandler = (event: Event) => {
    console.log('window.visualViewport.offsetTop:', window?.visualViewport?.offsetTop);
    for (const div of this.video_container_set) {
      div.style.setProperty('top', `${window?.visualViewport?.offsetTop ?? 0}px`);
    }
  };

  clean() {
    Core_Console_Log(`[Twitch Mod]: Clean: ${this.name}`);
    window?.visualViewport?.removeEventListener('scroll', this.scrollHandler);
    for (const observer of this.observer_set) {
      observer.disconnect();
    }
    this.observer_set.clear();
  }

  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${this.name}`);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('scroll', this.scrollHandler);
    } else {
      console.log('no window.visualViewport:', window.visualViewport);
    }
    this.createObserver1();
  }

  createObserver1() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'main',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Found main:`, element);
      this.createObserver2(element);
    });
  }

  createObserver2(main: Element) {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      source: main,
      selector: 'div',
      options: {
        subtree: false,
      },
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Found main>div:`, element);
      this.createObserver3(element);
    });
  }

  createObserver3(div: Element) {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      source: div,
      selector: 'div',
      options: {
        subtree: false,
      },
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Found main>div>div:`, element);
      this.createObserver4(element);
    });
  }

  createObserver4(div: Element) {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      source: div,
      selector: 'div',
      options: {
        subtree: false,
      },
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Found child div:`, element);
      this.createObserver5(element);
    });
  }

  createObserver5(div: Element) {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      source: div,
      selector: 'video',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      Core_Console_Log(`[Twitch Mod]: ${this.name}: Found child div with video:`, div);
      if (div instanceof HTMLDivElement) {
        const div_rect = div.getBoundingClientRect();
        // add margin to the header div
        if (div.previousElementSibling instanceof HTMLDivElement) {
          div.previousElementSibling.style.setProperty('margin-top', `${div_rect.height}px`);
        }
        // setup video container
        this.video_container_set.add(div);
        div.style.setProperty('position', 'absolute', 'important');
        div.style.setProperty('width', '100%');
        div.style.setProperty('aspect-ratio', '16/9');
        div.style.setProperty('z-index', '9999');
      }
    });
  }
}

AutomatedModuleSetup(Module, () => !window.location.pathname.startsWith('/directory'));
