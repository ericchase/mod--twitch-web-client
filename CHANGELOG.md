## 2026-02-01

- `tv.twitch; channel.videos - remove video preview`
  - Aggressively removes the video preview section when browsing `twitch.tv/<channel>/videos`

## 2026-01-01

- `tv.twitch; channel - mute ads`
  - Better logic for moving and resizing the secondary video during ads
  - Needs faster ad detection logic, but it's good enough for me

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
- `tv.twitch; following - periodically update live previews`
  - Update to use module system
- Tweak the `ModuleInterface` interface a bit
  - Update relevant UserScripts:
  - `tv.twitch; channel - automatically click 'reload player' button`
  - `tv.twitch; channel - automatically click 'return to stream' button`
  - `tv.twitch; channel - automatically enter theatre mode`
  - `tv.twitch; channel - mute ads`
  - `tv.twitch; following - periodically update live previews`
- Forgot to start the initial setup
