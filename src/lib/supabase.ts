import { createClient, Session } from "@supabase/supabase-js";

function readEnv(name: string): string | undefined {
  const viteValue = import.meta.env[name];
  const processValue = typeof process !== "undefined" ? process.env?.[name] : undefined;
  return viteValue || processValue;
}

function getSupabaseConfig() {
  const url = readEnv("VITE_SUPABASE_URL") || readEnv("SUPABASE_URL");
  const key =
    readEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("VITE_SUPABASE_ANON_KEY") ||
    readEnv("SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("SUPABASE_ANON_KEY");

  if (!url || !key) {
    throw new Error(
      "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the environment.",
    );
  }
  return { url, key };
}

function createSupabaseBrowserClient() {
  const { url, key } = getSupabaseConfig();
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseBrowserClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseBrowserClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseBrowserClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});

function clearAuthStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("dealcompass_token");
  localStorage.setItem("dealcompass_signed_out", "true");
  Object.keys(localStorage)
    .filter((key) => key.startsWith("sb-") || key.includes("supabase"))
    .forEach((key) => localStorage.removeItem(key));
}

export async function getSupabaseSession(): Promise<{
  session: Session | null;
  user: unknown | null;
}> {
  if (typeof window === "undefined") return { session: null, user: null };
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return { session, user: session?.user || null };
}

export async function loginWithSupabase(
  email: string,
  password?: string,
): Promise<{ session: Session | null; user: unknown | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: password || "",
  });
  if (error) throw error;
  if (typeof window !== "undefined") {
    localStorage.removeItem("dealcompass_signed_out");
    if (data.session?.access_token)
      localStorage.setItem("dealcompass_token", data.session.access_token);
  }
  return { session: data.session, user: data.user };
}

export async function logoutWithSupabase() {
  clearAuthStorage();
  try {
    await supabase.auth.signOut();
  } catch {
    // If configuration is missing or the session is already gone, local logout above is enough.
  }
}
