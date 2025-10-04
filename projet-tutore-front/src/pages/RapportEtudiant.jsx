import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SidebarEtudiant from './SidebarEtudiant';
import TopbarEtudiant from './TopbarEtudiant';
import { FaFileAlt, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaFileUpload, FaDownload, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const RapportEtudiant = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    matiere_id: '',
    file: null,
  });
  const [rapports, setRapports] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rapportsPerPage = 3;
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          Utilisateur non authentifié
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          toastId: 'auth-error',
          className: 'toast-error',
        }
      );
      navigate('/');
      return;
    }

    // Fetch user ID and check role
    axios
      .get('http://127.0.0.1:8000/api/infos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (response.data.role !== 'etudiant') {
          throw new Error('Accès réservé aux étudiants');
        }
        setUserId(response.data.id);
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération de l’utilisateur', error);
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            {error.message || 'Erreur lors de la récupération de l’utilisateur'}
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'user-error',
            className: 'toast-error',
          }
        );
        navigate('/');
      });

    // Fetch matières
    axios
      .get('http://127.0.0.1:8000/api/showmatiere', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setMatieres(response.data);
        if (response.data.length > 0) {
          setFormData((prev) => ({ ...prev, matiere_id: response.data[0].id }));
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des matières', error);
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Erreur lors du chargement des matières
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'matieres-error',
            className: 'toast-error',
          }
        );
      });

    // Fetch rapports
    axios
      .get('http://127.0.0.1:8000/api/rapports-stage', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setRapports(response.data);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des rapports', error);
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Erreur lors du chargement des rapports
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'rapports-error',
            className: 'toast-error',
          }
        );
      });
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Veuillez sélectionner un fichier PDF ou Word
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'file-type-error',
            className: 'toast-error',
          }
        );
        setFormData({ ...formData, file: null });
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            Le fichier ne doit pas dépasser 10MB
          </div>,
          {
            position: 'top-right',
            autoClose: 5000,
            toastId: 'file-size-error',
            className: 'toast-error',
          }
        );
        setFormData({ ...formData, file: null });
        return;
      }
      setFormData({ ...formData, file: selectedFile });
    } else {
      setFormData({ ...formData, file: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    if (!formData.titre.trim()) {
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          Veuillez remplir le champ titre
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          toastId: 'titre-error',
          className: 'toast-error',
        }
      );
      setLoading(false);
      return;
    }

    const uploadToastId = toast.info(
      <div className="flex items-center gap-2">
        <FaSpinner className="animate-spin w-5 h-5" />
        Envoi du rapport en cours...
      </div>,
      {
        position: 'top-right',
        autoClose: false,
        toastId: 'rapport-progress',
        className: 'toast-info',
      }
    );

    const token = localStorage.getItem('token');
    if (!token) {
      toast.dismiss(uploadToastId);
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          Utilisateur non authentifié
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          toastId: 'auth-error-submit',
          className: 'toast-error',
        }
      );
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('titre', formData.titre);
      if (formData.matiere_id) data.append('matiere_id', formData.matiere_id);
      if (formData.file) data.append('file', formData.file);

      const response = await axios.post('http://127.0.0.1:8000/api/rapports-stage', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.dismiss(uploadToastId);
      toast.success(
        <div className="flex items-center gap-2">
          <FaCheckCircle className="w-5 h-5" />
          Rapport soumis avec succès
        </div>,
        {
          position: 'top-right',
          autoClose: 3000,
          toastId: 'rapport-success',
          className: 'toast-success',
        }
      );
      setRapports([response.data.rapport, ...rapports]); // Ajout au début pour voir le nouveau rapport
      setFormData({
        titre: '',
        matiere_id: matieres.length > 0 ? matieres[0].id : '',
        file: null,
      });
      setCurrentPage(1); // Retour à la première page après soumission
    } catch (error) {
      toast.dismiss(uploadToastId);
      let errorMessage = 'Erreur lors de l’envoi du rapport';
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Utilisateur non authentifié';
            break;
          case 403:
            errorMessage = error.response.data.message || 'Action non autorisée';
            break;
          case 422:
            errorMessage = Object.values(error.response.data.errors).flat().join(', ');
            break;
          case 500:
            errorMessage = error.response.data.error || 'Erreur serveur';
            break;
          default:
            errorMessage = 'Erreur inconnue';
        }
      }
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          {errorMessage}
        </div>,
        {
          position: 'top-right',
          autoClose: 5000,
          toastId: 'rapport-error',
          className: 'toast-error',
        }
      );
      console.error('Erreur lors de l’envoi du rapport', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (filePath) => {
    if (!filePath) return;
    const url = `http://127.0.0.1:8000/storage/${filePath}`;
    window.open(url, '_blank');
  };

  const getFileExtension = (filePath) => {
    if (!filePath) return null;
    return filePath.split('.').pop().toLowerCase();
  };

  const getFileBadge = (filePath) => {
    const extension = getFileExtension(filePath);
    if (!extension) return null;
    const styles = {
      pdf: 'bg-[#E74C3C] text-white',
      doc: 'bg-[#3498DB] text-white',
      docx: 'bg-[#3498DB] text-white',
    };
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[extension] || 'bg-gray-500'}`}>
        {extension.toUpperCase()}
      </span>
    );
  };

  const getStatutBadge = (statut) => {
    const styles = {
      soumis: 'bg-[#F49100] text-white',
      refusé: 'bg-[#E74C3C] text-white',
      validé: 'bg-[#27AE60] text-white',
    };
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[statut] || 'bg-gray-500 text-white'}`}>
        {statut ? statut.charAt(0).toUpperCase() + statut.slice(1) : 'N/A'}
      </span>
    );
  };

  // Pagination logic
  const indexOfLastRapport = currentPage * rapportsPerPage;
  const indexOfFirstRapport = indexOfLastRapport - rapportsPerPage;
  const currentRapports = rapports.slice(indexOfFirstRapport, indexOfLastRapport);
  const totalPages = Math.ceil(rapports.length / rapportsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FC] font-poppins">
      <style>
        {`
          :root {
            --primary: #093A5D;
            --accent: #F49100;
            --error: #E74C3C;
            --success: #27AE60;
            --text: #1A2A44;
            --bg-light: #F7F9FC;
            --bg-dark: #0A1A2F;
            --bg-dark-secondary: #1A2A44;
          }

          .input-container {
            position: relative;
            margin-bottom: 1.5rem;
          }
          .input-container label {
            position: absolute;
            top: 0.5rem;
            left: 0.75rem;
            font-size: 0.875rem;
            color: var(--primary);
            transition: all 0.2s ease-in-out;
            pointer-events: none;
          }
          .input-container input:focus + label,
          .input-container input:not(:placeholder-shown) + label,
          .input-container select:focus + label,
          .input-container select:not([value=""]) + label {
            top: -1rem;
            font-size: 0.75rem;
            color: var(--accent);
          }
          .input-field {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            transition: all 0.2s ease-in-out;
          }
          .input-field:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(9, 58, 93, 0.1);
          }
          .btn-primary {
            background: var(--primary);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
          }
          .btn-primary:hover {
            background: #072c47;
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          .btn-primary:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .btn-pagination {
            background: var(--primary);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            margin: 0 0.25rem;
          }
          .btn-pagination:hover:not(:disabled) {
            background: #072c47;
            transform: scale(1.05);
          }
          .btn-pagination:disabled {
            background: #d1d5db;
            cursor: not-allowed;
          }
          .btn-pagination.active {
            background: var(--accent);
            font-weight: bold;
          }
          .rapport-card {
            background: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
          }
          .rapport-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          .toast-success {
            background: var(--success) !important;
            color: #FFFFFF !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
            font-family: 'Poppins', sans-serif !important;
            font-size: 0.875rem !important;
            animation: slideIn 0.3s ease-out !important;
          }
          .toast-error {
            background: var(--error) !important;
            color: #FFFFFF !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
            font-family: 'Poppins', sans-serif !important;
            font-size: 0.875rem !important;
            animation: slideIn 0.3s ease-out !important;
          }
          .toast-info {
            background: #3498DB !important;
            color: #FFFFFF !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
            font-family: 'Poppins', sans-serif !important;
            font-size: 0.875rem !important;
            animation: slideIn 0.3s ease-out !important;
          }
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
      <SidebarEtudiant
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex-1 flex flex-col">
        <TopbarEtudiant toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-64 bg-[#F7F9FC] overflow-auto z-10">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--primary)] mb-6 flex items-center gap-2">
            <FaFileAlt className="w-6 h-6" />
            Mes Rapports de Stage
          </h1>
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulaire de soumission de rapport">
              <div className="input-container">
                <input
                  type="text"
                  name="titre"
                  id="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                  aria-required="true"
                  aria-label="Titre du rapport"
                  placeholder=" "
                />
                <label htmlFor="titre">Titre du rapport</label>
              </div>
              <div className="input-container">
                <input
                  type="file"
                  name="file"
                  id="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="input-field"
                  aria-label="Fichier (PDF ou Word)"
                />
                <label htmlFor="file">Fichier (PDF ou Word)</label>
              </div>
              <div className="input-container">
                <select
                  name="matiere_id"
                  id="matiere_id"
                  value={formData.matiere_id}
                  onChange={handleInputChange}
                  className="input-field"
                  aria-label="Matière"
                >
                  <option value="">Sélectionner une matière</option>
                  {matieres.map((matiere) => (
                    <option key={matiere.id} value={matiere.id}>
                      {matiere.nom} ({matiere.uniteEnseignement?.anneeAcademique?.annee || 'N/A'})
                    </option>
                  ))}
                </select>
                <label htmlFor="matiere_id">Matière</label>
              </div>
              <button
                type="submit"
                disabled={loading || !formData.titre.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
                aria-label={loading ? 'Envoi du rapport en cours' : 'Soumettre le rapport'}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin w-5 h-5" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <FaFileUpload className="w-5 h-5" />
                    Soumettre le rapport
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="mt-8 max-w-7xl mx-auto">
            <h2 className="text-lg font-semibold text-[var(--primary)] mb-4 flex items-center gap-2">
              <FaFileAlt className="w-5 h-5" />
              Rapports soumis
            </h2>
            {currentRapports.length ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {currentRapports.map((rapport) => (
                  <div key={rapport.id} className="rapport-card">
                    <p className="text-sm font-medium text-[var(--primary)] flex items-center gap-2">
                      {rapport.titre}
                      <span>{getStatutBadge(rapport.statut)}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Étudiant: {rapport.etudiant ? `${rapport.etudiant.prenom} ${rapport.etudiant.nom}` : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Enseignant: {rapport.enseignant ? `${rapport.enseignant.prenom} ${rapport.enseignant.nom}` : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Date: {rapport.date_soumission ? new Date(rapport.date_soumission).toLocaleString() : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Matière: {rapport.matiere ? rapport.matiere.nom : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600">
                      Année: {rapport.anneeAcademique ? rapport.anneeAcademique.annee : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-600 flex items-center gap-2">
                      Fichier:{' '}
                      {rapport.file ? (
                        <>
                          {getFileBadge(rapport.file)}
                          <button
                            onClick={() => handleDownload(rapport.file)}
                            className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
                            aria-label="Télécharger le fichier"
                          >
                            <FaDownload className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        'Aucun fichier'
                      )}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Aucun rapport soumis pour le moment.</p>
            )}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-pagination flex items-center gap-2"
                  aria-label="Page précédente"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`btn-pagination ${currentPage === page ? 'active' : ''}`}
                    aria-label={`Page ${page}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-pagination flex items-center gap-2"
                  aria-label="Page suivante"
                >
                  Suivant
                  <FaArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RapportEtudiant;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import SidebarEtudiant from './SidebarEtudiant';
// import TopbarEtudiant from './TopbarEtudiant';
// import { FaFileAlt, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaFileUpload, FaDownload } from 'react-icons/fa';

// const RapportEtudiant = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     titre: '',
//     matiere_id: '',
//     file: null,
//   });
//   const [rapports, setRapports] = useState([]);
//   const [matieres, setMatieres] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       toast.error(
//         <div className="flex items-center gap-2">
//           <FaExclamationTriangle className="w-5 h-5" />
//           Utilisateur non authentifié
//         </div>,
//         {
//           position: 'top-right',
//           autoClose: 5000,
//           toastId: 'auth-error',
//           className: 'toast-error',
//         }
//       );
//       navigate('/');
//       return;
//     }

//     // Fetch user ID and check role
//     axios
//       .get('http://127.0.0.1:8000/api/infos', {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((response) => {
//         if (response.data.role !== 'etudiant') {
//           throw new Error('Accès réservé aux étudiants');
//         }
//         setUserId(response.data.id);
//       })
//       .catch((error) => {
//         console.error('Erreur lors de la récupération de l’utilisateur', error);
//         toast.error(
//           <div className="flex items-center gap-2">
//             <FaExclamationTriangle className="w-5 h-5" />
//             {error.message || 'Erreur lors de la récupération de l’utilisateur'}
//           </div>,
//           {
//             position: 'top-right',
//             autoClose: 5000,
//             toastId: 'user-error',
//             className: 'toast-error',
//           }
//         );
//         navigate('/');
//       });

//     // Fetch matières
//     axios
//       .get('http://127.0.0.1:8000/api/showmatiere', {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((response) => {
//         setMatieres(response.data);
//         if (response.data.length > 0) {
//           setFormData((prev) => ({ ...prev, matiere_id: response.data[0].id }));
//         }
//       })
//       .catch((error) => {
//         console.error('Erreur lors du chargement des matières', error);
//         toast.error(
//           <div className="flex items-center gap-2">
//             <FaExclamationTriangle className="w-5 h-5" />
//             Erreur lors du chargement des matières
//           </div>,
//           {
//             position: 'top-right',
//             autoClose: 5000,
//             toastId: 'matieres-error',
//             className: 'toast-error',
//           }
//         );
//       });

//     // Fetch rapports
//     axios
//       .get('http://127.0.0.1:8000/api/rapports-stage', {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((response) => {
//         setRapports(response.data);
//       })
//       .catch((error) => {
//         console.error('Erreur lors du chargement des rapports', error);
//         toast.error(
//           <div className="flex items-center gap-2">
//             <FaExclamationTriangle className="w-5 h-5" />
//             Erreur lors du chargement des rapports
//           </div>,
//           {
//             position: 'top-right',
//             autoClose: 5000,
//             toastId: 'rapports-error',
//             className: 'toast-error',
//           }
//         );
//       });
//   }, [navigate]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile) {
//       const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
//       if (!validTypes.includes(selectedFile.type)) {
//         toast.error(
//           <div className="flex items-center gap-2">
//             <FaExclamationTriangle className="w-5 h-5" />
//             Veuillez sélectionner un fichier PDF ou Word
//           </div>,
//           {
//             position: 'top-right',
//             autoClose: 5000,
//             toastId: 'file-type-error',
//             className: 'toast-error',
//           }
//         );
//         setFormData({ ...formData, file: null });
//         return;
//       }
//       if (selectedFile.size > 10 * 1024 * 1024) {
//         toast.error(
//           <div className="flex items-center gap-2">
//             <FaExclamationTriangle className="w-5 h-5" />
//             Le fichier ne doit pas dépasser 10MB
//           </div>,
//           {
//             position: 'top-right',
//             autoClose: 5000,
//             toastId: 'file-size-error',
//             className: 'toast-error',
//           }
//         );
//         setFormData({ ...formData, file: null });
//         return;
//       }
//       setFormData({ ...formData, file: selectedFile });
//     } else {
//       setFormData({ ...formData, file: null });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     toast.dismiss();

//     if (!formData.titre.trim()) {
//       toast.error(
//         <div className="flex items-center gap-2">
//           <FaExclamationTriangle className="w-5 h-5" />
//           Veuillez remplir le champ titre
//         </div>,
//         {
//           position: 'top-right',
//           autoClose: 5000,
//           toastId: 'titre-error',
//           className: 'toast-error',
//         }
//       );
//       setLoading(false);
//       return;
//     }

//     const uploadToastId = toast.info(
//       <div className="flex items-center gap-2">
//         <FaSpinner className="animate-spin w-5 h-5" />
//         Envoi du rapport en cours...
//       </div>,
//       {
//         position: 'top-right',
//         autoClose: false,
//         toastId: 'rapport-progress',
//         className: 'toast-info',
//       }
//     );

//     const token = localStorage.getItem('token');
//     if (!token) {
//       toast.dismiss(uploadToastId);
//       toast.error(
//         <div className="flex items-center gap-2">
//           <FaExclamationTriangle className="w-5 h-5" />
//           Utilisateur non authentifié
//         </div>,
//         {
//           position: 'top-right',
//           autoClose: 5000,
//           toastId: 'auth-error-submit',
//           className: 'toast-error',
//         }
//       );
//       setLoading(false);
//       return;
//     }

//     try {
//       const data = new FormData();
//       data.append('titre', formData.titre);
//       if (formData.matiere_id) data.append('matiere_id', formData.matiere_id);
//       if (formData.file) data.append('file', formData.file);

//       const response = await axios.post('http://127.0.0.1:8000/api/rapports-stage', data, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       toast.dismiss(uploadToastId);
//       toast.success(
//         <div className="flex items-center gap-2">
//           <FaCheckCircle className="w-5 h-5" />
//           Rapport soumis avec succès
//         </div>,
//         {
//           position: 'top-right',
//           autoClose: 3000,
//           toastId: 'rapport-success',
//           className: 'toast-success',
//         }
//       );
//       setRapports([...rapports, response.data.rapport]);
//       setFormData({
//         titre: '',
//         matiere_id: matieres.length > 0 ? matieres[0].id : '',
//         file: null,
//       });
//     } catch (error) {
//       toast.dismiss(uploadToastId);
//       let errorMessage = 'Erreur lors de l’envoi du rapport';
//       if (error.response) {
//         switch (error.response.status) {
//           case 401:
//             errorMessage = 'Utilisateur non authentifié';
//             break;
//           case 403:
//             errorMessage = error.response.data.message || 'Action non autorisée';
//             break;
//           case 422:
//             errorMessage = Object.values(error.response.data.errors).flat().join(', ');
//             break;
//           case 500:
//             errorMessage = error.response.data.error || 'Erreur serveur';
//             break;
//           default:
//             errorMessage = 'Erreur inconnue';
//         }
//       }
//       toast.error(
//         <div className="flex items-center gap-2">
//           <FaExclamationTriangle className="w-5 h-5" />
//           {errorMessage}
//         </div>,
//         {
//           position: 'top-right',
//           autoClose: 5000,
//           toastId: 'rapport-error',
//           className: 'toast-error',
//         }
//       );
//       console.error('Erreur lors de l’envoi du rapport', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = (filePath) => {
//     if (!filePath) return;
//     const url = `http://127.0.0.1:8000/storage/${filePath}`;
//     window.open(url, '_blank');
//   };

//   const getFileExtension = (filePath) => {
//     if (!filePath) return null;
//     return filePath.split('.').pop().toLowerCase();
//   };

//   const getFileBadge = (filePath) => {
//     const extension = getFileExtension(filePath);
//     if (!extension) return null;
//     const styles = {
//       pdf: 'bg-[#E74C3C] text-white',
//       doc: 'bg-[#3498DB] text-white',
//       docx: 'bg-[#3498DB] text-white',
//     };
//     return (
//       <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[extension] || 'bg-gray-500'}`}>
//         {extension.toUpperCase()}
//       </span>
//     );
//   };

//   const getStatutBadge = (statut) => {
//     const styles = {
//       soumis: 'bg-[#F49100] text-white',
//       refusé: 'bg-[#E74C3C] text-white',
//       validé: 'bg-[#27AE60] text-white',
//     };
//     return (
//       <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${styles[statut] || 'bg-gray-500 text-white'}`}>
//         {statut ? statut.charAt(0).toUpperCase() + statut.slice(1) : 'N/A'}
//       </span>
//     );
//   };

//   return (
//     <div className="flex min-h-screen bg-[#F7F9FC] font-poppins">
//       <style>
//         {`
//           :root {
//             --primary: #093A5D;
//             --accent: #F49100;
//             --error: #E74C3C;
//             --success: #27AE60;
//             --text: #1A2A44;
//             --bg-light: #F7F9FC;
//             --bg-dark: #0A1A2F;
//             --bg-dark-secondary: #1A2A44;
//           }

//           .dark {
//             --bg-light: #0A1A2F;
//             --bg-dark: #1A2A44;
//             --text: #FFFFFF;
//           }

//           .input-container {
//             position: relative;
//             margin-bottom: 1.5rem;
//           }
//           .input-container label {
//             position: absolute;
//             top: 0.5rem;
//             left: 0.75rem;
//             font-size: 0.875rem;
//             color: var(--primary);
//             transition: all 0.2s ease-in-out;
//             pointer-events: none;
//           }
//           .input-container input:focus + label,
//           .input-container input:not(:placeholder-shown) + label,
//           .input-container select:focus + label,
//           .input-container select:not([value=""]) + label {
//             top: -1rem;
//             font-size: 0.75rem;
//             color: var(--accent);
//           }
//           .input-field {
//             width: 100%;
//             padding: 0.75rem;
//             border: 1px solid #d1d5db;
//             border-radius: 0.5rem;
//             transition: all 0.2s ease-in-out;
//           }
//           .input-field:focus {
//             outline: none;
//             border-color: var(--primary);
//             box-shadow: 0 0 0 3px rgba(9, 58, 93, 0.1);
//           }
//           .btn-primary {
//             background: var(--primary);
//             color: white;
//             padding: 0.75rem 1.5rem;
//             border-radius: 0.5rem;
//             transition: all 0.3s ease;
//           }
//           .btn-primary:hover {
//             background: #072c47;
//             transform: scale(1.05);
//             box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
//           }
//           .btn-primary:disabled {
//             opacity: 0.5;
//             cursor: not-allowed;
//           }
//           .rapport-card {
//             background: white;
//             padding: 1rem;
//             border-radius: 0.5rem;
//             box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
//             transition: all 0.3s ease;
//           }
//           .rapport-card:hover {
//             transform: translateY(-2px);
//             box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
//           }
//           .toast-success {
//             background: var(--success) !important;
//             color: #FFFFFF !important;
//             border-radius: 0.5rem !important;
//             box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
//             font-family: 'Poppins', sans-serif !important;
//             font-size: 0.875rem !important;
//             animation: slideIn 0.3s ease-out !important;
//           }
//           .toast-error {
//             background: var(--error) !important;
//             color: #FFFFFF !important;
//             border-radius: 0.5rem !important;
//             box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
//             font-family: 'Poppins', sans-serif !important;
//             font-size: 0.875rem !important;
//             animation: slideIn 0.3s ease-out !important;
//           }
//           .toast-info {
//             background: #3498DB !important;
//             color: #FFFFFF !important;
//             border-radius: 0.5rem !important;
//             box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
//             font-family: 'Poppins', sans-serif !important;
//             font-size: 0.875rem !important;
//             animation: slideIn 0.3s ease-out !important;
//           }
//           @keyframes slideIn {
//             from { transform: translateX(100%); opacity: 0; }
//             to { transform: translateX(0); opacity: 1; }
//           }
//         `}
//       </style>
//       <SidebarEtudiant
//         isOpen={isSidebarOpen}
//         toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
//       />
//       <div className="flex-1 flex flex-col">
//         <TopbarEtudiant toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
//         <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-56 bg-[#F7F9FC]">
//           <h1 className="text-xl sm:text-2xl font-bold text-[var(--primary)] mb-6 flex items-center gap-2">
//             <FaFileAlt className="w-6 h-6" />
//             Mes Rapports de Stage
//           </h1>
//           <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
//             <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulaire de soumission de rapport">
//               <div className="input-container">
//                 <input
//                   type="text"
//                   name="titre"
//                   id="titre"
//                   value={formData.titre}
//                   onChange={handleInputChange}
//                   className="input-field"
//                   required
//                   aria-required="true"
//                   aria-label="Titre du rapport"
//                   placeholder=" "
//                 />
//                 <label htmlFor="titre">Titre du rapport</label>
//               </div>
//               <div className="input-container">
//                 <input
//                   type="file"
//                   name="file"
//                   id="file"
//                   accept=".pdf,.doc,.docx"
//                   onChange={handleFileChange}
//                   className="input-field"
//                   aria-label="Fichier (PDF ou Word)"
//                 />
//                 <label htmlFor="file">Fichier (PDF ou Word)</label>
//               </div>
//               <div className="input-container">
//                 <select
//                   name="matiere_id"
//                   id="matiere_id"
//                   value={formData.matiere_id}
//                   onChange={handleInputChange}
//                   className="input-field"
//                   aria-label="Matière"
//                 >
//                   <option value="">Sélectionner une matière</option>
//                   {matieres.map((matiere) => (
//                     <option key={matiere.id} value={matiere.id}>
//                       {matiere.nom} ({matiere.uniteEnseignement?.anneeAcademique?.annee || 'N/A'})
//                     </option>
//                   ))}
//                 </select>
//                 <label htmlFor="matiere_id">Matière</label>
//               </div>
//               <button
//                 type="submit"
//                 disabled={loading || !formData.titre.trim()}
//                 className="btn-primary w-full flex items-center justify-center gap-2"
//                 aria-label={loading ? 'Envoi du rapport en cours' : 'Soumettre le rapport'}
//               >
//                 {loading ? (
//                   <>
//                     <FaSpinner className="animate-spin w-5 h-5" />
//                     Envoi...
//                   </>
//                 ) : (
//                   <>
//                     <FaFileUpload className="w-5 h-5" />
//                     Soumettre le rapport
//                   </>
//                 )}
//               </button>
//             </form>
//           </div>
//           <div className="mt-8 max-w-7xl mx-auto">
//             <h2 className="text-lg font-semibold text-[var(--primary)] mb-4 flex items-center gap-2">
//               <FaFileAlt className="w-5 h-5" />
//               Rapports soumis
//             </h2>
//             {rapports.length ? (
//               <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//                 {rapports.map((rapport) => (
//                   <div key={rapport.id} className="rapport-card">
//                     <p className="text-sm font-medium text-[var(--primary)] flex items-center gap-2">
//                       {rapport.titre}
//                       <span>{getStatutBadge(rapport.statut)}</span>
//                     </p>
//                     <p className="text-xs text-gray-600">
//                       Étudiant: {rapport.etudiant ? `${rapport.etudiant.prenom} ${rapport.etudiant.nom}` : 'N/A'}
//                     </p>
//                     <p className="text-xs text-gray-600">
//                       Enseignant: {rapport.enseignant ? `${rapport.enseignant.prenom} ${rapport.enseignant.nom}` : 'N/A'}
//                     </p>
//                     <p className="text-xs text-gray-600">
//                       Date: {rapport.date_soumission ? new Date(rapport.date_soumission).toLocaleString() : 'N/A'}
//                     </p>
//                     <p className="text-xs text-gray-600">
//                       Matière: {rapport.matiere ? rapport.matiere.nom : 'N/A'}
//                     </p>
//                     <p className="text-xs text-gray-600">
//                       Année: {rapport.anneeAcademique ? rapport.anneeAcademique.annee : 'N/A'}
//                     </p>
//                     <p className="text-xs text-gray-600 flex items-center gap-2">
//                       Fichier:{' '}
//                       {rapport.file ? (
//                         <>
//                           {getFileBadge(rapport.file)}
//                           <button
//                             onClick={() => handleDownload(rapport.file)}
//                             className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
//                             aria-label="Télécharger le fichier"
//                           >
//                             <FaDownload className="w-4 h-4" />
//                           </button>
//                         </>
//                       ) : (
//                         'Aucun fichier'
//                       )}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-gray-600">Aucun rapport soumis pour le moment.</p>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default RapportEtudiant;