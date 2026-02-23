import React, { useState } from 'react';
import RoleSelection from '../components/auth/RoleSelection';
import DonorRegisterForm from '../components/auth/DonorRegisterForm';
// import HospitalRegistration from '..components/auth/HospitalRegisterForm';
// import RedCrossRegistration from './RedCrossRegistration';
import Navbar from '../components/layout/Navbar';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const RegisterPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'donor' | 'hospital' | 'redcross' | null>(null);

  const handleRoleSelect = (role: 'donor' | 'hospital' | 'redcross') => {
    setSelectedRole(role);
  };

  const handleBack = () => {
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link to="/" className="hover:text-red-600">Home</Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span>Register</span>
            </li>
            {selectedRole && (
              <>
                <li className="flex items-center">
                  <span className="mx-2">/</span>
                  <span className="capitalize">{selectedRole}</span>
                </li>
              </>
            )}
          </ol>
        </nav>

        {/* Back Button (when role is selected) */}
        {selectedRole && (
          <button
            onClick={handleBack}
            className="mb-6 flex items-center text-red-600 hover:text-red-700 font-medium"
          >
            <FaArrowLeft className="mr-2" />
            Back to Role Selection
          </button>
        )}

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {!selectedRole ? (
            <RoleSelection onRoleSelect={handleRoleSelect} />
          ) : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Register as {selectedRole === 'redcross' ? 'Red Cross Staff' : selectedRole === 'hospital' ? 'Hospital Staff' : 'Donor'}
                  </h1>
                  <p className="text-gray-600">
                    Please fill in all required information below
                  </p>
                </div>

                {selectedRole === 'donor' && <DonorRegisterForm onBack={function (): void {
                    throw new Error('Function not implemented.');
                  } } />}
                {/* {selectedRole === 'hospital' && <HospitalRegistration />}
                {selectedRole === 'redcross' && <RedCrossRegistration />} */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;