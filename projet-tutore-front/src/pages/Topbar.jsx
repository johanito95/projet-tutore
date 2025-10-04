import React, { useState, useEffect } from 'react';
import { FaBell, FaBars, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Topbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  const links = [
    { label: 'Dashboard', path: '/dashboard_responsable' },
    { label: 'Configuration Academique', path: '/responsable/config-academique' },
    { label: 'Gestion des filières', path: '/responsable/filieres' },
    { label: 'Gestion de l\'enseignement', path: '/responsable/enseignement' },
    { label: 'Mes Classes', path: '/responsable/classes' },
    { label: 'Cours', path: '/responsable/cours' },
    { label: 'Valider appels', path: '/responsable/appels/valider' },
    { label: 'Présences par salles', path: '/responsable/presences/salle' },
    { label: 'Documents', path: '/responsable/documents' },
    { label: 'Notes', path: '/responsable/notes' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non authentifié');
      setLoading(false);
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/infos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        setError('Erreur lors de la récupération des données utilisateur');
        console.error('Fetch user error:', err);
        toast.error('Erreur lors de la récupération des données utilisateur', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Erreur lors de la récupération des notifications', err);
        setNotifications([
          { id: 1, message: 'Nouvelle année académique 2024-2025 créée', date: '2025-07-18', is_read: false },
          { id: 2, message: 'Présence enregistrée pour Salle 101', date: '2025-07-17', is_read: false },
          { id: 3, message: 'Nouveau cours ajouté à la filière Informatique', date: '2025-07-16', is_read: false },
        ]);
        toast.error('Erreur lors du chargement des notifications', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(`http://127.0.0.1:8000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      toast.success('Notification marquée comme lue', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
      });
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la notification', err);
      toast.error('Erreur lors de la mise à jour', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E74C3C', color: '#FFFFFF' },
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setNotifications([]);
    toast.success('Déconnexion réussie !', {
      position: 'top-right',
      autoClose: 3000,
      style: { backgroundColor: '#27AE60', color: '#FFFFFF' },
    });
    navigate('/');
  };

  const handleToggleSidebar = () => {
    setShowMobileMenu(!showMobileMenu);
    window.dispatchEvent(new CustomEvent('toggleSidebar'));
  };

  return (
    <>
      <style>
        {`
          .notification-dropdown {
            position: absolute;
            top: 64px;
            right: 16px;
            width: 320px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(44, 62, 80, 0.1);
            z-index: 10;
            max-height: 400px;
            overflow-y: auto;
          }
          .notification-item {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(44, 62, 80, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .notification-item:hover {
            background: rgba(244, 145, 0, 0.1);
          }
          .notification-item.unread {
            background: rgba(231, 76, 60, 0.05);
          }
          .badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #E74C3C;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: pulse 2s infinite;
          }
          .profile-dropdown {
            position: absolute;
            top: 64px;
            right: 80px;
            width: 200px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(44, 62, 80, 0.1);
            z-index: 10;
          }
          .profile-item {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(44, 62, 80, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .profile-item:hover {
            background: rgba(244, 145, 0, 0.1);
          }
          .mobile-menu {
            position: absolute;
            top: 64px;
            left: 16px;
            width: 280px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(44, 62, 80, 0.1);
            z-index: 10;
            max-height: 400px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
          }
          .mobile-menu-item {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(44, 62, 80, 0.1);
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .mobile-menu-item:hover {
            background: rgba(244, 145, 0, 0.1);
          }
          .mobile-menu-item.active {
            background: rgba(9, 58, 93, 0.2);
            font-weight: 600;
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>
      <div className="bg-white/90 backdrop-blur-md shadow-md h-16 flex items-center justify-between px-6 fixed top-0 left-0 md:left-56 right-0 z-10 font-poppins">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden text-[#093A5D] hover:text-[#F49100] transition-all duration-300 transform hover:scale-110"
            onClick={handleToggleSidebar}
          >
            <FaBars className="w-6 h-6" />
          </button>
          <div className="text-xl font-semibold text-[#093A5D] ml-9">
            {error ? 'Erreur' : user ? user.role : 'Chargement...'}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative flex items-center gap-2 text-[#093A5D]/60 hover:text-[#F49100] hover:bg-[#093A5D]/10 rounded-lg px-3 py-2 transition-all duration-300 transform hover:scale-105"
            >
              <FaBell className="w-6 h-6" />
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <span className="badge">
                  {notifications.filter((n) => !n.is_read).length}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="notification-dropdown"
                >
                  {loading ? (
                    <div className="notification-item text-center text-[#093A5D]/70">Chargement...</div>
                  ) : notifications.length ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`notification-item ${notif.is_read ? '' : 'unread'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-[#093A5D]/90">{notif.message}</p>
                            <p className="text-xs text-[#093A5D]/50">{new Date(notif.date).toLocaleString()}</p>
                          </div>
                          {!notif.is_read && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="bg-[#F49100] text-white text-xs py-1 px-3 rounded-lg hover:bg-[#e07b00] transition-all duration-200 transform hover:scale-105"
                            >
                              Lu
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="notification-item text-center text-[#093A5D]/70">Aucune notification</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 text-[#093A5D]/60 hover:text-[#F49100] hover:bg-[#093A5D]/10 rounded-lg px-3 py-2 transition-all duration-300"
            >
              <FaUserCircle className="w-8 h-8" />
              <span className="text-sm text-[#093A5D]/90">
                {error ? 'Erreur' : user ? `${user.prenom} ${user.nom}` : 'Chargement...'}
              </span>
            </button>
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="profile-dropdown"
                >
                  <div
                    onClick={handleLogout}
                    className="profile-item flex items-center gap-2"
                  >
                    <FaSignOutAlt className="w-5 h-5 text-[#093A5D]/60" />
                    <span className="text-[#093A5D]/90">Déconnexion</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="mobile-menu md:hidden"
          >
            {links.map(({ label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `mobile-menu-item ${isActive ? 'active' : ''}`
                }
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="text-sm text-[#093A5D]/90">{label}</span>
              </NavLink>
            ))}
          </motion.div>
        )}
          </AnimatePresence>
          {/* <div className="mt-22"></div> */}
    </>
  );
};

export default Topbar;