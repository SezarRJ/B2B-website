import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function readEnv(name: string): string | undefined {
  const viteValue = import.meta.env[name];
  const processValue = typeof process !== "undefined" ? process.env?.[name] : undefined;
  return viteValue || processValue;
}

function createSupabaseClient() {
  const SUPABASE_URL = readEnv("VITE_SUPABASE_URL") || readEnv("SUPABASE_URL");
  const SUPABASE_PUBLISHABLE_KEY =
    readEnv("VITE_SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("VITE_SUPABASE_ANON_KEY") ||
    readEnv("SUPABASE_PUBLISHABLE_KEY") ||
    readEnv("SUPABASE_ANON_KEY");

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the environment.",
    );
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createSupabaseClient>, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
