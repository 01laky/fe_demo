import axios from 'axios';
import { env } from '../../config/env';

export interface StoryListItem {
  id: number;
  title: string;
  creatorId: string;
  creatorName: string;
  imageCount: number;
  coverUrl: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
}

export interface StoryMineRow {
  id: number;
  title: string;
  state: string;
  publishedAt: string | null;
  expiresAt: string | null;
  scheduledPublishAt: string | null;
  createdAt: string;
  imageCount: number;
  faceIds: number[];
}

export function storiesListRelativePath(faceIndex: string): string {
  return `/${faceIndex}/stories`;
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function fetchStoriesForFace(
  token: string,
  faceId: number
): Promise<StoryListItem[]> {
  const { data } = await axios.get<StoryListItem[]>(`${env.apiUrl}/api/stories`, {
    params: { faceId },
    headers: authHeaders(token),
  });
  return data;
}

export async function fetchMyStories(
  token: string,
  faceId?: number
): Promise<StoryMineRow[]> {
  const { data } = await axios.get<StoryMineRow[]>(`${env.apiUrl}/api/stories/me`, {
    params: faceId != null ? { faceId } : {},
    headers: authHeaders(token),
  });
  return data;
}

export async function createStoryDraft(
  token: string,
  body: { title: string; faceIds?: number[] }
): Promise<{ id: number }> {
  const payload: Record<string, unknown> = { title: body.title };
  if (body.faceIds != null && body.faceIds.length > 0) {
    payload.faceIds = body.faceIds;
  }
  const { data } = await axios.post<{ id: number }>(`${env.apiUrl}/api/stories`, payload, {
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
  });
  return data;
}

export async function uploadStoryImage(
  token: string,
  storyId: number,
  file: File,
  sortOrder: number,
  description?: string
): Promise<void> {
  const form = new FormData();
  form.append('file', file);
  form.append('sortOrder', String(sortOrder));
  if (description) form.append('description', description);
  await axios.post(`${env.apiUrl}/api/stories/${storyId}/images`, form, {
    headers: authHeaders(token),
  });
}

export async function publishStory(
  token: string,
  storyId: number,
  scheduledPublishAt?: string | null
): Promise<void> {
  await axios.post(
    `${env.apiUrl}/api/stories/${storyId}/publish`,
    { scheduledPublishAt: scheduledPublishAt ?? null },
    { headers: { ...authHeaders(token), 'Content-Type': 'application/json' } }
  );
}

export async function deleteStory(token: string, storyId: number): Promise<void> {
  await axios.delete(`${env.apiUrl}/api/stories/${storyId}`, { headers: authHeaders(token) });
}
