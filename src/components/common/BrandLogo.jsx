import React from 'react';
import { Link } from 'react-router-dom';

export const BrandLogo = ({ link = true, className }) => {
  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className || ''}`}>
      {/* Graduation Cap Outline Icon matching Stitch logo */}
      <div className="flex items-center justify-center h-8 w-8 text-brand-primary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
          <circle cx="18" cy="17" r="1" fill="currentColor" />
        </svg>
      </div>

      <span className="font-heading font-extrabold text-xl tracking-tight text-indigo-900">
        CampusConnect
      </span>
    </div>
  );

  if (link) {
    return (
      <Link to="/dashboard" className="focus:outline-none group">
        {content}
      </Link>
    );
  }

  return content;
};
