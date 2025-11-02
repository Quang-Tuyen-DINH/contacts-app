'use client';

import useSWR from 'swr';
import { Alert, Button, CircularProgress, Pagination } from '@mui/material';
import type { Contact } from '@/shared/models/Contact.model';
import { useNotify } from '@/providers/Notification.provider';
import { useSearchParams, useRouter } from 'next/navigation';
import ContactCard from './contactCard';
import { api } from '@/lib/api';
import { useEffect, useRef, useState } from 'react';
import { PageData } from '../page';
import "../../../styles/contacts/_component/ContactsList.scss";
import ContactSearchBar from './ContactSearchBar';

type ContactsListProps = {
  initial: PageData;
  search: string;
  initialPage: number;
  initialLimit: number
}

const ContactList = ({
  initial,
  search,
  initialPage,
  initialLimit
}: ContactsListProps) => {
  const notify = useNotify();
  const router = useRouter();
  const params = useSearchParams();
  const currentSearch = params.get('search') ?? '';
  
  const pageFromUrl = Number(params.get('page') ?? initialPage) || initialPage;
  const limitFromUrl = Number(params.get('limit') ?? initialLimit) || initialLimit;

  const key = `/api/contacts?page=${pageFromUrl}&limit=${limitFromUrl}${currentSearch ? `&search=${encodeURIComponent(currentSearch)}` : ''}`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<PageData>(key, { fallbackData: initial });
  const loading = isLoading && !data;
  const refreshing = isValidating && !!data;

  const [emailToSearchContacts, setEmailToSearchContacts] = useState<string>("");
  const [debouncedEmail, setDebouncedEmail] = useState(emailToSearchContacts);

  useEffect(() => {
    setEmailToSearchContacts(currentSearch);
  }, [currentSearch]);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEmail(emailToSearchContacts);
    }, 500);

    return () => clearTimeout(handler);
  }, [emailToSearchContacts]);

  useEffect(() => {
    if (debouncedEmail !== currentSearch) {
      updateQuery(1, limitFromUrl, debouncedEmail);
    }
  }, [limitFromUrl, debouncedEmail]);

  const updateQuery = (nextPage: number, nextLimit: number, nextSearch?: string) => {
    const qs = new URLSearchParams(params.toString());
    qs.set('page', String(nextPage));
    qs.set('limit', String(nextLimit));

    const effectiveSearch = (typeof nextSearch === 'string' ? nextSearch : currentSearch).trim();
    if (effectiveSearch) {
      qs.set('search', effectiveSearch);
    } else {
      qs.delete('search');
    }

    const nextHref = `/contacts?${qs.toString()}`;
    const currentHref = `/contacts?${params.toString()}`;
    if (nextHref !== currentHref) {
      router.replace(nextHref, { scroll: false });
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, nextPage: number) => {
    updateQuery(nextPage, limitFromUrl);
  };

  const handleLimitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    const nextLimit = Number(event.target.value) || initialLimit;
    updateQuery(1, nextLimit); // reset to first page when page size changes
  };

  const handleSearchContact = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailToSearchContacts(event.target.value);
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>, contact: Contact) => {
    e.preventDefault();

    try {
      const response = await fetch(`${api("/contacts")}/${contact._id}`, {
        method: "DELETE"
      });
      if (response.status === 204) {
        const currentList = data ?? initial;
        const wasLastItemOnPage = currentList.data.length === 1;

        if (wasLastItemOnPage && pageFromUrl > 1) {
          updateQuery(pageFromUrl - 1, limitFromUrl);
        } else {
          await mutate(); // revalidate the current key
        }

        notify({ type: "removeContact", label: contact.lastName });
      };
    } catch (err) {
      notify({ type: "errorUnexpected", label: JSON.stringify(err) });
      console.error(err);
    }
  }

  const handleUpdate = (e: React.MouseEvent<HTMLButtonElement>, contact: Contact) => {
    e.preventDefault();
    router.push(`/contacts/update/${contact._id}`)
  }

  const handleNewContact = () => {
    router.push("/contacts/new");
  }

  if (error) return <Alert severity="error">Failed to load contacts.</Alert>;
  if (isLoading && !data) return <CircularProgress size={24} />;

  const pageData = data ?? initial;             // avoid naming clash with `page`
  const currentPage = pageFromUrl;
  const totalPages = pageData.pages || 1;
  const total = pageData.total;

  if (!pageData.data.length) {
    return <Alert severity="info">No contacts found.</Alert>;
  }

  return (
    <div className="contacts-container">
      <div className="contacts-container__title">
        <h2>Contacts List</h2>
      </div>
      <div className="contacts-container__header">
        <ContactSearchBar searchContact={handleSearchContact} />
        <Button variant="outlined" size="small" color="primary"  onClick={handleNewContact}>Add contact</Button>
      </div>
      <div className="contacts-container__body">
        <div className="contacts-container__body__list-section">
          {refreshing &&
            <div className="contacts-container__body__list-section__loader">
              <CircularProgress />
            </div>
          }
          {!refreshing &&
            <div className="contacts-container__body__list-section__contacts">
              {pageData.data.map((contact: Contact) => (
                <ContactCard
                  key={contact._id}
                  contact={contact}
                  handleDelete={(e: React.MouseEvent<HTMLButtonElement>) => handleDelete(e, contact)}
                  handleUpdate={(e: React.MouseEvent<HTMLButtonElement>) => handleUpdate(e, contact)}
                />
              ))}
            </div>
          }
        </div>
      </div>
      {!refreshing &&
        <div className="contacts-container__footer">
          <div className="contacts-container__footer__pagination">
            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
          </div>
          <div className="contacts-container__footer__limit-input">
            <input value={limitFromUrl} onChange={handleLimitChange}></input>
            <span>contacts per page of total {total} contact(s)</span>
          </div>
        </div>
      }
    </div>
  );
}

export default ContactList;