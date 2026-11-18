# Lean Journal

A public fitness journal with private per-user records: meals, hydration, morning runs, walking, evening gym sessions, body measurements and progress photos.

## Source status

This repository contains a **rebuild**, not a byte-for-byte export of the existing production deployment. The public landing page, Firebase browser flow, optional draft storage and feature client were recovered; the dashboard markup, core browser client and server were recreated after workspace cleanup removed the later local source.

**The existing live Vercel site has not been replaced or connected to this repository.** Existing production account-cookie formats and every historical record shape have not been verified against this rebuild. Do not point it at the production Blob store until a separate compatibility review and backup/migration plan are complete. Use a separate private Blob store for a staging deployment.

## Features

- Blank journals: no prefilled weight, goal, logs, photos, conversations or progress.
- Editable daily meals, water, weight, waist, running, walking and gym logs.
- Morning running and evening gym remain separate activities and plans.
- Weekly averages, history, measured-data charts and explicitly uncertain goal projections.
- Private photos, side-by-side comparison and an overlay slider.
- Dated workout plans, rest days and calendar exports.
- Profile name, age, gender, date of birth, contact email and avatar.
- Private access keys or verified Firebase email/password login and recovery.
- Explicit email linking from an authenticated profile; matching contact emails alone never transfer a journal.
- Optional Gemini adviser, weekly review and editable food-photo estimate ranges.
- Adult/consent gates; AI questions, selected logs or meal photos are sent only after an explicit request.
- Reminders while the app is open, calendar alerts and installable PWA assets.
- Opt-in local drafts; manual reviewed cloud save, and clearing at sign-out.
- JSON export and journal deletion.

## Local preview

Use Node 22 or newer.

```sh
npm ci
npm run build:assets
npm run check
npm test
npm run dev
```

Open `http://localhost:3000/`. The local preview uses **in-memory storage**, resets when restarted, and disables server-side Firebase verification and Gemini requests. For an empty disposable local journal, visit `/__preview`. That bootstrap path exists only in `scripts/dev.mjs`, never in the deployed server.

Do not enter real Firebase credentials during the local preview: the recovered browser flow contacts Google directly. Use the local private-key journal or `/__preview` instead.

If using a managed Sites preview, the dev script honors `--port`.

## Vercel setup for a separate staging project

1. Import this repository into a **new staging Vercel project**, using the repository root and Node 22. `vercel.json` routes requests to `api/index.js`.
2. Create a **private** Vercel Blob store for staging and set `BLOB_READ_WRITE_TOKEN` server-side.
3. Optional: set `GEMINI_API_KEY`. `GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`; select a model available to your Google project. Provider availability and free quotas can change. Without a key, tracking works and AI requests return an unavailable message.
4. Enable Firebase Email/Password authentication. Add the staging domain to Firebase Authentication's authorized domains.
5. Firebase's web configuration is public. The existing project is the default; optional `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN` environment overrides select a separate project. No Firebase service-account private key is required.
6. Run a separate staging smoke test before considering production replacement. Verify email delivery with an account you control; the automated tests do not create Firebase users or send email.

Never commit `.env` values, Blob tokens, Gemini keys, account access keys, cookies or journal exports. `.env.example` contains placeholders and public Firebase web configuration only.

## Development

Editable browser assets live in `web/`. `npm run build:assets` produces the checked-in `lib/web-assets.js` bundle. Rebuild it after changing browser files. The Vercel function uses the bundle, so the assets remain available without a static-output step.

- `lib/router.js`: routing, journal ownership, sessions, validation and feature endpoints.
- `lib/firebase-auth.js`: RS256 JWT verification, issuer/audience checks, verified-email check and fresh Firebase account lookup.
- `lib/storage.js`: private Blob adapter and isolated memory adapter for local tests.
- `lib/ai.js`: server-side Gemini requests and bounded food estimates.
- `lib/validation.js`: input schemas and request-size checks.
- `tests/`: local-only authentication, privacy, storage, feature and signed-JWT regression checks.

Images are resized client-side before upload. Calendar exports use the device's local times. Browser reminders require an open app; exported calendar alerts depend on the calendar app. Progress photos and profile pictures are excluded from JSON exports, so retain originals separately.

## Privacy and limits

Private records use server-controlled journal prefixes. Firebase sessions are opaque, HttpOnly, Secure and SameSite cookies; private access keys are bearer credentials. A linked Firebase login never takes over a journal solely because an email matches a profile.

The service worker caches only the generic offline page and public icons, never private API responses, journal pages or tokens. Optional drafts are unencrypted device storage and require manual review before saving to the cloud.

AI responses are general wellness guidance, not medical advice. Food estimates are approximate ranges. Google free-tier data processing may include product improvement; the UI discloses this before consent. API calls are limited per journal; key creation/login also have daily request limits. These storage-backed limits are best effort under concurrent requests; use an atomic rate-limit service before substantial public traffic.

Deleting a journal removes its app data and linking index; it does not delete the separately managed Firebase Authentication identity. Changing a Firebase password invalidates future verification via the fresh-account lookup; an already issued app session lasts up to 30 days unless logged out or the journal is deleted. A future security enhancement should provide a revoke-all-sessions control.

No license is granted by this repository unless its owner adds one.
