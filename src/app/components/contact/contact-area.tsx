'use client';
import React from 'react';
import ContactTable from './contact-table';

const ContactArea = () => {
  return (
    <div className="space-y-4">
      {/* contact table start */}
      <ContactTable />
      {/* contact table end */}
    </div>
  );
};

export default ContactArea;