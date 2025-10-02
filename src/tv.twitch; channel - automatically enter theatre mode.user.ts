// ==UserScript==
// @name        tv.twitch; channel - automatically enter theatre mode
// @include     /^https:\/\/www\.twitch\.tv\/(?!directory).+$/
// @version     1.0.1
// @description 2025/09/23
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/browseruserscripts
// ==/UserScript==

import { WebPlatform_DOM_Attribute_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Attribute_Observer_Class.js';
import { WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';

const observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
  selector: 'button[aria-label="Theatre Mode (alt+t)"]',
});
observer1.subscribe((element1) => {
  observer1.disconnect();
  (element1 as HTMLButtonElement).click();
  const observer2 = WebPlatform_DOM_Attribute_Observer_Class({
    options: {
      attributeFilter: ['aria-label'],
    },
    source: element1,
  });
  observer2.subscribe(() => {
    if (element1.getAttribute('aria-label') === 'Theatre Mode (alt+t)') {
      (element1 as HTMLButtonElement).click();
    }
  });
});
