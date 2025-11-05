// ==UserScript==
// @name        tv.twitch; following - periodically update live previews
// @include     /^https:\/\/www\.twitch\.tv\/directory\/following\/?.*$/
// @version     1.0.3
// @description 2025/09/22
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';

// <img class="tw-image" src="https://static-cdn.jtvnw.net/previews-ttv/live_user_USERNAME-320x180.jpg">
// <img class="tw-image" src="https://static-cdn.jtvnw.net/previews-ttv/live_user_USERNAME-440x248.jpg">

const update_interval = 5 * 1000;
const thumbnail_set = new Set<Element>();
const resolution_regex = /320x180|440x248/;
const desired_resolution = '640x360';
let arbitrary_counter = 0;

const observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
  selector: 'img[class="tw-image"]',
});
observer1.subscribe((element1) => {
  if (element1.getAttribute('src')?.match(resolution_regex)?.index) {
    if (thumbnail_set.size === 0) {
      // kick off the update cycle
      setTimeout(updateAllThumbnails, update_interval);
    }
    thumbnail_set.add(element1);
    updateThumbnailSrc(element1);
  }
});

function updateThumbnailSrc(thumbnail: Element) {
  const src = thumbnail.getAttribute('src');
  if (src) {
    const src_url = new URL(src.replace(resolution_regex, desired_resolution));
    src_url.searchParams.set('ac', arbitrary_counter.toString(10));
    thumbnail.setAttribute('src', src_url.toString());
    arbitrary_counter++;
  }
}

function updateAllThumbnails() {
  for (const thumbnail of thumbnail_set) {
    updateThumbnailSrc(thumbnail);
  }
  if (arbitrary_counter > 999_999) {
    arbitrary_counter = 0;
  }
  setTimeout(updateAllThumbnails, update_interval);
}
