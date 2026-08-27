import { context, redis } from "@devvit/web/server";
import {
  DEFAULT_POST_BODY,
  DEFAULT_POST_TITLE,
  submitTextPost,
} from "./posting.js";

export const REDIS_PREFIX = "postingFeature";

function weekKey(date: Date): string {
  const day = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const dayNumber = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((day.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${day.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function createdWeekKey(): string {
  return `${REDIS_PREFIX}:lastCreatedWeek:${context.subredditId}`;
}

export async function runWeeklyPostingTask(): Promise<void> {
  const currentWeek = weekKey(new Date());
  if ((await redis.get(createdWeekKey())) === currentWeek) return;

  const post = await submitTextPost(
    {
      title: DEFAULT_POST_TITLE,
      body: DEFAULT_POST_BODY,
    },
    false,
  );
  if (!post.success) throw new Error(post.message);

  await redis.set(createdWeekKey(), currentWeek);
}
