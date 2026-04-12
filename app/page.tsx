import Link from "next/link";
import { getStores } from "@/lib/stores";

export default async function HomePage() {
  const stores = await getStores();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Salon Manager</h1>
      <p className="text-gray-500 mb-10">Select a store to view its dashboard</p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        {stores.length === 0 && (
          <p className="text-center text-gray-400 text-sm">
            No stores found. Add rows to the <code>stores</code> table in Supabase.
          </p>
        )}
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/store/${store.id}`}
            className="block bg-white border border-gray-200 rounded-xl px-6 py-5 shadow-sm hover:shadow-md hover:border-indigo-400 transition"
          >
            <span className="text-lg font-semibold text-indigo-600">{store.name}</span>
            <p className="text-sm text-gray-400 mt-1">View dashboard →</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
