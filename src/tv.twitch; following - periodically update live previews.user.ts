// ==UserScript==
// @name        tv.twitch; following - periodically update live previews
// @match       *://www.twitch.tv/*
// @version     1.1.1
// @description 2025/09/22
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { Core_Console_Log } from './lib/ericchase/Core_Console_Log.js';
import { Class_WebPlatform_DOM_Attribute_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Attribute_Observer_Class.js';
import { Class_WebPlatform_DOM_Element_Added_Observer_Class, WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';
import { AutomatedModuleSetup, ModuleInterface } from './lib/UserScriptModule.js';

// <img class="tw-image" src="https://static-cdn.jtvnw.net/previews-ttv/live_user_USERNAME-320x180.jpg">
// <img class="tw-image" src="https://static-cdn.jtvnw.net/previews-ttv/live_user_USERNAME-440x248.jpg">

const desired_resolution = '640x360';
const resolution_regex = /320x180|440x248/;
const update_interval = 5 * 1000;

class Module implements ModuleInterface {
  name = 'Update Live Previews';
  observer_set = new Set<Class_WebPlatform_DOM_Element_Added_Observer_Class | Class_WebPlatform_DOM_Attribute_Observer_Class>();

  timer?: ReturnType<typeof setTimeout>;

  arbitrary_counter = 0;
  thumbnail_set = new Set<Element>();

  clean() {
    Core_Console_Log(`[Twitch Mod]: Clean: ${this.name}`);
    for (const observer of this.observer_set) {
      observer.disconnect();
    }
    this.observer_set.clear();

    clearTimeout(this.timer);
    this.timer = undefined;

    this.arbitrary_counter = 0;
    this.thumbnail_set.clear();
  }

  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${this.name}`);
    this.createObserver1();
  }

  createObserver1() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'img[class="tw-image"]',
    });
    observer.subscribe((element) => {
      if (element.getAttribute('src')?.match(resolution_regex)?.index) {
        if (this.thumbnail_set.size === 0) {
          this.timer = setTimeout(() => void this.updateAllThumbnails(), update_interval);
        }
        this.thumbnail_set.add(element);
        this.updateThumbnailSrc(element);
      }
    });
  }

  updateAllThumbnails() {
    Core_Console_Log(`[Twitch Mod]: ${this.name}: Updating Thumbnails.`);
    for (const thumbnail of this.thumbnail_set) {
      this.updateThumbnailSrc(thumbnail);
    }
    if (this.arbitrary_counter > 999_999) {
      this.arbitrary_counter = 0;
    }
    this.timer = setTimeout(() => void this.updateAllThumbnails(), update_interval);
  }

  updateThumbnailSrc(thumbnail: Element) {
    const src = thumbnail.getAttribute('src');
    if (src) {
      const src_url = new URL(src.replace(resolution_regex, desired_resolution));
      src_url.searchParams.set('ac', this.arbitrary_counter.toString(10));
      thumbnail.setAttribute('src', src_url.toString());
      this.arbitrary_counter++;
    }
  }
}

AutomatedModuleSetup(Module, () => /directory\/following\/?.*$/.test(window.location.pathname));
