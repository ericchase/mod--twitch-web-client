import { Core_Utility_Debounce } from './ericchase/Core_Utility_Debounce.js';
import { SubscribeToUrlChange } from './HistoryObserver.js';

export interface ModuleInterface {
  name: string;
  clean: () => void;
  setup: () => void;
}

export function AutomatedModuleSetup(constructor: new () => ModuleInterface, matches_url: () => boolean) {
  const module_instance: ModuleInterface | undefined = new constructor();
  const handler = Core_Utility_Debounce(() => {
    module_instance.clean();
    if (matches_url()) {
      module_instance.setup();
    }
  }, 1000);
  SubscribeToUrlChange(handler);
}
