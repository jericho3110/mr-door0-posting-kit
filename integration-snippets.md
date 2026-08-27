# Integration Snippets

These are additions to make in the host bot. Merge them into existing files; do not
replace whole files.

## `devvit.json`

Add one subreddit menu item inside the existing `menu.items` array:

```json
{
  "label": "Post now",
  "description": "Compose and publish a text post to this subreddit.",
  "location": "subreddit",
  "forUserType": "moderator",
  "endpoint": "/internal/menu/post-now"
}
```

Add one form inside the existing `forms` object:

```json
"postNow": "/internal/form/post-now-submit"
```

Add optional defaults inside the host bot's existing `settings.subreddit` object:

```json
"postingTitle": {
  "type": "string",
  "label": "Posting default title",
  "defaultValue": "Weekly Episode Discussion Thread"
},
"postingBody": {
  "type": "paragraph",
  "label": "Posting default body",
  "defaultValue": "Share your theories, reactions, and favorite moments below."
}
```

Ensure the host bot already has Reddit moderator API permission, or add it without
removing other permissions:

```json
"permissions": {
  "reddit": { "enable": true, "scope": "moderator" }
}
```

## Existing menu route file

Add imports using the host bot's actual relative path:

```ts
import { buildPostNowForm } from "../features/posting/form.js";
```

Add this route to the existing menu router:

```ts
menu.post("/post-now", async (c) => {
  await c.req.json<MenuItemRequest>();
  return c.json<UiResponse>(
    {
      showForm: {
        name: "postNow",
        form: await buildPostNowForm(),
      },
    },
    200,
  );
});
```

## Existing form route file

Add imports using the host bot's actual relative path:

```ts
import { submitTextPost } from "../features/posting/posting.js";
```

Add this route to the existing form router:

```ts
forms.post("/post-now-submit", async (c) => {
  const values = await c.req.json<{ title?: string; body?: string }>();
  const result = await submitTextPost({
    title: values.title ?? "",
    body: values.body ?? "",
  });
  const message = result.success
    ? `Post created successfully (${result.postId}).`
    : result.message;
  return c.json<UiResponse>({ showToast: message }, 200);
});
```

Remove `PostInput` from the import if the host TypeScript compiler reports it as
unused; the route does not require that type.

## Verification

From the host bot directory:

```bash
npm install
npm run test
npm run dev
```

Use the subreddit moderator menu and choose **Post now**. Confirm the post is made
in the current subreddit.

Then upload the host bot using its own app name and deployment process:

```bash
npm run deploy
```

The feature kit never changes the host bot's app name, server port, or network setup.
