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
