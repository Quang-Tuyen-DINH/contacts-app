'use client';

import ContactCreateUpdateForm from '../_components/contactCreateUpdateForm';
import "../../../styles/contacts/new/Page.scss";

const NewContactPage = () => {

  return (
    <main className="contact-create-container">
      <h1 className="contact-create-container__title">New contact</h1>
      <div className="contact-create-container__body">
        <ContactCreateUpdateForm
          contactToBeUpdated={null}
        />
      </div>
    </main>
  );
}

export default NewContactPage;