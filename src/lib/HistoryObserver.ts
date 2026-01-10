import { Core_Console_Log } from './ericchase/Core_Console_Log.js';

declare global {
  interface History {
    isObserverSetUp: boolean;
    onUrlChangeSubscriptions: Set<() => void>;
    originalPushState: typeof window.history.pushState;
    originalReplaceState: typeof window.history.replaceState;
  }
}

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

export function SubscribeToUrlChange(callback: () => void) {
  if (window.history.isObserverSetUp !== true) {
    SetupHistoryObserver();
  }
  window.history.onUrlChangeSubscriptions.add(callback);
}
