# Cc

A rebuilt, working **web control center** for a Shizuku-style privilege manager.

The original [Cc-app](https://github.com/amarmuktagacha/Cc-app) Android tree did not run as a product UI. This replaces it with a bilingual (বাংলা / English) manager: pairing, app grants, logs, and a `rish` shell.

## What you can do

- **Start the service** via wireless debugging, USB ADB, or root
- **Pair a device** with a six-digit code (demo phone shows `372 841`)
- **Grant / revoke** apps that want privileged APIs
- **rish shell** — `help`, `id`, `dumpsys cc`, `pm list packages`, `getprop`
- Switch language in Settings

State is saved in the browser (`localStorage`). The native Android Binder is simulated here so the flows actually complete.

## Screens

| Route | Page |
| --- | --- |
| `/` | Status, start methods, apps, logs |
| `/apps` | Authorized apps |
| `/setup` | How it works |
| `/shell` | rish |
| `/settings` | Language, boot, watchdog, reset |

## Demo pairing

1. Home → **Wireless debugging**
2. Tap **Build number** seven times
3. Turn on wireless debugging
4. Enter pairing code **372841**
5. Connect — service runs as `uid=2000 (shell)`

Root start lifts the service to `uid=0`.

## Note

This is a **web companion**, not an APK. It cannot start a real Shizuku server on a phone from the browser. The UI, pairing wizard, grants, and shell are fully interactive.
