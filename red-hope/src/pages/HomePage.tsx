import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  FaHeartbeat, 
  FaUser, 
  FaHospital, 
  FaArrowRight,
  FaBell,
  FaShieldAlt,
  FaUsers,
  FaCalendarCheck
} from 'react-icons/fa';
import { GiHeartOrgan,} from 'react-icons/gi';
import { FaMapMarkerAlt } from 'react-icons/fa';

const HomePage: React.FC = () => {
  const [urgentRequests] = useState([
    { id: 1, hospital: "Nairobi Hospital", bloodType: "O+", urgency: "HIGH", time: "2 hours ago", location: "Nairobi" },
    { id: 2, hospital: "Kenyatta Hospital", bloodType: "A-", urgency: "MEDIUM", time: "4 hours ago", location: "Nairobi" },
    { id: 3, hospital: "Mombasa Hospital", bloodType: "B+", urgency: "HIGH", time: "1 hour ago", location: "Mombasa" },
    { id: 4, hospital: "Eldoret Hospital", bloodType: "AB-", urgency: "CRITICAL", time: "30 minutes ago", location: "Eldoret" },
  ]);

  const stats = [
    { number: "1,250+", label: "Lives Saved", icon: <FaHeartbeat className="text-3xl" /> },
    { number: "450+", label: "Active Donors", icon: <FaUsers className="text-3xl" /> },
    { number: "85+", label: "Partner Hospitals", icon: <FaHospital className="text-3xl" /> },
    { number: "24/7", label: "Emergency Support", icon: <FaBell className="text-3xl" /> },
  ];

  const howItWorks = [
    { step: 1, title: "Register", description: "Sign up as a donor or hospital", icon: <FaUser className="text-2xl" /> },
    { step: 2, title: "Find Match", description: "Search for blood needs or donors", icon: <GiHeartOrgan className="text-2xl" /> },
    { step: 3, title: "Connect", description: "Contact and schedule donation", icon: <FaCalendarCheck className="text-2xl" /> },
    { step: 4, title: "Save Lives", description: "Complete donation process", icon: <FaShieldAlt className="text-2xl" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Save a Life Today<br />
            <span className="text-yellow-300">Donate Blood</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connecting blood donors with hospitals in need. Every drop counts, every second matters.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
            <Link 
              to="/register" 
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 flex items-center justify-center"
            >
              <FaUser className="mr-2" /> Become a Donor
            </Link>
            <Link 
              to="/blood-needs" 
              className="bg-transparent border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-red-600 flex items-center justify-center"
            >
              <FaHospital className="mr-2" /> Find Blood Needs
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Making a Difference Together</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                  <div className="text-red-600 mb-4 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Urgent Requests Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Live Urgent Requests</h2>
            <Link to="/blood-needs" className="text-red-600 hover:text-red-700 font-medium flex items-center">
              View All <FaArrowRight className="ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {urgentRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <FaHospital className="text-red-600 mr-2" />
                        <h3 className="text-xl font-bold">{request.hospital}</h3>
                      </div>
                      <div className="flex items-center text-gray-600 mb-1">
                        <FaMapMarkerAlt className="mr-2" />
                        {request.location}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      request.urgency === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      request.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {request.urgency}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">Blood Type Needed</div>
                    <div className="text-2xl font-bold text-red-600">{request.bloodType}</div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-500">Posted: {request.time}</div>
                  </div>
                  
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition">
                    Donate Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="relative">
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full mb-4">
                    {step.icon}
                  </div>
                  <div className="text-sm text-red-600 font-bold mb-2">STEP {step.step}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {step.step < 4 && (
                  <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                    <FaArrowRight className="text-gray-300 text-2xl" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of donors who are saving lives every day. Your blood could be the gift that gives someone more time.
          </p>
          <Link 
            to="/register" 
            className="inline-block bg-white text-red-600 px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Join Our Lifesaving Community
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;