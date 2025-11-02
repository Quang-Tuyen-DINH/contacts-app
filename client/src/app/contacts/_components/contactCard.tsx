"use client"

import React from 'react';
import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipBoard';
import { Contact } from '@/shared/models/Contact.model';
import { useNotify } from '@/providers/Notification.provider';
import "../../../styles/contacts/_component/ContactCard.scss";
import { Button } from '@mui/material';

type ContactCardProps = {
  contact: Contact;
  handleUpdate: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleDelete: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function ContactCard({
  contact,
  handleUpdate,
  handleDelete
}: ContactCardProps) {
  const [copiedText, copy] = useCopyToClipboard();
  const notify = useNotify();

  const handleCopy = (text: string) => {
    copy(text)
      .then(() => {
        notify({ type: "copyEmail", label: text });
      })
      .catch((err) => {
        notify({ type: "errorUnexpected", label: JSON.stringify(err) });
        console.error('Failed to copy!', err);
      })
  }
  
  return (
    <div className="contact-card-container">
      <div className="contact-card-container__header">
        <div className="contact-card-container__header__name">
          <h2>{contact.firstName} {contact.lastName}</h2>
        </div>
      </div>
      <div className="contact-card-container__body">
        <span className="contact-card-container__body__job">
          Job: {contact.job} 
        </span>
        <span className="contact-card-container__body__email">
          email: {contact.email}
        </span>
        <span className="contact-card-container__body__comment">
          comment: {contact.comment ?? ""}
        </span>
      </div>
      <div className="contact-card-container__buttons">
        <Button variant="outlined" size="small" onClick={handleUpdate}>Update</Button>
        <Button variant="outlined" size="small" color="warning" onClick={handleDelete}>Delete</Button>
        <Button variant="outlined" size="small" onClick={() => handleCopy(contact.email)}>Email</Button>
      </div>
    </div>
  )
}

export default ContactCard
