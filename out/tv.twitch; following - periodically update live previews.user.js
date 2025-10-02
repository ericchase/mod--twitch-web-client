// ==UserScript==
// @name        tv.twitch; following - periodically update live previews
// @include     /^https:\/\/www\.twitch\.tv\/directory\/following\/?.*$/
// @version     1.0.2
// @description 2025/09/22
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/browseruserscripts
// ==/UserScript==

// src/lib/ericchase/WebPlatform_DOM_Element_Added_Observer_Class.ts
class Class_WebPlatform_DOM_Element_Added_Observer_Class {
  config;
  $match_set = new Set();
  $mutation_observer;
  $subscription_set = new Set();
  constructor(config) {
    this.config = {
      include_existing_elements: config.include_existing_elements ?? true,
      options: {
        subtree: config.options?.subtree ?? true,
      },
      selector: config.selector,
      source: config.source ?? document.documentElement,
    };
    this.$mutation_observer = new MutationObserver((mutationRecords) => {
      const sent_set = new Set();
      for (const record of mutationRecords) {
        for (const node of record.addedNodes) {
          const tree_walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
          const processCurrentNode = () => {
            if (sent_set.has(tree_walker.currentNode) === false) {
              if (tree_walker.currentNode instanceof Element && tree_walker.currentNode.matches(this.config.selector) === true) {
                this.$send(tree_walker.currentNode);
                sent_set.add(tree_walker.currentNode);
              }
            }
          };
          processCurrentNode();
          if (this.config.options.subtree === true) {
            while (tree_walker.nextNode()) {
              processCurrentNode();
            }
          }
        }
      }
    });
    this.$mutation_observer.observe(this.config.source, {
      childList: true,
      subtree: this.config.options.subtree,
    });
    if (this.config.include_existing_elements === true) {
      if (this.config.options.subtree === true) {
        const sent_set = new Set();
        const tree_walker = document.createTreeWalker(this.config.source, NodeFilter.SHOW_ELEMENT);
        const processCurrentNode = () => {
          if (sent_set.has(tree_walker.currentNode) === false) {
            if (tree_walker.currentNode instanceof Element && tree_walker.currentNode.matches(this.config.selector) === true) {
              this.$send(tree_walker.currentNode);
              sent_set.add(tree_walker.currentNode);
            }
          }
        };
        while (tree_walker.nextNode()) {
          processCurrentNode();
        }
      } else {
        for (const child of this.config.source.childNodes) {
          if (child instanceof Element && child.matches(this.config.selector) === true) {
            this.$send(child);
          }
        }
      }
    }
  }
  disconnect() {
    this.$mutation_observer.disconnect();
    for (const callback of this.$subscription_set) {
      this.$subscription_set.delete(callback);
    }
  }
  subscribe(callback) {
    this.$subscription_set.add(callback);
    let abort = false;
    for (const element of this.$match_set) {
      callback(element, () => {
        this.$subscription_set.delete(callback);
        abort = true;
      });
      if (abort) {
        return () => {};
      }
    }
    return () => {
      this.$subscription_set.delete(callback);
    };
  }
  $send(element) {
    this.$match_set.add(element);
    for (const callback of this.$subscription_set) {
      callback(element, () => {
        this.$subscription_set.delete(callback);
      });
    }
  }
}
function WebPlatform_DOM_Element_Added_Observer_Class(config) {
  return new Class_WebPlatform_DOM_Element_Added_Observer_Class(config);
}

// src/tv.twitch; following - periodically update live previews.user.ts
var update_interval = 5 * 1000;
var thumbnail_set = new Set();
var resolution_regex = /320x180|440x248/;
var desired_resolution = '640x360';
var arbitrary_counter = 0;
var observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
  selector: 'img[class="tw-image"]',
});
observer1.subscribe((element1) => {
  if (element1.getAttribute('src')?.match(resolution_regex)?.index) {
    if (thumbnail_set.size === 0) {
      setTimeout(updateAllThumbnails, update_interval);
    }
    thumbnail_set.add(element1);
    updateThumbnailSrc(element1);
  }
});
function updateThumbnailSrc(thumbnail) {
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
  if (arbitrary_counter > 999999) {
    arbitrary_counter = 0;
  }
  setTimeout(updateAllThumbnails, update_interval);
}
