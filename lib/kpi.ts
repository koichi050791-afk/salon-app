import { createClient } from "@/lib/supabase/client";
import { WeeklyKPI } from "@/lib/types";

export async function getKPI(storeId: string, week: string): Promise<WeeklyKPI | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("weekly_inputs")
    .select("store_id, week, revenue, visitors, staff_count")
    .eq("store_id", storeId)
    .eq("week", week)
    .single();

  if (error || !data) return null;

  return {
    storeId: data.store_id,
    week: data.week,
    revenue: Number(data.revenue),
    visitors: data.visitors,
    staffCount: data.staff_count,
  };
}

// Upsert — same week & store always overwrites existing row.
export async function saveKPI(kpi: WeeklyKPI): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase
    .from("weekly_inputs")
    .upsert(
      {
        store_id: kpi.storeId,
        week: kpi.week,
        revenue: kpi.revenue,
        visitors: kpi.visitors,
        staff_count: kpi.staffCount,
      },
      { onConflict: "store_id,week" }
    );

  return { error: error?.message ?? null };
}
