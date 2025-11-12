## 2025-11-01

- added a light-weight module system for loading and unloading mods for single-page-app (which twitch behaves as)
  - added history observer to power the module system
- added user click handling to 'Enter Theatre Mode' mod
- added 'Return To Stream' mod
- tweaked 'Mute Ads' mod (WIP)
- added better logging

[HotFix] 2025-11-11

- `tv.twitch; channel - automatically enter theatre mode`
  - fixed an observer leak
- `tv.twitch; following - periodically update live previews.user.js`
  - updated to use module system
- tweaked the `ModuleInterface` interface a bit
  - updated relevant userscripts:
  - `tv.twitch; channel - automatically click 'reload player' button.user.js`
  - `tv.twitch; channel - automatically click 'return to stream' button.user.js`
  - `tv.twitch; channel - automatically enter theatre mode.user.js`
  - `tv.twitch; channel - mute ads.user.js`
  - `tv.twitch; following - periodically update live previews.user.js`
