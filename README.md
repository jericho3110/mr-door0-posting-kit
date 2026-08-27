# mr-door0 Posting Feature Kit

This directory contains only the reusable Reddit posting feature from `mr-door0`.
It is intentionally not a complete Devvit app. It does not contain an app manifest,
server bootstrap, Hono router, or unrelated moderation features.

Use this kit when another Devvit bot already has its own networking, routes, settings,
or scheduler. Copy or merge only the files under `src/`, then add the small route and
manifest entries described below. Do not replace the other bot's `index.ts`,
`devvit.json`, or route files.

## Included behavior

- Moderator-only **Post now** menu form.
- Editable title and body fields.
- Text post submission to the subreddit where the app is installed.
- Weekly scheduled post handler.
- Redis lock and ISO-week marker to avoid duplicate scheduled posts.
- Submission logging and user-facing failure messages.

## Files

- `src/posting.ts`: shared permission check and `reddit.submitPost` call.
- `src/form.ts`: native Devvit form definition.
- `src/scheduler.ts`: weekly posting and Redis deduplication.
- `integration-snippets.md`: route and manifest additions that must be merged manually.

## Important: this does not overwrite existing bot data

The kit does not include Redis export/import code and never deletes or copies existing
Redis data. A Devvit app's data belongs to its app installation. A newly created app
identity starts with separate data from the old app.

The scheduler keys use the `postingFeature:` prefix and subreddit ID. If you install
this feature into an existing bot, confirm that prefix is not already used by that bot.
If it is used, change `REDIS_PREFIX` in `src/scheduler.ts` before deploying.

Do not blindly copy `devvit.json`, `src/index.ts`, or whole route files from this kit.
Those files belong to the host bot and are exactly where networking conflicts happen.

## Add it to another Devvit bot

1. Create a branch or backup in the host bot.
2. Copy `src/posting.ts`, `src/form.ts`, and `src/scheduler.ts` into a feature folder.
3. Follow `integration-snippets.md` to add unique routes, menu/form names, and one scheduler task.
4. Merge the snippets into the host bot's existing files instead of replacing them.
5. Keep the host bot's existing server bootstrap and other routes intact.
6. Run the host bot's own test/build commands.
7. Test on a separate subreddit before updating a real installation.

## Pull-based distribution choices

A plain `git pull` is safe only when the feature is kept in its own directory and the
host bot has a deliberate integration point. The host bot still needs its own manifest
and route registrations.

For a long-term shared feature, use one of these approaches:

- **Git subtree**: import this kit under a directory such as `src/vendor/posting-kit`.
  Updates can be pulled from the kit repository without replacing unrelated host files.
- **Private npm package**: publish the posting logic as a package and import it from
  each bot. This is the cleanest option once the feature stabilizes.
- **Manual copy from a release tag**: simplest for a small number of bots; review the
  integration diff every time.

Do not use a full-project folder copy or `git pull` that replaces the host bot's
`devvit.json`, `src/index.ts`, or route modules.

## New app identity and data safety

When replacing an old or unavailable app, create a new Devvit app name and identity.
Do not copy old Redis values into the replacement unless you intentionally design a
migration. Existing Reddit posts remain in the subreddit; this kit does not delete them.

A replacement app still needs to comply with Reddit's rules and review process. This
kit is for code reuse, not for bypassing an enforcement action.
