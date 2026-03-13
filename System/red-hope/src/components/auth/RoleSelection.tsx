import React from 'react';
import { FaUser, FaHospital, FaCross } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface RoleSelectionProps {
  onRoleSelect: (role: 'donor' | 'hospital' | 'redcross') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect }) => {
  const roles = [
    {
      id: 'donor',
      title: 'Donor',
      description: 'I want to donate blood and help save lives',
      icon: <FaUser className="text-4xl text-red-600" />,
      color: 'bg-red-50 hover:bg-red-100 border-red-200'
    },
    {
      id: 'hospital',
      title: 'Hospital Staff',
      description: 'I work at a hospital and need to request blood',
      icon: <FaHospital className="text-4xl text-blue-600" />,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      id: 'redcross',
      title: 'Red Cross Staff',
      description: 'I work with Red Cross and manage blood donations',
      icon: <FaCross className="text-4xl text-red-800" />,
      color: 'bg-red-50 hover:bg-red-100 border-red-300'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to REDHOPE Portal
          </h1>
          <p className="text-gray-600 text-lg">
            Choose your role to continue registration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id as 'donor' | 'hospital' | 'redcross')}
              className={`${role.color} border-2 rounded-2xl p-8 text-center transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex flex-col items-center">
                <div className="mb-6">{role.icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {role.title}
                </h3>
                <p className="text-gray-600 mb-6">{role.description}</p>
                <div className="mt-4 px-6 py-2 bg-white rounded-full text-gray-700 font-semibold border">
                  Select {role.title}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p>Already have an account? 
            <Link to="/login" className="text-red-600 font-semibold ml-2 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;