import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/stores";
import LogoutButton from "@/components/LogoutButton";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const store = await getStore(storeId);
  if (!store) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← All stores
          </Link>
          <h1 className="text-xl font-bold text-gray-800 mt-1">{store.name}</h1>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex gap-4 text-sm font-medium">
            <Link href={`/store/${storeId}`} className="text-gray-600 hover:text-indigo-600 transition">
              Dashboard
            </Link>
            <Link href={`/store/${storeId}/kpi`} className="text-gray-600 hover:text-indigo-600 transition">
              KPI Input
            </Link>
            <Link href={`/store/${storeId}/tasks`} className="text-gray-600 hover:text-indigo-600 transition">
              Tasks
            </Link>
            <Link href={`/store/${storeId}/weekly`} className="text-gray-600 hover:text-indigo-600 transition">
              週次入力
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
