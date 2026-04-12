import { createClient } from "@/lib/supabase/client";

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
export interface StaffInput {
  userId: string;
  storeId: string;
  weekStartDate: string; // YYYY-MM-DD (Monday of the week)
  sales: number;
  clients: number;
  hours: number;
}

// ----------------------------------------------------------------
// Helper: get this week's Monday as YYYY-MM-DD
// ----------------------------------------------------------------
export function getThisMonday(): string {
  const now = new Date();
  const day = now.getDay();              // 0=Sun, 1=Mon … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // how many days back to Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

// ----------------------------------------------------------------
// Read — load existing row for this user/store/week
// ----------------------------------------------------------------
export async function getStaffInput(
  userId: string,
  storeId: string,
  weekStartDate: string
): Promise<StaffInput | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("weekly_staff_inputs")
    .select("user_id, store_id, week_start_date, sales, clients, hours")
    .eq("user_id", userId)
    .eq("store_id", storeId)
    .eq("week_start_date", weekStartDate)
    .single();

  if (error || !data) return null;
  return {
    userId:       data.user_id,
    storeId:      data.store_id,
    weekStartDate: data.week_start_date,
    sales:        Number(data.sales),
    clients:      data.clients,
    hours: Number(data.hours),
  };
}

// ----------------------------------------------------------------
// Write — upsert (same user+store+week overwrites)
// ----------------------------------------------------------------
export async function saveStaffInput(
  input: StaffInput
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("weekly_staff_inputs")
    .upsert(
      {
        user_id:         input.userId,
        store_id:        input.storeId,
        week_start_date: input.weekStartDate,
        sales:           input.sales,
        clients:         input.clients,
        hours:           input.hours,
      },
      { onConflict: "user_id,store_id,week_start_date" }
    );
  return { error: error?.message ?? null };
}
