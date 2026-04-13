export type Store = {
  id: string;
  label: string;
};

export const STORES: Store[] = [
  { id: "umeda", label: "梅田店" },
  { id: "nigawa", label: "仁川店" },
  { id: "sakasegawa", label: "逆瀬川店" },
  { id: "kawanishi", label: "川西店" },
  { id: "nishinomiyakita", label: "西宮北口店" },
  { id: "sanda", label: "三田店" },
];

export const STORE_MAP: Record<string, string> = Object.fromEntries(
  STORES.map((s) => [s.id, s.label])
);