import React from 'react';
import "../../../styles/contacts/_component/ContactSearchBar.scss"

type ContactSearchBarProps = {
  searchContact: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function ContactSearchBar({ searchContact }: ContactSearchBarProps) {
  return (
    <div className="contact-searchbar-container">
      <input type="search" onChange={searchContact} placeholder="Search for emails by job..." />
    </div>
  )
}

export default ContactSearchBar
