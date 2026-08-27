import { settings } from "@devvit/web/server";
import type { Form } from "@devvit/web/shared";
import { DEFAULT_POST_BODY, DEFAULT_POST_TITLE } from "./posting.js";

export type PostNowFormValues = {
  title?: string;
  body?: string;
};

export async function buildPostNowForm(): Promise<Form> {
  const configuredTitle = (await settings.get<string>("postingTitle"))?.trim();
  const configuredBody = (await settings.get<string>("postingBody"))?.trim();

  return {
    fields: [
      {
        name: "title",
        label: "Post title",
        type: "string",
        required: true,
        defaultValue: configuredTitle || DEFAULT_POST_TITLE,
      },
      {
        name: "body",
        label: "Post body",
        type: "paragraph",
        required: true,
        defaultValue: configuredBody || DEFAULT_POST_BODY,
      },
    ],
    title: "Post now",
    acceptLabel: "Publish post",
    cancelLabel: "Cancel",
  };
}
