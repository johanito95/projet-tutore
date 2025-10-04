import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaBook, FaChartLine, FaFileAlt, FaEnvelopeOpenText, FaGraduationCap, FaBell, FaSignOutAlt } from 'react-icons/fa';

const SidebarEtudiant = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      toast.success('Déconnexion réussie !', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      navigate('/');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      toast.error('Erreur lors de la déconnexion', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const links = [
    { label: 'Dashboard', path: '/dashboard_etudiant', icon: <FaBook className="w-5 h-5" /> },
    { label: 'Cours', path: '/etudiant/cours', icon: <FaBook className="w-5 h-5" /> },
    { label: 'Notes', path: '/etudiant/notes', icon: <FaChartLine className="w-5 h-5" /> },
    { label: 'Rapport de stage', path: '/etudiant/rapport', icon: <FaFileAlt className="w-5 h-5" /> },
    { label: 'Requêtes', path: '/etudiant/requetes', icon: <FaEnvelopeOpenText className="w-5 h-5" /> },
    { label: 'Diplomation', path: '/etudiant/diplomation', icon: <FaGraduationCap className="w-5 h-5" /> },
    { label: 'Notifications', path: '/etudiant/notifications', icon: <FaBell className="w-5 h-5" /> },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-blue-800 text-white p-6 flex flex-col transform transition-transform duration-300 ease-in-out z-40 font-poppins ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:inset-0 md:h-screen`}
    >
      <div className="mb-10 text-left">
        <div className="text-2xl font-bold">
          ERP<br />IUT DOUALA
        </div>
        <div className="text-sm font-light mt-1">Espace Étudiant</div>
      </div>
      <nav className="flex flex-col gap-2 flex-1">
        {links.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2 px-4 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-white text-[#093A5D] font-semibold shadow-md'
                  : 'hover:bg-[#F49100] hover:text-white'
              }`
            }
            onClick={() => isOpen && toggleSidebar()}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 py-2 px-4 rounded-lg w-full text-left hover:bg-[#F49100] hover:text-white transition-all duration-200"
        >
          <FaSignOutAlt className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarEtudiant;