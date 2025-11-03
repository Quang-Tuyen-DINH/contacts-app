'use client';

import { useRouter } from 'next/navigation';
import type { Contact } from '@/shared/models/Contact.model';
import ContactCreateUpdateForm from '../_components/contactCreateUpdateForm';

const NewContactPage = () => {

  return (
    <main>
      <h1>New contact</h1>
      <ContactCreateUpdateForm
        contactToBeUpdated={null}
      />
    </main>
  );
}

export default NewContactPage;