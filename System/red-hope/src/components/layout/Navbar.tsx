import React from 'react';
import { Link } from 'react-router-dom';
import { GiBlood } from 'react-icons/gi';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface NavbarProps {
  // You can add props here if needed in the future
}

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <GiBlood className="text-4xl text-red-600" />
              <span className="text-2xl font-bold text-red-600 ml-2">RED</span>
              <span className="text-2xl font-bold text-gray-800">HOPE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-600 font-medium">Home</Link>
            <Link to="/blood-needs" className="text-gray-700 hover:text-red-600 font-medium">Find Blood</Link>
            <Link to="/become-donor" className="text-gray-700 hover:text-red-600 font-medium">Become Donor</Link>
            <Link to="/hospitals" className="text-gray-700 hover:text-red-600 font-medium">Hospitals</Link>
            <Link to="/about" className="text-gray-700 hover:text-red-600 font-medium">About</Link>
            <Link to="/faqs" className="text-gray-700 hover:text-red-600 font-medium">FAQs</Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;