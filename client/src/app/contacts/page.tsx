import { api } from "@/lib/api";
import { Contact } from "@/shared/models/Contact.model";
import ContactNotifier from "./_components/ContactNotifier";
import ContactList from "./_components/ContactsList";

export type PageData = {
  page: number;
  limit: number;
  total: number;
  pages: number;
  data: Contact[];
  error?: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;

type ContactsPageProps = {
  searchParams?: { search?: string; page?: string; limit?: string }
}

const getInitialData = async (search: string, page: number, limit: number): Promise<PageData> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search ? { search } : {})
    });
    const res = await fetch(api(`/contacts?${params}`), { cache: 'no-store' });
    if (!res.ok) {
      return { page: 1, limit: 0, total: 0, pages: 0, data: [], error: `HTTP ${res.status}` };
    }
    return res.json();
  } catch (err) {
    console.error('Failed to load contacts (SSR)', err);
    return { page: 1, limit: 0, total: 0, pages: 0, data: [], error: "Failed to load contacts" };
  }
}

const ContactsPage = async ({
  searchParams
}: ContactsPageProps) => {
  const search = searchParams?.search ?? '';
  const rawPage = Number(searchParams?.page ?? DEFAULT_PAGE);
  const rawLimit = Number(searchParams?.limit ?? DEFAULT_LIMIT);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : DEFAULT_PAGE;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 && rawLimit <= 100 ? Math.floor(rawLimit) : DEFAULT_LIMIT;

  const initial = await getInitialData(search, page, limit);

  return (
    <div>
      <ContactList initial={initial} initialPage={page} initialLimit={limit} />
      <ContactNotifier error={initial.error} />
    </div>
  );
}

export default ContactsPage;