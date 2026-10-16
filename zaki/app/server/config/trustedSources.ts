// Allow-list for lesson-pack research (Claude server-side web search, `allowed_domains`).
// Plain hostnames; subdomains are covered. A path suffix is allowed for web search only.
// Keep this list short and educational/official. Review before adding anything.
export const TRUSTED_RESEARCH_DOMAINS: string[] = [
  "khanacademy.org",
  "bbc.co.uk/bitesize",
  "britannica.com",
  "kids.britannica.com",
  "nationalgeographic.com",
  "kids.nationalgeographic.com",
  "ck12.org",
  "education.gov.qa",
  "edu.gov.qa",
  "crdp.org",
  "unicef.org",
  "nasa.gov",
  "usgs.gov",
];

/** True when a URL's host (and path, for path-scoped entries) is on the allow-list. */
export function isTrustedUrl(url: string): boolean {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  const host = u.hostname.toLowerCase().replace(/^www\./, "");
  return TRUSTED_RESEARCH_DOMAINS.some((entry) => {
    const [d, ...rest] = entry.split("/");
    const path = rest.length ? "/" + rest.join("/") : "";
    const hostOk = host === d || host.endsWith("." + d);
    return hostOk && (!path || u.pathname.startsWith(path));
  });
}
