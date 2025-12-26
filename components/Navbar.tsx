
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="flex justify-center gap-8 py-6 border-b border-gray-100">
      <Link to="/" className="text-sm font-medium hover:text-gray-500 transition-colors">Home</Link>
      <Link to="/community" className="text-sm font-medium hover:text-gray-500 transition-colors">Community</Link>
      <Link to="/guestbook" className="text-sm font-medium hover:text-gray-500 transition-colors">Guest book</Link>
    </nav>
  );
};

export default Navbar;
