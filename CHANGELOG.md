## 2025-11-01

- Add a light-weight module system for loading and unloading mods for single-page-app (which twitch behaves as)
  - Add history observer to power the module system
- Add user click handling to 'Enter Theatre Mode' mod
- Add 'Return To Stream' mod
- Tweak 'Mute Ads' mod (WIP)
- Add better logging

[HotFix] 2025-11-11

- `tv.twitch; channel - automatically enter theatre mode`
  - Fix an observer leak
- `tv.twitch; following - periodically update live previews.user.js`
  - Update to use module system
- Tweak the `ModuleInterface` interface a bit
  - Update relevant userscripts:
  - `tv.twitch; channel - automatically click 'reload player' button.user.js`
  - `tv.twitch; channel - automatically click 'return to stream' button.user.js`
  - `tv.twitch; channel - automatically enter theatre mode.user.js`
  - `tv.twitch; channel - mute ads.user.js`
  - `tv.twitch; following - periodically update live previews.user.js`
- Forgot to start the initial setup
