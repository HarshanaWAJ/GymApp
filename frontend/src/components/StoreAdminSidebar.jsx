import React, { useState } from 'react';
import '../styles/StoreSidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button className="toggle-btn" onClick={toggleSidebar}>
        ☰
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <h2>Store Panel</h2>
        <a href="/admin-dashboard">Summary</a>
        <a href="/admin-product-management">Products</a>
        <a href="/admin-sale-summary">Sales</a>
        <a href="/admin-trainer-management">Trainer Management</a>
        <a href="/admin-appointment-management">Appointment Management</a>
        <a href="/admin-reviews">Reviews</a>
      </div>
    </>
  );
};

export default Sidebar;
