import { createClient } from "@/lib/supabase/server";
import { Store } from "@/lib/types";

export async function getStores(): Promise<Store[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name")
    .order("name");

  if (error) {
    console.error("getStores error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getStore(id: string): Promise<Store | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}
