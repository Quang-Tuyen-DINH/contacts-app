import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import type { Contact } from '@/shared/models/Contact.model';
import ContactCreateUpdateForm from '../../_components/contactCreateUpdateForm';
import "../../../../styles/contacts/update/Page.scss";
import ContactNotifier from '../../_components/ContactNotifier';

type PageProps = { params: Promise<{ id?: string }> };

const EditContactPage = async ({
  params,
}: PageProps) => {
  const p = await params;
  const raw = p?.id;
  const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;
  if (!id) notFound();

  let contact: Contact | null = null;
  let error: string | undefined;

  const getContactOrNull = async (id: string): Promise<Contact | null> => {
    try {
      const res = await fetch(api(`/contacts/${id}`), { cache: 'no-store' });
      if (res.status === 404) {
        notFound();
      }
      if (!res.ok) {
        error = `Failed to load contact (HTTP ${res.status})`;
        return null;
      } else {
        return await res.json();
      }
    } catch (err) {
      error = "Network error while fetching contact";
      return null;
    }
  }

  contact = await getContactOrNull(id) as Contact;

  if (!contact) notFound();

  return (
    <div className="contact-update-container">
      <h1 className="contact-update-container__title">Update contact</h1>
      <div className="contact-update-container__body">
        <ContactCreateUpdateForm contactToBeUpdated={contact} />
      </div>
      <ContactNotifier error={error} />
    </div>
  );
}

export default EditContactPage;