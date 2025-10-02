// ==UserScript==
// @name        tv.twitch; channel - automatically click 'reload player' button
// @include     /^https:\/\/www\.twitch\.tv\/(?!directory).+$/
// @version     1.0.1
// @description 2025/09/22
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/browseruserscripts
// ==/UserScript==

import { Core_Console_Error } from './lib/ericchase/Core_Console_Error.js';
import { WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';

const observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
  selector: 'button',
});
observer1.subscribe((element1) => {
  if (element1.textContent === 'Click Here to Reload Player') {
    Core_Console_Error('Player crashed. Reloading.');
    window.location.reload();
  }
});
