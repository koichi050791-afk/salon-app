import { getSupabaseClient } from "../supabase/client";
import type { StaffProfile, StaffRank } from "../settings-types";

type StaffRow = {
  id: string;
  store_id: string;
  name: string;
  rank: StaffRank;
  is_active: boolean;
  created_at: string;
};

function mapRow(row: StaffRow): StaffProfile {
  return {
    id: row.id,
    storeId: row.store_id,
    name: row.name,
    rank: row.rank,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function getStaffByStore(storeId: string): Promise<StaffProfile[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("staff")
    .select("id, store_id, name, rank, is_active, created_at")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as StaffRow[]).map(mapRow);
}

export async function addStaff(input: {
  storeId: string;
  name: string;
  rank: StaffRank;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.from("staff").insert([
    {
      store_id: input.storeId,
      name: input.name,
      rank: input.rank,
      is_active: true,
    },
  ]);

  console.log("INSERT RESULT", { data, error });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function updateStaff(
  id: string,
  params: { name: string; rank: StaffRank }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const trimmedName = params.name.trim();

  if (!trimmedName) {
    return { ok: false, error: "名前を入力してください" };
  }

  const { data: current, error: currentError } = await supabase
    .from("staff")
    .select("id, store_id")
    .eq("id", id)
    .single();

  if (currentError || !current) {
    return { ok: false, error: "スタッフが見つかりません" };
  }

  const { data: duplicateData, error: duplicateError } = await supabase
    .from("staff")
    .select("id")
    .eq("store_id", current.store_id)
    .eq("is_active", true)
    .eq("name", trimmedName)
    .neq("id", id)
    .limit(1);

  if (duplicateError) {
    return { ok: false, error: duplicateError.message };
  }

  if (duplicateData && duplicateData.length > 0) {
    return { ok: false, error: "同じ名前のスタッフが既に存在します" };
  }

  const { error } = await supabase
    .from("staff")
    .update({
      name: trimmedName,
      rank: params.rank,
    })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function removeStaff(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("staff")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}