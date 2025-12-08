// ==UserScript==
// @name        tv.twitch; channel - mute ads
// @match       *://www.twitch.tv/*
// @version     2.0.0
// @description 2025/10/09
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

// src/lib/ericchase/Core_Console_Log.ts
function Core_Console_Log(...items) {
  console['log'](...items);
}

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

// src/lib/ericchase/WebPlatform_Utility_Ancestor_Node.ts
function WebPlatform_Utility_Get_Ancestor_List(node) {
  const list = [];
  let parent = node.parentNode;
  while (parent !== null) {
    list.push(parent);
    parent = parent.parentNode;
  }
  return list.toReversed();
}
function WebPlatform_Utility_Get_Closest_Common_Ancestor(...nodes) {
  if (nodes.length > 0) {
    const ancestor_lists = [];
    for (const node of nodes) {
      ancestor_lists.push(WebPlatform_Utility_Get_Ancestor_List(node));
    }
    let inner_list_min_length = ancestor_lists[0].length;
    for (let i = 1; i < ancestor_lists.length; i++) {
      if (ancestor_lists[i].length < inner_list_min_length) {
        inner_list_min_length = ancestor_lists[i].length;
      }
    }
    let current_common_ancestor = undefined;
    for (let inner_list_i = 0; inner_list_i < inner_list_min_length; inner_list_i++) {
      let is_common = true;
      for (let ancestor_lists_i = 1; ancestor_lists_i < ancestor_lists.length; ancestor_lists_i++) {
        if (ancestor_lists[0][inner_list_i] !== ancestor_lists[ancestor_lists_i][inner_list_i]) {
          is_common = false;
          break;
        }
      }
      if (is_common === true) {
        current_common_ancestor = ancestor_lists[0][inner_list_i];
      }
    }
    return current_common_ancestor;
  }
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

// src/lib/HistoryObserver.ts
function SubscribeToUrlChange(callback) {
  if (window.history.isObserverSetUp !== true) {
    Core_Console_Log(`[Twitch Mod]: Setup: History Observer`);
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

// src/lib/UserScriptModule.ts
function AutomatedModuleSetup(constructor, matches_url) {
  const module_instance = new constructor();
  const startup_handler = Core_Utility_Debounce(() => {
    module_instance.clean();
    if (matches_url()) {
      module_instance.setup();
    }
  }, 1000);
  startup_handler();
  SubscribeToUrlChange(startup_handler);
}

// src/tv.twitch; channel - mute ads.user.ts
function isPrimaryVideoPlayer(element) {
  if (element.matches('main video')) {
    return true;
  }
  return false;
}
var VideoManager = new (class {
  video_map = new Map();
  primary_video_count = 0;
  secondary_video_count = 0;
  ads_running = false;
  cache_muted = false;
  cache_volume = 0;
  restore_styles_list = [];
  clean() {
    this.adsStopped();
    this.video_map.clear();
    this.primary_video_count = 0;
    this.secondary_video_count = 0;
  }
  addVideo(element) {
    const obj = {
      element,
      is_connected: true,
      is_modified: false,
      is_muted: false,
      is_primary: isPrimaryVideoPlayer(element),
    };
    this.video_map.set(element, obj);
    if (obj.is_primary === true) {
      if (this.ads_running === true) {
        this.modifyPrimaryVideo(obj);
      }
      VideoManager.primary_video_count++;
    } else {
      VideoManager.secondary_video_count++;
      if (this.ads_running === true) {
        this.modifySecondaryVideo(obj);
      } else {
        setTimeout(() => {
          if (this.ads_running !== true) {
            const primary_obj = this.getPrimaryVideoObject();
            if (primary_obj !== undefined) {
              primary_obj.is_muted = true;
              this.cache_muted = primary_obj.element.muted;
              this.cache_volume = primary_obj.element.volume;
              primary_obj.element.muted = true;
            }
          }
        }, 1e4);
      }
    }
    return obj;
  }
  removeVideo(element) {
    const obj = this.video_map.get(element);
    if (obj === undefined) {
      return;
    }
    this.video_map.delete(element);
    if (obj.is_primary === true) {
      VideoManager.primary_video_count--;
    } else {
      VideoManager.secondary_video_count--;
    }
  }
  modifyPrimaryVideo(obj) {
    if (obj.is_modified !== true) {
      obj.is_modified = true;
      if (obj.is_muted === false) {
        obj.is_muted = true;
        this.cache_muted = obj.element.muted;
        this.cache_volume = obj.element.volume;
        obj.element.muted = true;
      }
      obj.element.style.setProperty('opacity', '0');
    }
  }
  modifySecondaryVideo(obj) {
    if (obj.is_modified !== true) {
      obj.is_modified = true;
      obj.element.muted = this.cache_muted;
      obj.element.volume = this.cache_volume;
      const primary_obj = this.getPrimaryVideoObject();
      if (primary_obj !== undefined) {
        const rect = obj.element.getBoundingClientRect();
        const primary_rect = primary_obj.element.getBoundingClientRect();
        obj.element.style.setProperty('width', `${primary_rect.width}px`);
        obj.element.style.setProperty('height', `${primary_rect.height}px`);
        obj.element.style.setProperty('top', `${primary_rect.top - rect.top}px`);
        obj.element.style.setProperty('left', `${primary_rect.left - rect.left}px`);
        const common_ancestor = WebPlatform_Utility_Get_Closest_Common_Ancestor(obj.element, primary_obj.element);
        if (common_ancestor !== undefined) {
          const secondary_ancestor_list = WebPlatform_Utility_Get_Ancestor_List(obj.element);
          const common_ancestor_index = secondary_ancestor_list.indexOf(common_ancestor);
          if (common_ancestor_index !== -1) {
            for (let i = common_ancestor_index + 1; i < secondary_ancestor_list.length; i++) {
              const ancestor = secondary_ancestor_list[i];
              if (ancestor instanceof HTMLElement) {
                if (window.getComputedStyle(ancestor).overflow !== 'visible') {
                  this.restore_styles_list.push([ancestor, 'overflow', ancestor.style.getPropertyValue('overflow')]);
                  ancestor.style.setProperty('overflow', 'visible');
                }
              }
            }
            for (let i = common_ancestor_index + 1; i < secondary_ancestor_list.length; i++) {
              const ancestor = secondary_ancestor_list[i];
              if (ancestor instanceof HTMLElement) {
                this.restore_styles_list.push([ancestor, 'z-index', ancestor.style.getPropertyValue('z-index')]);
                ancestor.style.setProperty('z-index', '99999');
                break;
              }
            }
          }
        }
      }
    }
  }
  restorePrimaryVideo(obj) {
    if (obj.is_modified === true) {
      obj.is_modified = false;
      obj.is_muted = false;
      obj.element.muted = this.cache_muted;
      obj.element.style.removeProperty('opacity');
    }
  }
  restoreSecondaryVideo(obj) {
    if (obj.is_modified === true) {
      obj.is_modified = false;
      obj.element.muted = true;
      obj.element.style.removeProperty('width');
      obj.element.style.removeProperty('height');
      obj.element.style.removeProperty('top');
      obj.element.style.removeProperty('left');
    }
  }
  adsStarted() {
    this.ads_running = true;
    for (const [_, obj] of this.entries()) {
      if (obj.is_modified !== true) {
        if (obj.is_primary === true) {
          this.modifyPrimaryVideo(obj);
        } else {
          this.modifySecondaryVideo(obj);
        }
      }
    }
  }
  adsStopped() {
    this.ads_running = false;
    for (const [_, obj] of this.entries()) {
      if (obj.is_modified === true) {
        if (obj.is_primary === true) {
          this.restorePrimaryVideo(obj);
        } else {
          this.restoreSecondaryVideo(obj);
        }
      }
    }
    for (const [element, property, value] of this.restore_styles_list) {
      if (value === '') {
        element.style.removeProperty(property);
      } else {
        element.style.setProperty(property, value);
      }
    }
  }
  getPrimaryVideoObject() {
    for (const [_, obj] of this.entries()) {
      if (obj.is_primary === true) {
        return obj;
      }
    }
  }
  *entries() {
    for (const [element, obj] of this.video_map) {
      if (element.isConnected === true) {
        yield [element, obj];
      } else {
        obj.is_connected = false;
      }
    }
  }
})();

class Module {
  name = 'Mute Ads';
  observer_set = new Set();
  adlabel_set = new Set();
  maintag_set = new Set();
  ads_timer;
  clean() {
    Core_Console_Log(`[Twitch Mod]: Clean: ${this.name}`);
    for (const observer of this.observer_set) {
      observer.disconnect();
    }
    this.observer_set.clear();
    this.adlabel_set.clear();
    for (const element of this.maintag_set) {
      element.style.removeProperty('z-index');
    }
    this.maintag_set.clear();
    VideoManager.clean();
    clearTimeout(this.ads_timer);
    this.ads_timer = undefined;
  }
  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${this.name}`);
    this.createAddedObserver_AdLabels();
    this.createAddedObserver_MainTag();
    this.createAddedObserver_VideoElements();
  }
  adsStarted() {
    VideoManager.adsStarted();
    this.watchAdLabels();
  }
  adsStopped() {
    VideoManager.adsStopped();
  }
  watchAdLabels() {
    if (isAnyElementConnected(this.adlabel_set) === true) {
      this.ads_timer = setTimeout(() => this.watchAdLabels(), 250);
    } else {
      clearTimeout(this.ads_timer);
      this.ads_timer = undefined;
      this.adsStopped();
    }
  }
  addAdLabel(element) {
    Core_Console_Log(`[Twitch Mod]: ${this.name}: Ad Label Found:`, element);
    this.adlabel_set.add(element);
    this.adsStarted();
  }
  addMainTag(element) {
    this.maintag_set.add(element);
  }
  addVideoElement(element) {
    const obj = VideoManager.addVideo(element);
    Core_Console_Log(`[Twitch Mod]: ${this.name}: ${obj.is_primary ? 'Primary' : 'Secondary'} Video Found:`, obj);
  }
  createAddedObserver_AdLabels() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: '[data-a-target="video-ad-label"]',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      this.addAdLabel(element);
    });
  }
  createAddedObserver_MainTag() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'main',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      if (element instanceof HTMLElement) {
        this.addMainTag(element);
      }
    });
  }
  createAddedObserver_VideoElements() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'video',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      if (element instanceof HTMLVideoElement) {
        this.addVideoElement(element);
      }
    });
  }
}
AutomatedModuleSetup(Module, () => !window.location.pathname.startsWith('/directory'));
function isAnyElementConnected(set) {
  for (const element of set) {
    if (element.isConnected === true) {
      return true;
    }
  }
  return false;
}
