// ==UserScript==
// @name        tv.twitch; channel - mute ads
// @include     /^https:\/\/www\.twitch\.tv\/(?!directory).+$/
// @version     1.0.0
// @description 2025/10/09
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/browseruserscripts
// ==/UserScript==

import { WebPlatform_DOM_Element_Added_Observer_Class } from './lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.js';

let main_video: HTMLVideoElement | undefined = undefined;
const observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
  selector: 'video',
});
observer1.subscribe((element1) => {
  if (element1.matches('main video')) {
    main_video = element1 as HTMLVideoElement;
  }
});

const observer2 = WebPlatform_DOM_Element_Added_Observer_Class({
  selector: '[data-a-target="video-ad-label"]',
});
observer2.subscribe((element1) => {
  MuteMainVideo();
  WatchForRemoval(element1);
});

function WatchForRemoval(element: Element) {
  if (element.isConnected) {
    setTimeout(() => {
      WatchForRemoval(element);
    }, 1000);
  } else {
    UnmuteMainVideo();
  }
}

function MuteMainVideo() {
  if (main_video) {
    main_video.muted = true;
    main_video.style.setProperty('display', 'none');
  }
}
function UnmuteMainVideo() {
  if (main_video) {
    main_video.muted = false;
    main_video.style.removeProperty('display');
  }
}
