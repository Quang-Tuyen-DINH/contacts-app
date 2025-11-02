'use client';

import { useRouter } from 'next/navigation';
import type { Contact } from '@/shared/models/Contact.model';
import ContactCreateUpdateForm from '../_components/contactCreateUpdateForm';

const NewContactPage = ({ contact }: { contact: Contact | null }) => {
  const router = useRouter();
  const handleCancel = () => router.push('/contacts');

  return (
    <ContactCreateUpdateForm
      contactToBeUpdated={contact}
      handleCancel={handleCancel}
    />
  );
}

export default NewContactPage;