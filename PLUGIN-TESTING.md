# Testing the imported EqyCord plugins

All seven plugins are available under the EqyCord origin filter. Enable them individually. Existing plugin preferences are not reset. Plugins with patches can require a Discord restart.

| Plugin | Manual check |
| --- | --- |
| QuickDelete | Send a disposable message, press Alt+Delete once, confirm only your latest message in the current chat disappears. Holding the key should not delete multiple messages. Alternate shortcut is Ctrl+Shift+Delete. |
| RemindMe | Use `/remindme` with amount `1`, unit `minutes`, and a test message. Restart before it is due and verify one notification appears. Clicking it opens the original channel. Reminders survive restarts and are scoped to the current account. |
| AutoReact | In plugin settings enter `[{"keyword":"gg","emoji":"🎉"}]`. Receive/send a message containing `gg` in a test channel and check one reaction. Try invalid JSON and confirm Discord does not crash. Reactions are real; the plugin limits rapid bursts. |
| SmoothType | Focus the message editor, type and move the caret. Change delay, easing and color. Disable the plugin while typing: the native caret returns and the custom caret disappears. |
| FakeTag | Enable the tag in plugin settings, choose text and an image, reopen your profile. The tag is local. Disable it and verify normal tag rendering returns. |
| FakeConnections | Add a connection through settings, save, reopen your profile. Confirm the simulated connection displays locally, then remove it. |
| CustomProfile | Open the pencil icon in the header or Open Custom Profile in settings. Change display name, bio and a badge style, Save, reopen your profile. Save/load a preset. Reset and confirm the originals return. Disable the plugin and confirm its hooks/styles disappear. Shared testing is unavailable until the profile service is configured. |

CustomProfile cosmetic values can overlap with other profile plugins; test it together with FakeTag and FakeProfileThemes. Banner/effect/decoration patches depend on the current Discord build and require a real Canary check; compilation alone does not establish compatibility.

The profile service setup and two-account sharing test are documented in `services/profile-api/README.md`.
