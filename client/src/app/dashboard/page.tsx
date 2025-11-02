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

const DashboardPage = async () => {
  const { total, error } = await getCountContacts();

  return (
    <main style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      <p>Name: Quang Tuyen DINH</p>
      <p>Total contacts: {total}</p>
      <DashboardNotifier error={error} />
    </main>
  );
}

export default DashboardPage;