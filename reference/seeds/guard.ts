// Keeps the sample data away from production. It refuses by default: a run is allowed only
// against a local database, or against staging when SEED_TARGET=staging is set on purpose.
// Production reaches Postgres under an internal name (db:5432), so a list of production
// names would miss it; only a list of what is allowed is safe.

type Env = Record<string, string | undefined>;

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
// api-staging is the staging API domain in docs/runbook.md; it is not under staging.
const STAGING_HOST = "staging.sightline.zarnik.com";
const STAGING_API_HOST = "api-staging.sightline.zarnik.com";

function hostOf(name: string, value: string): string {
  let u: URL;
  try {
    u = new URL(value);
  } catch {
    throw new Error(`Refusing to load sample data: ${name} is not a valid address.`);
  }
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (!host) throw new Error(`Refusing to load sample data: ${name} has no host.`);
  return host;
}

const isLocal = (host: string) => LOCAL_HOSTS.has(host);
const isStaging = (host: string) =>
  host === STAGING_HOST || host.endsWith(`.${STAGING_HOST}`) || host === STAGING_API_HOST;

/** Throws unless the environment points at a local database or, on purpose, at staging. */
export function refuseProduction(env: Env): void {
  const dbValue = env.DATABASE_URL;
  if (!dbValue) throw new Error("Refusing to load sample data: DATABASE_URL is not set.");
  const dbHost = hostOf("DATABASE_URL", dbValue);

  const web: { name: string; host: string; value: string }[] = [];
  for (const [name, value] of [
    ["SUPABASE_URL", env.SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL],
    ["SITE_URL", env.SITE_URL],
  ] as const) {
    if (value) web.push({ name, host: hostOf(name, value), value });
  }

  // Auth accounts are created through SUPABASE_URL, so it must be local or staging too.
  for (const w of web) {
    if (!isLocal(w.host) && !isStaging(w.host)) {
      throw new Error(
        `Refusing to load sample data: ${w.name} host "${w.host}" is not local or staging.`,
      );
    }
  }
  const supabase = web.find((w) => w.name === "SUPABASE_URL");
  if (supabase && !isLocal(supabase.host) && new URL(supabase.value).protocol !== "https:") {
    throw new Error(
      "Refusing to load sample data: SUPABASE_URL must use https unless it is local.",
    );
  }

  if (isLocal(dbHost)) return;
  if (env.SEED_TARGET === "staging" && web.some((w) => isStaging(w.host))) return;
  throw new Error(
    `Refusing to load sample data: database host "${dbHost}" is not local. ` +
      `For staging set SEED_TARGET=staging and a staging SITE_URL or SUPABASE_URL.`,
  );
}
