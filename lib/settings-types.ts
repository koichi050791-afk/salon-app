export type StaffRank = "top" | "stylist" | "junior" | "colorist";

export const RANK_LABELS: Record<StaffRank, string> = {
  top: "トップスタイリスト",
  stylist: "スタイリスト",
  junior: "ジュニアスタイリスト",
  colorist: "カラーリスト",
};

export type StaffProfile = {
  id: string;
  storeId: string;
  name: string;
  rank: StaffRank;
  isActive: boolean;
  createdAt: string;
};