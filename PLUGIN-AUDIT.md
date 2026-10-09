# Plugin audit — 2026-10-10

Scope: complete generated catalog, static checks, desktop/web builds, automatic tests, provider HTTP probes, and existing Canary logs. Startup is not proof that every feature works. Disabled plugins were not enabled in bulk. No visual UI inspection or two-account voice test was performed.

## Corrected failures

- Translate+ and MessageTranslate: desktop CSP blocked translate.googleapis.com. Exact Google and optional Toki provider domains now have connection-only permissions.
- Translate+: missing mounted message setter and provider failures now show a toast rather than an unhandled rejection or a false translated message. Requests time out after 15 seconds.
- MessageTranslate: network failures allow retry after 30 seconds; edited message text invalidates the cache. Malformed responses are rejected.
- PingNotifications: removed obsolete channel.isMuted; use UserGuildSettingsStore.
- BadgeAPI: the imported optional donor API is absent in this fork. Skip that source without breaking all standard profile badges.

## Remaining findings and limits

- ShowHiddenChannels: historical no-effect patch warnings. Some features may be incompatible with Canary; no current module capture was available to validate a correction.
- RPC: port 6463 occupied while another Discord instance runs; environment conflict.
- Audio asset_404 and invalid spellchecker locale: logged, but no responsible plugin was identified. Unresolved.
- Google classic returned HTTP 200 for ciao; upstream Translate returned HTTP 200 for come stai → How are you. Toki Pona POST returned HTTP 200. These service probes do not establish browser/UI functionality. DeepL and Kagi need credentials and remain untested.
- Ghost modifies only the outgoing voice-state copy; it does not change media-engine flags. Discord audio delivery remains unverified. Server confirmation alone proves neither remote appearance nor audio behavior.
- Canary app-1.0.1218 has a migrated loader pointing to Desktop/EqyCord/dist but no installer ownership metadata. Formal installer verification remains unavailable; fixture install/restore tests pass.

## Manual checks

1. Translate+: select a target language, right-click a foreign-language text message → Translate. Check text beneath the message.
2. MessageTranslate: targetLanguage it; remove excluded language codes you want translated; showOriginal trans-in-subtext. Receive an English message from another account. Own messages are skipped by default.
3. Translate: test separately with Google, sent output English, outgoing translation enabled. Avoid multiple outgoing translators at once.
4. Ghost: restart after enabling, then join a voice channel. The button appears beside native controls with a red slash while inactive. Activate it; a second account must check both flags while you test listening and microphone behavior. Disable it and check restoration. Without confirmation it times out and restores the original flags.

## Catalog

372 registered entries, including 200 imports plus the new Ghost. Origin is a distribution label; source authorship stays intact.

| Plugin | Target | Audit status |
| --- | --- | --- |
| AccountPanelServerProfile | Universal | Registered and statically checked; feature behavior untested |
| AddAttachments | Universal | Startup requested in historical logs; feature behavior untested |
| AdvancedPermissions | Universal | Registered and statically checked; feature behavior untested |
| AltKrispSwitch | Universal | Registered and statically checked; feature behavior untested |
| AlwaysAnimate | Universal | Registered and statically checked; feature behavior untested |
| AlwaysExpandProfiles | Universal | Registered and statically checked; feature behavior untested |
| AlwaysExpandRoles | Universal | Registered and statically checked; feature behavior untested |
| AlwaysTrust | Universal | Registered and statically checked; feature behavior untested |
| Animalese | Universal | Registered and statically checked; feature behavior untested |
| AnonymiseFileNames | Universal | Registered and statically checked; feature behavior untested |
| AtSomeone | Universal | Registered and statically checked; feature behavior untested |
| AutoDNDWhilePlaying | discordDesktop | Registered and statically checked; feature behavior untested |
| AutoJumpToMessage | Universal | Registered and statically checked; feature behavior untested |
| AutoZipper | Universal | Startup requested in historical logs; feature behavior untested |
| BannersEverywhere | Universal | Registered and statically checked; feature behavior untested |
| BetterActivities | Universal | Registered and statically checked; feature behavior untested |
| BetterAudioPlayer | Universal | Registered and statically checked; feature behavior untested |
| BetterBanReasons | Universal | Registered and statically checked; feature behavior untested |
| BetterBlockedUsers | Universal | Registered and statically checked; feature behavior untested |
| BetterCommands | Universal | Registered and statically checked; feature behavior untested |
| BetterFolders | Universal | Registered and statically checked; feature behavior untested |
| BetterForwards | Universal | Registered and statically checked; feature behavior untested |
| BetterGifAltText | Universal | Registered and statically checked; feature behavior untested |
| BetterGifPicker | Universal | Registered and statically checked; feature behavior untested |
| BetterImageEditor | Universal | Registered and statically checked; feature behavior untested |
| BetterInvites | Universal | Registered and statically checked; feature behavior untested |
| BetterPlusReacts | Universal | Registered and statically checked; feature behavior untested |
| BetterRoleContext | Universal | Registered and statically checked; feature behavior untested |
| BetterRoleDot | Universal | Registered and statically checked; feature behavior untested |
| BetterSessions | Universal | Registered and statically checked; feature behavior untested |
| BetterSettings | Universal | Registered and statically checked; feature behavior untested |
| BetterUploadButton | Universal | Registered and statically checked; feature behavior untested |
| BiggerStreamPreview | Universal | Registered and statically checked; feature behavior untested |
| BlockKeywords | Universal | Registered and statically checked; feature behavior untested |
| BlockKrisp | Universal | Registered and statically checked; feature behavior untested |
| BlurNSFW | Universal | Registered and statically checked; feature behavior untested |
| BypassPinPrompt | Universal | Registered and statically checked; feature behavior untested |
| BypassStatus | Universal | Registered and statically checked; feature behavior untested |
| CallTimer | Universal | Registered and statically checked; feature behavior untested |
| CancelFriendRequest | Universal | Registered and statically checked; feature behavior untested |
| ChannelBadges | Universal | Registered and statically checked; feature behavior untested |
| ChannelTabs | Universal | Registered and statically checked; feature behavior untested |
| CharacterCounter | Universal | Registered and statically checked; feature behavior untested |
| CleanChannelName | Universal | Registered and statically checked; feature behavior untested |
| CleanerChannelGroups | Universal | Registered and statically checked; feature behavior untested |
| ClearURLs | Universal | Registered and statically checked; feature behavior untested |
| ClickableRoles | Universal | Registered and statically checked; feature behavior untested |
| ClientSideBlock | Universal | Registered and statically checked; feature behavior untested |
| ClientTheme | Universal | Registered and statically checked; feature behavior untested |
| ClipsEnhancements | discordDesktop | Registered and statically checked; feature behavior untested |
| ClipUpload | desktop | Registered and statically checked; feature behavior untested |
| CollapsibleUI | Universal | Registered and statically checked; feature behavior untested |
| ColorSighted | Universal | Registered and statically checked; feature behavior untested |
| CommandPalette | Universal | Registered and statically checked; feature behavior untested |
| ConcatenatedComponentExtractor | Universal | Registered and statically checked; feature behavior untested |
| ConsoleJanitor | Universal | Registered and statically checked; feature behavior untested |
| ConsoleShortcuts | Universal | Registered and statically checked; feature behavior untested |
| ContentWarning | Universal | Registered and statically checked; feature behavior untested |
| CopyEmojiMarkdown | Universal | Registered and statically checked; feature behavior untested |
| CopyFileContents | Universal | Registered and statically checked; feature behavior untested |
| CopyProfileColors | Universal | Registered and statically checked; feature behavior untested |
| CopyStatusUrls | Universal | Registered and statically checked; feature behavior untested |
| CopyStickerLinks | Universal | Registered and statically checked; feature behavior untested |
| CopyUserMention | Universal | Registered and statically checked; feature behavior untested |
| CopyUserURLs | Universal | Registered and statically checked; feature behavior untested |
| CrashHandler | Universal | Registered and statically checked; feature behavior untested |
| CursorBuddy | Universal | Registered and statically checked; feature behavior untested |
| CustomCommands | Universal | Registered and statically checked; feature behavior untested |
| CustomFolderIcons | Universal | Registered and statically checked; feature behavior untested |
| CustomIdle | Universal | Registered and statically checked; feature behavior untested |
| CustomRPC | Universal | Registered and statically checked; feature behavior untested |
| CustomSounds | Universal | Registered and statically checked; feature behavior untested |
| CustomStatusTimeouts | Universal | Registered and statically checked; feature behavior untested |
| CustomTimestamps | Universal | Registered and statically checked; feature behavior untested |
| CustomUserColors | Universal | Registered and statically checked; feature behavior untested |
| Dearrow | Universal | Registered and statically checked; feature behavior untested |
| Declutter | Universal | Registered and statically checked; feature behavior untested |
| DecodeBase64 | Universal | Registered and statically checked; feature behavior untested |
| Decor | Universal | Registered and statically checked; feature behavior untested |
| DevCompanion | dev | Host-specific; not certified for Canary |
| DisableCallIdle | Universal | Registered and statically checked; feature behavior untested |
| DisableCameras | Universal | Registered and statically checked; feature behavior untested |
| DisableDeepLinks | web | Host-specific; not certified for Canary |
| DiscordDevBanner | Universal | Registered and statically checked; feature behavior untested |
| DontRoundMyTimestamps | Universal | Registered and statically checked; feature behavior untested |
| DownloadAllAttachments | Universal | Registered and statically checked; feature behavior untested |
| DragFavoriteEmotes | Universal | Registered and statically checked; feature behavior untested |
| Dragify | Universal | Registered and statically checked; feature behavior untested |
| ElementHighlighter | dev | Host-specific; not certified for Canary |
| EquibopStreamFixes | equibop | Host-specific; not certified for Canary |
| EquicordHelper | Universal | Startup requested in historical logs; feature behavior untested |
| EquicordToolbox | Universal | Registered and statically checked; feature behavior untested |
| Equissant | Universal | Registered and statically checked; feature behavior untested |
| ExitSounds | Universal | Registered and statically checked; feature behavior untested |
| Experiments | Universal | Registered and statically checked; feature behavior untested |
| ExportMessages | Universal | Registered and statically checked; feature behavior untested |
| ExpressionCloner | Universal | Registered and statically checked; feature behavior untested |
| F8Break | Universal | Registered and statically checked; feature behavior untested |
| FakeNitro | Universal | Startup requested in historical logs; feature behavior untested |
| FakeProfileThemes | Universal | Registered and statically checked; feature behavior untested |
| FastDeleteChannels | Universal | Registered and statically checked; feature behavior untested |
| FavoriteEmojiFirst | Universal | Registered and statically checked; feature behavior untested |
| FavouriteAnything | Universal | Registered and statically checked; feature behavior untested |
| FileUpload | Universal | Registered and statically checked; feature behavior untested |
| FindReply | Universal | Startup requested in historical logs; feature behavior untested |
| FixCodeblockGap | Universal | Registered and statically checked; feature behavior untested |
| FixDiscordCss | Universal | Startup requested in historical logs; feature behavior untested |
| FixFileExtensions | Universal | Registered and statically checked; feature behavior untested |
| FixImagesQuality | Universal | Registered and statically checked; feature behavior untested |
| FixSpotifyEmbeds | desktop | Registered and statically checked; feature behavior untested |
| FixYoutubeEmbeds | desktop | Registered and statically checked; feature behavior untested |
| FollowVoiceUser | Universal | Registered and statically checked; feature behavior untested |
| FontLoader | Universal | Registered and statically checked; feature behavior untested |
| ForceOwnerCrown | Universal | Registered and statically checked; feature behavior untested |
| FrequentQuickSwitcher | Universal | Registered and statically checked; feature behavior untested |
| FriendCodes | Universal | Registered and statically checked; feature behavior untested |
| FriendInvites | Universal | Registered and statically checked; feature behavior untested |
| FriendshipRanks | Universal | Registered and statically checked; feature behavior untested |
| FriendTags | Universal | Startup requested in historical logs; feature behavior untested |
| FullSearchContext | Universal | Registered and statically checked; feature behavior untested |
| FullUserInChatbox | Universal | Registered and statically checked; feature behavior untested |
| FullVCPFP | Universal | Registered and statically checked; feature behavior untested |
| GameActivityToggle | Universal | Registered and statically checked; feature behavior untested |
| Ghost | Universal | New experimental UserArea button; flag restoration and timeout tested; two-account audio test pending |
| Ghosted | Universal | Startup requested in historical logs; feature behavior untested |
| GifCollections | Universal | Registered and statically checked; feature behavior untested |
| GifMaker | Universal | Registered and statically checked; feature behavior untested |
| GifPaste | Universal | Registered and statically checked; feature behavior untested |
| GifProviderSwitcher | Universal | Registered and statically checked; feature behavior untested |
| GitHubRepos | Universal | Registered and statically checked; feature behavior untested |
| GlobalBadges | Universal | Registered and statically checked; feature behavior untested |
| GoogleThat | Universal | Registered and statically checked; feature behavior untested |
| GreetStickerPicker | Universal | Registered and statically checked; feature behavior untested |
| GuildPickerDumper | Universal | Registered and statically checked; feature behavior untested |
| HideChatButtons | Universal | Registered and statically checked; feature behavior untested |
| HideMedia | Universal | Registered and statically checked; feature behavior untested |
| HideMessages | Universal | Registered and statically checked; feature behavior untested |
| HideServers | Universal | Registered and statically checked; feature behavior untested |
| HomeTyping | Universal | Registered and statically checked; feature behavior untested |
| HopOn | Universal | Registered and statically checked; feature behavior untested |
| Husk | Universal | Registered and statically checked; feature behavior untested |
| IconViewer | Universal | Registered and statically checked; feature behavior untested |
| IdleAutoRestart | Universal | Registered and statically checked; feature behavior untested |
| IgnoreActivities | Universal | Registered and statically checked; feature behavior untested |
| IgnoreCalls | Universal | Registered and statically checked; feature behavior untested |
| iLoveSpam | Universal | Registered and statically checked; feature behavior untested |
| ImageFilename | Universal | Registered and statically checked; feature behavior untested |
| ImageLink | Universal | Registered and statically checked; feature behavior untested |
| ImageZoom | Universal | Startup requested in historical logs; feature behavior untested |
| ImplicitRelationships | Universal | Registered and statically checked; feature behavior untested |
| Ingtoninator | Universal | Registered and statically checked; feature behavior untested |
| InRole | Universal | Startup requested in historical logs; feature behavior untested |
| InstantScreenshare | Universal | Registered and statically checked; feature behavior untested |
| InvisibleChat | desktop | Registered and statically checked; feature behavior untested |
| InviteDefaults | Universal | Registered and statically checked; feature behavior untested |
| IrcColors | Universal | Registered and statically checked; feature behavior untested |
| IRememberYou | Universal | Registered and statically checked; feature behavior untested |
| JumpTo | Universal | Registered and statically checked; feature behavior untested |
| KeepCurrentChannel | Universal | Registered and statically checked; feature behavior untested |
| KeyboardNavigation | Universal | Startup requested in historical logs; feature behavior untested |
| KeyboardSounds | Universal | Startup requested in historical logs; feature behavior untested |
| KeywordNotify | Universal | Registered and statically checked; feature behavior untested |
| LastActive | Universal | Registered and statically checked; feature behavior untested |
| LimitlessScreenshare | Universal | Registered and statically checked; feature behavior untested |
| LoadingQuotes | Universal | Registered and statically checked; feature behavior untested |
| LoginWithQR | Universal | Registered and statically checked; feature behavior untested |
| MarkdownTables | Universal | Registered and statically checked; feature behavior untested |
| MediaPlaybackSpeed | Universal | Registered and statically checked; feature behavior untested |
| MemberCount | Universal | Registered and statically checked; feature behavior untested |
| MentionAvatars | Universal | Registered and statically checked; feature behavior untested |
| MessageBurst | Universal | Registered and statically checked; feature behavior untested |
| MessageClickActions | Universal | Registered and statically checked; feature behavior untested |
| MessageColors | Universal | Registered and statically checked; feature behavior untested |
| MessageFetchTimer | Universal | Registered and statically checked; feature behavior untested |
| MessageLatency | Universal | Registered and statically checked; feature behavior untested |
| MessageLinkEmbeds | Universal | Registered and statically checked; feature behavior untested |
| MessageLinkTooltip | Universal | Registered and statically checked; feature behavior untested |
| MessageLogger | Universal | Startup requested in historical logs; feature behavior untested |
| MessageLoggerEnhanced | Universal | Startup requested in historical logs; feature behavior untested |
| MessageNotifier | Universal | Registered and statically checked; feature behavior untested |
| MessagePeek | Universal | Registered and statically checked; feature behavior untested |
| MessageTranslate | Universal | CSP corrected; transient retry and edited-message cache tested; UI retest pending |
| MicLoopbackTester | Universal | Registered and statically checked; feature behavior untested |
| MiddleClickTweaks | Universal | Startup requested in historical logs; feature behavior untested |
| MoreCommands | Universal | Startup requested in historical logs; feature behavior untested |
| MoreQuickReactions | Universal | Registered and statically checked; feature behavior untested |
| MoreStickers | Universal | Registered and statically checked; feature behavior untested |
| MoreUserTags | Universal | Registered and statically checked; feature behavior untested |
| Moyai | Universal | Registered and statically checked; feature behavior untested |
| MusicControls | Universal | Registered and statically checked; feature behavior untested |
| MusicRichPresence | Universal | Registered and statically checked; feature behavior untested |
| MutualGroupDMs | Universal | Registered and statically checked; feature behavior untested |
| NeverPausePreviews | Universal | Registered and statically checked; feature behavior untested |
| NewGuildSettings | Universal | Registered and statically checked; feature behavior untested |
| NewPluginsManager | Universal | Registered and statically checked; feature behavior untested |
| NoBlockedMessages | Universal | Registered and statically checked; feature behavior untested |
| NoDevtoolsWarning | Universal | Registered and statically checked; feature behavior untested |
| NoF1 | Universal | Registered and statically checked; feature behavior untested |
| NoMaskedUrlPaste | Universal | Registered and statically checked; feature behavior untested |
| NoMiddleClickPaste | Universal | Registered and statically checked; feature behavior untested |
| NoMosaic | Universal | Registered and statically checked; feature behavior untested |
| NoNitroUpsell | Universal | Registered and statically checked; feature behavior untested |
| NoOnboardingDelay | Universal | Registered and statically checked; feature behavior untested |
| NoPendingCount | Universal | Registered and statically checked; feature behavior untested |
| NoProfileThemes | Universal | Registered and statically checked; feature behavior untested |
| NoPushToTalk | Universal | Registered and statically checked; feature behavior untested |
| NoReplyMention | Universal | Registered and statically checked; feature behavior untested |
| NormalizeMessageLinks | Universal | Registered and statically checked; feature behavior untested |
| NoRoleHeaders | Universal | Registered and statically checked; feature behavior untested |
| NoRPC | discordDesktop | Registered and statically checked; feature behavior untested |
| NoServerEmojis | Universal | Registered and statically checked; feature behavior untested |
| NoSystemBadge | discordDesktop | Registered and statically checked; feature behavior untested |
| NotificationTitle | discordDesktop | Registered and statically checked; feature behavior untested |
| NotificationVolume | Universal | Registered and statically checked; feature behavior untested |
| NoTrack | Universal | Startup requested in historical logs; feature behavior untested |
| NoTypingAnimation | Universal | Registered and statically checked; feature behavior untested |
| NoUnblockToJump | Universal | Registered and statically checked; feature behavior untested |
| oneko | Universal | Registered and statically checked; feature behavior untested |
| OnePingPerDM | Universal | Registered and statically checked; feature behavior untested |
| OpenInApp | Universal | Registered and statically checked; feature behavior untested |
| OrbolayBridge | Universal | Registered and statically checked; feature behavior untested |
| OverrideForumDefaults | Universal | Registered and statically checked; feature behavior untested |
| PartyMode | Universal | Registered and statically checked; feature behavior untested |
| PauseInvitesForever | Universal | Registered and statically checked; feature behavior untested |
| PermissionFreeWill | Universal | Registered and statically checked; feature behavior untested |
| PermissionsViewer | Universal | Registered and statically checked; feature behavior untested |
| petpet | Universal | Registered and statically checked; feature behavior untested |
| PictureInPicture | Universal | Registered and statically checked; feature behavior untested |
| PinDMs | Universal | Registered and statically checked; feature behavior untested |
| PingNotifications | Universal | Obsolete channel.isMuted removed; scenario retest pending |
| PinIcon | Universal | Registered and statically checked; feature behavior untested |
| PlainFolderIcon | Universal | Registered and statically checked; feature behavior untested |
| PlatformIndicators | Universal | Startup requested in historical logs; feature behavior untested |
| PlatformSpoofer | Universal | Registered and statically checked; feature behavior untested |
| PolishWording | Universal | Registered and statically checked; feature behavior untested |
| PreviewMessage | Universal | Registered and statically checked; feature behavior untested |
| ProfileSets | Universal | Registered and statically checked; feature behavior untested |
| Questify | Universal | Registered and statically checked; feature behavior untested |
| QuickMention | Universal | Registered and statically checked; feature behavior untested |
| QuickReply | Universal | Registered and statically checked; feature behavior untested |
| QuickThemeSwitcher | discordDesktop | Registered and statically checked; feature behavior untested |
| Quoter | Universal | Registered and statically checked; feature behavior untested |
| RandomVoice | Universal | Registered and statically checked; feature behavior untested |
| ReactErrorDecoder | Universal | Registered and statically checked; feature behavior untested |
| ReactionTimestamps | Universal | Registered and statically checked; feature behavior untested |
| ReadAllNotificationsButton | Universal | Registered and statically checked; feature behavior untested |
| RecentDMSwitcher | Universal | Startup requested in historical logs; feature behavior untested |
| RelationshipNotifier | Universal | Registered and statically checked; feature behavior untested |
| RemixRevived | Universal | Registered and statically checked; feature behavior untested |
| RepeatMessages | Universal | Registered and statically checked; feature behavior untested |
| ReplaceGoogleSearch | Universal | Registered and statically checked; feature behavior untested |
| ReplyPingControl | Universal | Registered and statically checked; feature behavior untested |
| ReplyTimestamp | Universal | Registered and statically checked; feature behavior untested |
| RevealAllSpoilers | Universal | Registered and statically checked; feature behavior untested |
| ReverseImageSearch | Universal | Registered and statically checked; feature behavior untested |
| ReviewDB | Universal | Registered and statically checked; feature behavior untested |
| RichMagnetLinks | Universal | Registered and statically checked; feature behavior untested |
| RichPresence | Universal | Registered and statically checked; feature behavior untested |
| RoleColorEverywhere | Universal | Registered and statically checked; feature behavior untested |
| RPCEditor | Universal | Registered and statically checked; feature behavior untested |
| SaveFavoriteGIFs | Universal | Registered and statically checked; feature behavior untested |
| ScheduledMessages | Universal | Registered and statically checked; feature behavior untested |
| ScreenRecorder | equibop | Host-specific; not certified for Canary |
| SearchFix | Universal | Registered and statically checked; feature behavior untested |
| SecretRingToneEnabler | Universal | Registered and statically checked; feature behavior untested |
| SedEnhanced | Universal | Registered and statically checked; feature behavior untested |
| SekaiStickers | Universal | Registered and statically checked; feature behavior untested |
| SendTimestamps | Universal | Registered and statically checked; feature behavior untested |
| ServerInfo | Universal | Registered and statically checked; feature behavior untested |
| ServerListIndicators | Universal | Registered and statically checked; feature behavior untested |
| ServerSearch | Universal | Startup requested in historical logs; feature behavior untested |
| Settings | Universal | Registered and statically checked; feature behavior untested |
| ShikiCodeblocks | desktop | Registered and statically checked; feature behavior untested |
| ShowAllMessageButtons | Universal | Registered and statically checked; feature behavior untested |
| ShowBadgesInChat | Universal | Registered and statically checked; feature behavior untested |
| ShowConnections | Universal | Registered and statically checked; feature behavior untested |
| ShowHiddenChannels | Universal | Historical Canary patch no-effect warnings; partial compatibility uncertain |
| ShowHiddenThings | Universal | Registered and statically checked; feature behavior untested |
| ShowMessageEmbeds | Universal | Registered and statically checked; feature behavior untested |
| ShowMeYourName | Universal | Registered and statically checked; feature behavior untested |
| ShowResourceChannels | Universal | Registered and statically checked; feature behavior untested |
| ShowRolesInChat | Universal | Registered and statically checked; feature behavior untested |
| ShowSongName | Universal | Registered and statically checked; feature behavior untested |
| ShowTimeoutDuration | Universal | Registered and statically checked; feature behavior untested |
| SidebarChat | Universal | Registered and statically checked; feature behavior untested |
| Signature | Universal | Registered and statically checked; feature behavior untested |
| SilenceUsers | Universal | Startup requested in historical logs; feature behavior untested |
| SilentMessageToggle | Universal | Registered and statically checked; feature behavior untested |
| SilentTyping | Universal | Registered and statically checked; feature behavior untested |
| Snowfall | Universal | Registered and statically checked; feature behavior untested |
| SongLink | desktop | Registered and statically checked; feature behavior untested |
| SongSpotlight | desktop | Registered and statically checked; feature behavior untested |
| SortFriendRequests | Universal | Registered and statically checked; feature behavior untested |
| SplitLargeMessages | Universal | Registered and statically checked; feature behavior untested |
| SpotifyControls | Universal | Registered and statically checked; feature behavior untested |
| SpotifyCrack | Universal | Registered and statically checked; feature behavior untested |
| SpotifyShareCommands | Universal | Registered and statically checked; feature behavior untested |
| StartupTimings | Universal | Registered and statically checked; feature behavior untested |
| StatusPresets | Universal | Registered and statically checked; feature behavior untested |
| StatusWhileActive | desktop | Registered and statically checked; feature behavior untested |
| SteamStatusSync | Universal | Registered and statically checked; feature behavior untested |
| StickerBlocker | Universal | Registered and statically checked; feature behavior untested |
| StickerPaste | Universal | Registered and statically checked; feature behavior untested |
| StopAutoUnread | Universal | Registered and statically checked; feature behavior untested |
| Streaks | Universal | Registered and statically checked; feature behavior untested |
| StreamerModeOnStream | Universal | Registered and statically checked; feature behavior untested |
| StreamingCodecDisabler | Universal | Registered and statically checked; feature behavior untested |
| SuperReactionTweaks | Universal | Registered and statically checked; feature behavior untested |
| SupportHelper | Universal | Registered and statically checked; feature behavior untested |
| TalkInReverse | Universal | Registered and statically checked; feature behavior untested |
| TextReplace | Universal | Registered and statically checked; feature behavior untested |
| ThemeAttributes | Universal | Registered and statically checked; feature behavior untested |
| ThemeLibrary | Universal | Registered and statically checked; feature behavior untested |
| TidalEmbeds | Universal | Registered and statically checked; feature behavior untested |
| Timezones | Universal | Registered and statically checked; feature behavior untested |
| Title | Universal | Registered and statically checked; feature behavior untested |
| ToastNotifications | Universal | Registered and statically checked; feature behavior untested |
| ToggleVideoBind | Universal | Registered and statically checked; feature behavior untested |
| ToneIndicators | Universal | Registered and statically checked; feature behavior untested |
| Translate | Universal | Google HTTP probe passed; DeepL/Kagi credentials and UI untested |
| Translate+ | Universal | CSP and missing-accessory failures corrected; Google/Toki HTTP probes passed; UI retest pending |
| TriviaAI | Universal | Registered and statically checked; feature behavior untested |
| TypingIndicator | Universal | Registered and statically checked; feature behavior untested |
| TypingTweaks | Universal | Registered and statically checked; feature behavior untested |
| Unindent | Universal | Registered and statically checked; feature behavior untested |
| UnitConverter | Universal | Registered and statically checked; feature behavior untested |
| UniversalMention | Universal | Registered and statically checked; feature behavior untested |
| UnlimitedAccounts | Universal | Registered and statically checked; feature behavior untested |
| UnlockedAvatarZoom | Universal | Registered and statically checked; feature behavior untested |
| UnreadCountBadge | Universal | Registered and statically checked; feature behavior untested |
| UnsuppressEmbeds | Universal | Registered and statically checked; feature behavior untested |
| UrlHighlighter | Universal | Registered and statically checked; feature behavior untested |
| UserMessagesPronouns | Universal | Registered and statically checked; feature behavior untested |
| UserPFP | Universal | Startup requested in historical logs; feature behavior untested |
| UserpluginInstaller | dev | Host-specific; not certified for Canary |
| UserVoiceShow | Universal | Startup requested in historical logs; feature behavior untested |
| USRBG | Universal | Registered and statically checked; feature behavior untested |
| ValidReply | Universal | Registered and statically checked; feature behavior untested |
| ValidUser | Universal | Registered and statically checked; feature behavior untested |
| VcNarrator | Universal | Registered and statically checked; feature behavior untested |
| VCPanelSettings | Universal | Registered and statically checked; feature behavior untested |
| VencordToolbox | Universal | Registered and statically checked; feature behavior untested |
| ViewIcons | Universal | Registered and statically checked; feature behavior untested |
| ViewRaw | Universal | Registered and statically checked; feature behavior untested |
| VoiceButtons | Universal | Registered and statically checked; feature behavior untested |
| VoiceChannelLog | Universal | Startup requested in historical logs; feature behavior untested |
| VoiceChatDoubleClick | Universal | Registered and statically checked; feature behavior untested |
| VoiceChatUtilities | Universal | Registered and statically checked; feature behavior untested |
| VoiceDownload | Universal | Registered and statically checked; feature behavior untested |
| VoiceJoinMessages | Universal | Registered and statically checked; feature behavior untested |
| VoiceMessages | Universal | Registered and statically checked; feature behavior untested |
| VoiceMessagesInBackground | Universal | Registered and statically checked; feature behavior untested |
| VoiceMessageTranscriber | desktop | Registered and statically checked; feature behavior untested |
| VoiceRejoin | Universal | Registered and statically checked; feature behavior untested |
| VoiceStats | Universal | Startup requested in historical logs; feature behavior untested |
| VolumeBooster | Universal | Registered and statically checked; feature behavior untested |
| WaitForSlot | Universal | Registered and statically checked; feature behavior untested |
| WebContextMenus | web | Host-specific; not certified for Canary |
| WebKeybinds | web | Host-specific; not certified for Canary |
| WebpackTarball | Universal | Registered and statically checked; feature behavior untested |
| WebPWA | browser | Host-specific; not certified for Canary |
| WebRichPresence (arRPC) | web | Host-specific; not certified for Canary |
| WebScreenShare | browser | Host-specific; not certified for Canary |
| WebScreenShareFixes | web | Host-specific; not certified for Canary |
| WhitelistedEmojis | Universal | Registered and statically checked; feature behavior untested |
| WhoReacted | Universal | Registered and statically checked; feature behavior untested |
| WhosWatching | Universal | Registered and statically checked; feature behavior untested |
| WigglyText | Universal | Startup requested in historical logs; feature behavior untested |
| WriteUpperCase | Universal | Registered and statically checked; feature behavior untested |
| XSOverlay | Universal | Registered and statically checked; feature behavior untested |
| YoutubeAdblock | desktop | Registered and statically checked; feature behavior untested |
| ZipPreview | Universal | Registered and statically checked; feature behavior untested |
