import { api } from "@/lib/api";
import { REVALIDATE } from "@/lib/cache";
import DashboardNotifier from "./_components/DashboardNotifier";

export const revalidate = REVALIDATE.dashboard;

type CountResult = { total: number; error?: string };

const getCountContacts = async (): Promise<CountResult> => {
  try {
    const res = await fetch(api("/contacts?limit=1"), { next: { revalidate } });
    if (!res.ok) {
      return { total: 0, error: `HTTP ${res.status} while fetching contacts count` };
    }
    const body = await res.json();
    return { total: body.total ?? 0 };
  } catch (err) {
    console.error("Failed to fetch contact count", err);
    return { total: 0, error: "Failed to fetch contact count" };
  }
};

export default async function DashboardPage() {
  const { total, error } = await getCountContacts();

  return (
    <main style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      <p>Total contacts: {total}</p>
      <DashboardNotifier error={error} />
    </main>
  );
}