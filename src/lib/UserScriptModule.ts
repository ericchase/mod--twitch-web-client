import { Core_Utility_Debounce } from './ericchase/Core_Utility_Debounce.js';

export interface ModuleInterface {
  setup: () => void;
  cleanup: () => void;
}

export function InitModuleSetupHandler(constructor: new () => ModuleInterface) {
  let module_instance: ModuleInterface | undefined = undefined;
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
