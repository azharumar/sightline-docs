// Creates the Supabase Auth account behind each sample user, through the Auth admin API.
// No password is set, so nobody can sign in with a guessed or shared password. A person signs
// in by email link or password reset (see docs/runbook.md, Load sample data). The auth user id
// equals public.users.id, so the two match from the first sign in.
import { emailOf, USERS, userId } from "./people";

export type AuthConfig = { url: string; serviceKey: string; domain: string };

type Outcome = "created" | "exists" | "conflict";

async function call(cfg: AuthConfig, path: string, init: RequestInit = {}) {
  return fetch(`${cfg.url.replace(/\/$/, "")}/auth/v1/admin${path}`, {
    ...init,
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

/** Creates any missing auth user. Safe to run again: existing users are left as they are. */
export async function ensureAuthUsers(cfg: AuthConfig): Promise<Record<Outcome, string[]>> {
  const result: Record<Outcome, string[]> = { created: [], exists: [], conflict: [] };
  for (const u of USERS) {
    const id = userId(u.key);
    const email = emailOf(u, cfg.domain);
    const found = await call(cfg, `/users/${id}`);
    if (found.ok) {
      result.exists.push(email);
      continue;
    }
    if (found.status !== 404) {
      throw new Error(
        `Auth lookup for ${email} failed: HTTP ${found.status} ${await found.text()}`,
      );
    }
    const created = await call(cfg, "/users", {
      method: "POST",
      body: JSON.stringify({
        id,
        email,
        email_confirm: true,
        user_metadata: { full_name: u.fullName, sample_data: true },
      }),
    });
    if (created.ok) {
      result.created.push(email);
    } else if (created.status === 422 || created.status === 409) {
      // The email is already used by an auth user with another id. Do not touch it.
      result.conflict.push(email);
    } else {
      throw new Error(
        `Auth create for ${email} failed: HTTP ${created.status} ${await created.text()}`,
      );
    }
  }
  return result;
}
