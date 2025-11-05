// ==UserScript==
// @name        tv.twitch; all - enlarge channel card avatar
// @include     /^https:\/\/www\.twitch\.tv\/?.*$/
// @version     1.0.1
// @description 2025/10/01
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

import { WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';

// <img class="tw-image-avatar" src="https://static-cdn.jtvnw.net/jtv_user_pictures/207d3680-6ff4-45e8-9c21-34aaee0e76fb-profile_image-50x50.png">

const resolution_regex = /50x50/;
const desired_resolution = '150x150';

const observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
  selector: 'div[class*="ScImageWrapper"]:has(img.tw-image-avatar)',
});
observer1.subscribe((element1) => {
  const observer2 = WebPlatform_DOM_Element_Added_Observer_Class({
    selector: 'img.tw-image-avatar',
    source: element1,
  });
  observer2.subscribe((element2) => {
    updateThumbnailSrc(element2);
  });
});

function updateThumbnailSrc(thumbnail: Element) {
  const src = thumbnail.getAttribute('src');
  if (src) {
    const src_url = new URL(src.replace(resolution_regex, desired_resolution));
    thumbnail.setAttribute('src', src_url.toString());
  }
}
