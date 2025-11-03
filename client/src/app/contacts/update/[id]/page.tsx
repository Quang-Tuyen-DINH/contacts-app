import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import type { Contact } from '@/shared/models/Contact.model';
import ContactCreateUpdateForm from '../../_components/contactCreateUpdateForm';
import "../../../../styles/contacts/update/Page.scss";

async function getContactOrNull(id: string): Promise<Contact | null> {
  console.log("THIS IS ID ",id)
  try {
    const res = await fetch(api(`/contacts/${id}`), { cache: 'no-store' });
    if (!res.ok) {
      console.error(`GET /contacts/${id} -> HTTP ${res.status}`);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error('Failed to fetch contact', err);
    return null;
  }
}

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id?: string }>;
}) {
  const p = await params;
  const raw = p?.id;
  const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
  if (!id) notFound();

  const contact = await getContactOrNull(id);
  if (!contact) notFound();

  return (
    <main className="contact-update-container">
      <h1 className="contact-update-container__title">New contact</h1>
      <div className="contact-update-container__body">
        <ContactCreateUpdateForm contactToBeUpdated={contact} />
      </div>
    </main>
  );
}