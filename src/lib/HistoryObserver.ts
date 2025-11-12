import { Core_Console_Log } from './ericchase/Core_Console_Log.js';

declare global {
  interface History {
    isObserverSetUp: boolean;
    onUrlChangeSubscriptions: Set<() => void>;
    originalPushState: typeof window.history.pushState;
    originalReplaceState: typeof window.history.replaceState;
  }
}

export function SubscribeToUrlChange(callback: () => void) {
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
