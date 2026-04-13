import { StaffProfile, StaffRank } from "../settings-types";

const KEY = "salon_os_staff_profiles";

function loadAll(): StaffProfile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAll(profiles: StaffProfile[]): void {
  localStorage.setItem(KEY, JSON.stringify(profiles));
}

export function getStaffByStore(storeId: string): StaffProfile[] {
  return loadAll()
    .filter((p) => p.storeId === storeId && p.isActive)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function getActiveStaffOptions(
  storeId: string
): { id: string; name: string; rank: StaffRank }[] {
  return getStaffByStore(storeId).map((p) => ({
    id: p.id,
    name: p.name,
    rank: p.rank,
  }));
}

export function addStaff(params: {
  storeId: string;
  name: string;
  rank: StaffRank;
}): { ok: boolean; error?: string } {
  const all = loadAll();
  const storeStaff = all.filter(
    (p) => p.storeId === params.storeId && p.isActive
  );

  if (storeStaff.length >= 10) {
    return { ok: false, error: "1店舗あたり最大10名までです" };
  }

  const duplicate = storeStaff.find(
    (p) => p.name.trim() === params.name.trim()
  );
  if (duplicate) {
    return { ok: false, error: "同じ名前のスタッフが既に存在します" };
  }

  const newProfile: StaffProfile = {
    id: crypto.randomUUID(),
    storeId: params.storeId,
    name: params.name.trim(),
    rank: params.rank,
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  saveAll([...all, newProfile]);
  return { ok: true };
}

export function updateStaff(
  id: string,
  params: {
    name: string;
    rank: StaffRank;
  }
): { ok: boolean; error?: string } {
  const all = loadAll();
  const target = all.find((p) => p.id === id);

  if (!target) {
    return { ok: false, error: "スタッフが見つかりません" };
  }

  const duplicate = all.find(
    (p) =>
      p.storeId === target.storeId &&
      p.isActive &&
      p.id !== id &&
      p.name.trim() === params.name.trim()
  );

  if (duplicate) {
    return { ok: false, error: "同じ名前のスタッフが既に存在します" };
  }

  const updated = all.map((p) =>
    p.id === id ? { ...p, name: params.name.trim(), rank: params.rank } : p
  );

  saveAll(updated);
  return { ok: true };
}

export function removeStaff(id: string): void {
  const all = loadAll();
  saveAll(all.map((p) => (p.id === id ? { ...p, isActive: false } : p)));
}