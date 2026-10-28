export interface ProfileLinks {
  portfolio?: string;
  github?: string;
  linkedin?: string;
  notion?: string;
  tiktok?: string;
  twitch?: string;
  discord?: string;
  [key: string]: string | undefined;
}

export interface SoftSkill {
  title: string;
  text: string;
}

export interface SkillItem {
  name: string;
  icon?: string;
  skillicon?: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  items: SkillItem[];
}

export type EntryType = "job" | "project" | "education" | "award";

export interface Entry {
  type: EntryType;
  slug: string;
  title: string;
  date: string;
  start: string | null;
  end: string | null;
  current: boolean;
  body: string;
  bodyHtml: string;
  card_title?: string;
  summary?: string;
  role?: string;
  org?: string;
  link?: string;
  repo?: string;
  demo?: string;
  image?: string;
  tags?: string[];
  cvGroup?: string;
}

export interface Profile {
  schemaVersion: number;
  sourceCommit: string;
  profile: {
    name: string;
    displayName: string;
    handle?: string;
    headline: string;
    email: string;
    avatar?: string;
    links: ProfileLinks;
    about: {
      cv: string;
      portfolio: string;
      readme?: string;
    };
    softSkills: SoftSkill[];
  };
  skills: SkillGroup[];
  timeline: Entry[];
  projects: Entry[];
}

import fallback from "../data/profile.fallback.json";

const PROFILE_URL =
  "https://raw.githubusercontent.com/abrahdev/abrahdev/main/profile.json";

export const CV_URL =
  "https://raw.githubusercontent.com/abrahdev/abrahdev/main/CV_Abraham_Escalona.pdf";

const FETCH_TIMEOUT_MS = 8000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function assertProfile(value: unknown): asserts value is Profile {
  if (!isRecord(value)) throw new Error("profile.json no es un objeto");
  if (!isRecord(value.profile)) throw new Error("falta profile");
  if (!Array.isArray(value.skills)) throw new Error("falta skills");
  if (!Array.isArray(value.timeline)) throw new Error("falta timeline");
  if (!Array.isArray(value.projects)) throw new Error("falta projects");
}

async function fetchRemote(): Promise<Profile> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(`${PROFILE_URL}?v=${Date.now()}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: unknown = await response.json();
    assertProfile(data);
    return data;
  } finally {
    clearTimeout(timer);
  }
}

async function load(): Promise<Profile> {
  try {
    return await fetchRemote();
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.warn(`[profile] usando el fallback local: ${reason}`);
    return fallback as Profile;
  }
}

let cached: Promise<Profile> | undefined;

export function getProfile(): Promise<Profile> {
  cached ??= load();
  return cached;
}
