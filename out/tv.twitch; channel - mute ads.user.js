// ==UserScript==
// @name        tv.twitch; channel - mute ads
// @match       *://www.twitch.tv/*
// @version     1.0.1
// @description 2025/10/09
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

// src/lib/HistoryObserver.ts
function SubscribeToUrlChange(callback) {
  if (window.history.isObserverSetUp !== true) {
    console.log('setup history observer');
    window.history.isObserverSetUp = true;
    window.history.onUrlChangeSubscriptions = new Set();
    window.history.originalPushState = window.history.pushState;
    window.history.originalReplaceState = window.history.replaceState;
    window.history.pushState = function (...args) {
      window.history.originalPushState.apply(this, args);
      for (const fn of window.history.onUrlChangeSubscriptions) {
        fn();
      }
    };
    window.history.replaceState = function (...args) {
      window.history.originalReplaceState.apply(this, args);
      for (const fn of window.history.onUrlChangeSubscriptions) {
        fn();
      }
    };
  }
  window.history.onUrlChangeSubscriptions.add(callback);
}

// src/lib/ericchase/Core_Promise_Deferred_Class.ts
class Class_Core_Promise_Deferred_Class {
  promise;
  reject;
  resolve;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    if (this.resolve === undefined || this.reject === undefined) {
      throw new Error(`${Class_Core_Promise_Deferred_Class.name}'s constructor failed to setup promise functions.`);
    }
  }
}
function Core_Promise_Deferred_Class() {
  return new Class_Core_Promise_Deferred_Class();
}

// src/lib/ericchase/Core_Promise_Orphan.ts
function Core_Promise_Orphan(promise) {}

// src/lib/ericchase/Core_Utility_Debounce.ts
function Core_Utility_Debounce(fn, delay_ms) {
  let deferred = Core_Promise_Deferred_Class();
  let timeout = undefined;
  async function async_callback(...args) {
    try {
      await fn(...args);
      deferred.resolve();
    } catch (error) {
      deferred.reject(error);
    } finally {
      deferred = Core_Promise_Deferred_Class();
    }
  }
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      Core_Promise_Orphan(async_callback(...args));
    }, delay_ms);
    return deferred.promise;
  };
}

// src/lib/UserScriptModule.ts
function InitModuleSetupHandler(constructor) {
  let module_instance = undefined;
  const debouncedSetup = Core_Utility_Debounce(() => {
    if (window.location.pathname.startsWith('/directory') !== true) {
      module_instance = new constructor();
      module_instance.setup();
    }
  }, 2500);
  debouncedSetup();
  return function () {
    module_instance?.cleanup();
    module_instance = undefined;
    debouncedSetup();
  };
}

// src/tv.twitch; channel - mute ads.user.ts
class Module {
  main_video;
  secondary_video;
  timer;
  watchAdElement(element) {
    if (element.isConnected) {
      this.muteMainVideo();
      this.maximizeSecondaryVideo();
      this.timer = setTimeout(() => {
        this.watchAdElement(element);
      }, 1000);
    } else {
      this.unmuteMainVideo();
      this.restoreSecondaryVideo();
    }
  }
  muteMainVideo() {
    if (this.main_video) {
      this.main_video.muted = true;
      this.main_video.style.setProperty('display', 'none');
    }
  }
  unmuteMainVideo() {
    if (this.main_video) {
      this.main_video.muted = false;
      this.main_video.style.removeProperty('display');
    }
  }
  maximizeSecondaryVideo() {
    if (this.main_video && this.secondary_video) {
      const { width, height, top, left } = this.main_video.getBoundingClientRect();
      this.secondary_video.style.setProperty('width', width + 'px');
      this.secondary_video.style.setProperty('height', height + 'px');
      this.secondary_video.style.setProperty('top', top + '');
      this.secondary_video.style.setProperty('left', left + '');
      this.secondary_video.style.setProperty('position', 'fixed');
      this.secondary_video.style.setProperty('z-index', '99999');
    }
  }
  restoreSecondaryVideo() {
    if (this.secondary_video) {
      this.secondary_video.style.removeProperty('width');
      this.secondary_video.style.removeProperty('height');
      this.secondary_video.style.removeProperty('top');
      this.secondary_video.style.removeProperty('left');
      this.secondary_video.style.removeProperty('position');
      this.secondary_video.style.removeProperty('z-index');
    }
  }
  observer1;
  observer2;
  setup() {
    console.log('setup mute ads');
    this.observer1 = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'video',
    });
    this.observer1.subscribe((element1) => {
      if (element1.matches('main video')) {
        this.main_video = element1;
      } else {
        this.secondary_video = element1;
      }
    });
    this.observer2 = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: '[data-a-target="video-ad-label"]',
    });
    this.observer2.subscribe((element1) => {
      this.watchAdElement(element1);
    });
  }
  cleanup() {
    console.log('cleanup mute ads');
    clearTimeout(this.timer);
    this.observer1?.disconnect();
    this.observer2?.disconnect();
    this.unmuteMainVideo();
    this.restoreSecondaryVideo();
  }
}
SubscribeToUrlChange(InitModuleSetupHandler(Module));
