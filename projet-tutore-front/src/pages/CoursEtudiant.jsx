import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SidebarEtudiant from './SidebarEtudiant';
import TopbarEtudiant from './TopbarEtudiant';
import { FaFileDownload, FaFilePdf, FaFileWord, FaFile } from 'react-icons/fa';

const CoursEtudiant = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Utilisateur non authentifié', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
      });
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        // Vérifier le rôle
        const userResponse = await axios.get('http://127.0.0.1:8000/api/infos', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userResponse.data.role !== 'etudiant') {
          throw new Error('Accès réservé aux étudiants');
        }

        // Récupérer les documents
        const documentsResponse = await axios.get('http://127.0.0.1:8000/api/documents', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filtrer les documents valides
        const filteredDocuments = Array.isArray(documentsResponse.data)
          ? documentsResponse.data.filter(
              (doc) =>
                (!doc.restrict_to_role || doc.restrict_to_role.includes('etudiant')) &&
                doc.extension // Exclure les documents sans extension
            )
          : [];
        setDocuments(filteredDocuments);
      } catch (err) {
        console.error('Erreur lors de la récupération des données:', err);
        setError(err.message || 'Erreur lors de la récupération des documents');
        toast.error(err.message || 'Erreur lors de la récupération des documents', {
          position: 'top-right',
          autoClose: 3000,
          style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
        });
        if (err.response?.status === 403 || err.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleDownload = async (id, nom, extension) => {
    try {
      console.log('Tentative de téléchargement:', { id, nom, extension });
      const response = await axios.get(`http://127.0.0.1:8000/api/documents/download/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${nom}.${extension || 'file'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Document téléchargé avec succès', {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#27AE60', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      const errorMessage =
        err.response?.status === 404
          ? 'Fichier non trouvé'
          : err.response?.status === 400
          ? 'ID de document invalide'
          : 'Erreur lors du téléchargement';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000,
        style: { backgroundColor: '#E53E3E', color: '#FFFFFF', fontSize: '0.875rem' },
      });
    }
  };

  const getFileIcon = (extension) => {
    if (!extension) {
      return <FaFile className="w-10 h-10 text-[#093A5D]" />;
    }
    switch (extension.toLowerCase()) {
      case 'pdf':
        return <FaFilePdf className="w-10 h-10 text-[#E53E3E]" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="w-10 h-10 text-[#2B6CB0]" />;
      default:
        return <FaFile className="w-10 h-10 text-[#093A5D]" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FC] font-poppins">
      <SidebarEtudiant
        isOpen={isSidebarOpen}
        toggleSidebar={() => {
          console.log('Toggle sidebar, isOpen:', !isSidebarOpen);
          setIsSidebarOpen(!isSidebarOpen);
        }}
      />
      <div className="flex-1 flex flex-col">
        <TopbarEtudiant toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-6 sm:p-8 md:p-10 md:pl-20 bg-[#F7F9FC] shadow-inner">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#093A5D] mb-8 flex items-center gap-3 mt-15">
            <FaFileDownload className="w-8 h-8" />
            Mes Documents
          </h1>
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="w-12 h-12 border-4 border-[#F49100] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center text-[#E53E3E] text-lg">{error}</div>
          ) : documents.length === 0 ? (
            <div className="text-center text-[#093A5D] text-lg">
              Aucun document disponible pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className="relative bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-[#093A5D]/10 hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute top-4 right-4">
                    <span className="bg-[#093A5D] text-white text-xs font-medium px-2 py-1 rounded">
                      {doc.extension ? doc.extension.toUpperCase() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {getFileIcon(doc.extension)}
                    <h2 className="text-xl font-bold text-[#093A5D] truncate">
                      {doc.nom}.{doc.extension || 'N/A'}
                    </h2>
                  </div>
                  <p className="text-sm font-medium text-[#093A5D]">
                    <span className="font-semibold">Enseignant:</span>{' '}
                    {doc.uploader ? `${doc.uploader.prenom} ${doc.uploader.nom}` : 'N/A'}
                  </p>
                  {/* <p className="text-sm font-medium text-[#093A5D]">
                    <span className="font-semibold">Année:</span>{' '}
                    {doc.anneeAcademique?.nom || 'Non spécifiée'}
                  </p> */}
                  <button
                    onClick={() => handleDownload(doc.id, doc.nom, doc.extension)}
                    className="flex items-center justify-center gap-2 bg-[#F49100] text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-[#d47e00] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!doc.extension}
                  >
                    <FaFileDownload className="w-4 h-4" />
                    Télécharger
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Error Boundary
class CoursEtudiantErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen bg-[#F7F9FC] font-poppins justify-center items-center">
          <div className="text-center text-[#E53E3E] text-lg">
            Une erreur est survenue dans l'affichage des documents. Veuillez réessayer plus tard.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function CoursEtudiantWithErrorBoundary() {
  return (
    <CoursEtudiantErrorBoundary>
      <CoursEtudiant />
    </CoursEtudiantErrorBoundary>
  );
}