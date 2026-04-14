import { SavedDiagnosis } from "../types/os";

const KEY = "salon_os_saved_diagnoses";

export function loadSavedDiagnoses(): SavedDiagnosis[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveSavedDiagnoses(items: SavedDiagnosis[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getSavedDiagnosesByStoreAndMonth(
  storeId: string,
  yearMonth: string
): SavedDiagnosis[] {
  return loadSavedDiagnoses().filter(
    (item) => item.storeId === storeId && item.date.startsWith(yearMonth)
  );
}

export function getLatestSavedDiagnosisByStore(storeId: string): SavedDiagnosis | null {
  const items = loadSavedDiagnoses()
    .filter((item) => item.storeId === storeId)
    .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

  return items[0] ?? null;
}