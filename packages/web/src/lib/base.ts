/**
 * Public base path of the app, always with a trailing slash ("/" or "/quiz/").
 *
 * Production builds use a placeholder that the container entrypoint replaces
 * with `BASE_PATH`, so one image can be served under any sub path.
 */
export const BASE_URL = import.meta.env.BASE_URL

/** Router base path without the trailing slash ("/" stays "/"). */
export const BASE_PATH = BASE_URL.replace(/\/$/, "") || "/"

/** Prefixes a root-relative URL ("/media/x.png") with the base path; other URLs stay as they are. */
export const withBase = (url: string): string => {
  if (!url.startsWith("/") || url.startsWith("//")) {
    return url
  }

  return BASE_URL + url.slice(1)
}

/** Absolute URL of the app root without the trailing slash, e.g. for invite links. */
export const appOrigin = (): string =>
  window.location.origin + BASE_PATH.replace(/\/$/, "")
