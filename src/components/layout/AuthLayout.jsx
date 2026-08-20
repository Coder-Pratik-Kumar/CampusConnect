import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/60 via-[#F9F9FF] to-teal-50/40 flex flex-col justify-center items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto my-auto">
        <Outlet />
      </div>
    </div>
  );
};

