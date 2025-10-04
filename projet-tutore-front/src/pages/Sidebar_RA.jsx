import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaCog, FaSchool, FaBook, FaUserCheck, FaFileAlt, FaEdit, FaBell, FaSignOutAlt, FaTimes, FaChalkboardTeacher } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Sidebar_RA = ({ isOpen = false, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Déconnexion cliquée');
    try {
      localStorage.removeItem('token');
      toast.success('Déconnexion réussie', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const links = [
    { label: 'Dashboard', path: '/dashboard_responsable', icon: <FaChalkboardTeacher className="w-5 h-5" /> },
    { label: 'Configuration académique', path: '/responsable/config-academique', icon: <FaCog className="w-5 h-5" /> },
    { label: 'Gestion des filières', path: '/responsable/filieres', icon: <FaSchool className="w-5 h-5" /> },
    { label: 'Gestion de l’enseignement', path: '/responsable/enseignement', icon: <FaBook className="w-5 h-5" /> },
    { label: 'Mes classes', path: '/responsable/classes', icon: <FaSchool className="w-5 h-5" /> },
    { label: 'Cours', path: '/responsable/cours', icon: <FaBook className="w-5 h-5" /> },
    { label: 'Valider appels', path: '/responsable/appels/valider', icon: <FaUserCheck className="w-5 h-5" /> },
    { label: 'Présences par salle', path: '/responsable/presences/salle', icon: <FaUserCheck className="w-5 h-5" /> },
    { label: 'Documents', path: '/responsable/documents', icon: <FaFileAlt className="w-5 h-5" /> },
    { label: 'Notes', path: '/responsable/notes', icon: <FaEdit className="w-5 h-5" /> },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-[#093A5D] text-white p-6 flex flex-col transform transition-transform duration-300 ease-in-out z-40 font-poppins shadow-lg ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:static md:inset-0 md:h-screen`}
    >
      {/* Logo */}
      <div className="mb-10 text-left">
        <h1 className="text-2xl font-bold leading-tight tracking-tight">
          ERP<br />IUT DOUALA
        </h1>
        <p className="text-sm font-light mt-1">Espace Responsable Académique</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {links.map(({ label, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-[#093A5D] shadow-md'
                  : 'hover:bg-[#F49100] hover:text-white'
              }`
            }
            onClick={() => {
              console.log('NavLink cliqué:', path);
              if (isOpen && toggleSidebar) toggleSidebar();
            }}
          >
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bouton de déconnexion */}
      <div className="mt-auto pt-6">
        <button
          className="flex items-center gap-3 py-2.5 px-4 rounded-lg text-sm font-medium w-full text-left hover:bg-[#F49100] hover:text-white transition-all duration-200"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Bouton de fermeture (mobile) */}
      {isOpen && (
        <button
          className="md:hidden absolute top-5 right-5 text-white hover:text-[#F49100] transition-all duration-200"
          onClick={() => {
            console.log('Bouton fermeture cliqué');
            if (toggleSidebar) toggleSidebar();
          }}
          aria-label="Fermer le menu"
        >
          <FaTimes className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default Sidebar_RA;