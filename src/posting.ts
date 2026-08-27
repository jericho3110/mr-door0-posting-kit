import { reddit } from "@devvit/web/server";
import type { T3 } from "@devvit/web/shared";

export const DEFAULT_POST_TITLE = "Weekly Episode Discussion Thread";
export const DEFAULT_POST_BODY =
  "Welcome to this week's TV discussion thread.\n\nShare your theories, reactions, and favorite moments below.";

export type PostInput = {
  title: string;
  body: string;
};

export type PostResult =
  { success: true; postId: T3 } | { success: false; message: string };

export async function canCurrentUserCreatePost(): Promise<string | undefined> {
  const currentUser = await reddit.getCurrentUser();
  const subreddit = await reddit.getCurrentSubreddit();
  if (!currentUser) return "Unable to identify current user.";

  const permissions = await currentUser.getModPermissionsForSubreddit(
    subreddit.name,
  );
  const canManagePosts =
    permissions.includes("all") || permissions.includes("posts");
  return canManagePosts
    ? undefined
    : "You need mod post permissions to create a post.";
}

export async function submitTextPost(
  input: PostInput,
  requireModerator = true,
): Promise<PostResult> {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) {
    return { success: false, message: "Title and body are required." };
  }

  if (requireModerator) {
    const permissionError = await canCurrentUserCreatePost();
    if (permissionError) {
      return { success: false, message: permissionError };
    }
  }

  const subreddit = await reddit.getCurrentSubreddit();
  try {
    const post = await reddit.submitPost({
      subredditName: subreddit.name,
      title,
      text: body,
      runAs: "APP",
    });
    return { success: true, postId: post.id };
  } catch (error) {
    console.error(
      `[posting-feature] Failed to submit post to r/${subreddit.name}`,
      error,
    );
    return {
      success: false,
      message: "Unable to create the post. Check the app logs.",
    };
  }
}
