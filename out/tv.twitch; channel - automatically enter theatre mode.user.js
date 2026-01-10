// ==UserScript==
// @name        tv.twitch; channel - automatically enter theatre mode
// @match       *://www.twitch.tv/*
// @version     1.2.2
// @description 2025/09/23
// @run-at      document-start
// @grant       none
// @homepageURL https://github.com/ericchase/mod--twitch-web-client
// ==/UserScript==

// src/lib/ericchase/Core_Console_Log.ts
function Core_Console_Log(...items) {
  console['log'](...items);
}

// src/lib/ericchase/WebPlatform_DOM_Attribute_Observer_Class.ts
class Class_WebPlatform_DOM_Attribute_Observer_Class {
  $mutation_observer;
  $subscription_set = new Set();
  constructor(config) {
    config.options ??= {};
    this.$mutation_observer = new MutationObserver((mutationRecords) => {
      for (const record of mutationRecords) {
        this.$send(record);
      }
    });
    this.$mutation_observer.observe(config.source ?? document.documentElement, {
      attributes: true,
      attributeFilter: config.options.attributeFilter,
      attributeOldValue: config.options.attributeOldValue ?? true,
      subtree: config.options.subtree ?? true,
    });
  }
  disconnect() {
    this.$mutation_observer.disconnect();
    for (const callback of this.$subscription_set) {
      this.$subscription_set.delete(callback);
    }
  }
  subscribe(callback) {
    this.$subscription_set.add(callback);
    return () => {
      this.$subscription_set.delete(callback);
    };
  }
  $send(record) {
    for (const callback of this.$subscription_set) {
      callback(record, () => {
        this.$subscription_set.delete(callback);
      });
    }
  }
}
function WebPlatform_DOM_Attribute_Observer_Class(config) {
  return new Class_WebPlatform_DOM_Attribute_Observer_Class(config);
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
function SetupHistoryObserver() {
  Core_Console_Log(`[Twitch Mod]: Setup: History Observer`);
  window.history.isObserverSetUp = true;
  window.history.onUrlChangeSubscriptions = new Set();
  let url = window.location.toString();
  setInterval(() => {
    if (url !== window.location.toString()) {
      url = window.location.toString();
      for (const fn of window.history.onUrlChangeSubscriptions) {
        fn();
      }
    }
  }, 350);
}
function SubscribeToUrlChange(callback) {
  if (window.history.isObserverSetUp !== true) {
    SetupHistoryObserver();
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

// src/tv.twitch; channel - automatically enter theatre mode.user.ts
class Module {
  name = 'Enter Theatre Mode';
  event_map = new Map();
  observer_set = new Set();
  button_found = false;
  clean() {
    Core_Console_Log(`[Twitch Mod]: Clean: ${this.name}`);
    for (const [element, handler] of this.event_map) {
      if (handler) {
        element.removeEventListener('click', handler);
      }
    }
    this.event_map.clear();
    for (const observer of this.observer_set) {
      observer.disconnect();
    }
    this.observer_set.clear();
  }
  setup() {
    Core_Console_Log(`[Twitch Mod]: Setup: ${this.name}`);
    this.createObserver1();
  }
  removeButtonHandler(element) {
    const handler = this.event_map.get(element);
    if (handler) {
      element.removeEventListener('click', handler);
      this.event_map.delete(element);
    }
  }
  addButtonHandler(element) {
    const handler = () => void this.manualClick();
    this.event_map.set(element, handler);
    element.addEventListener('click', handler);
  }
  createObserver1() {
    const observer = WebPlatform_DOM_Element_Added_Observer_Class({
      selector: 'button[aria-label="Theatre Mode (alt+t)"]',
    });
    this.observer_set.add(observer);
    observer.subscribe((element) => {
      if (this.button_found === false && element instanceof HTMLButtonElement) {
        this.button_found = true;
        observer.disconnect();
        this.createObserver2(element);
      }
    });
  }
  createObserver2(element) {
    this.automatedClick(element);
    const observer = WebPlatform_DOM_Attribute_Observer_Class({
      options: {
        attributeFilter: ['aria-label'],
      },
      source: element,
    });
    this.observer_set.add(observer);
    observer.subscribe(() => {
      if (element.getAttribute('aria-label') === 'Theatre Mode (alt+t)') {
        this.automatedClick(element);
      }
    });
  }
  automatedClick(element) {
    Core_Console_Log(`[Twitch Mod]: ${this.name}: Click Button.`);
    this.removeButtonHandler(element);
    element.click();
    this.addButtonHandler(element);
  }
  manualClick() {
    this.clean();
  }
}
AutomatedModuleSetup(Module, () => !window.location.pathname.startsWith('/directory'));
