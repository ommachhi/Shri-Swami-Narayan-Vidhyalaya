import React from 'react';
import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white shadow-sm px-8 py-4 flex items-center justify-between z-10">
          <h1 className="text-xl font-semibold text-gray-800">SSNV Control Panel</h1>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
