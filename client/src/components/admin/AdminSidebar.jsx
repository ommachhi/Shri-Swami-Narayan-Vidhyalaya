import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiHome, FiUpload, FiUsers, FiSettings, FiLogOut } from 'react-icons/fi';

const AdminSidebar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FiHome /> },
    { name: 'Upload Result', path: '/admin/upload', icon: <FiUpload /> },
    { name: 'Students', path: '/admin/students', icon: <FiUsers /> },
    { name: 'Settings', path: '/admin/settings', icon: <FiSettings /> },
  ];

  return (
    <div className="w-64 bg-primary-dark text-white flex flex-col h-full shadow-2xl backdrop-blur-md bg-opacity-95">
      <div className="p-6 flex items-center justify-center border-b border-primary">
        <h2 className="text-2xl font-bold tracking-wider text-white">SSNV Admin</h2>
      </div>
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out ${
                isActive
                  ? 'bg-primary-light text-white shadow-lg shadow-primary-light/30'
                  : 'text-gray-300 hover:bg-primary hover:text-white hover:translate-x-1'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-primary">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <FiLogOut className="text-xl" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
