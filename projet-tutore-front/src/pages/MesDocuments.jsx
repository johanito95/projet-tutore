import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaFileDownload, FaSpinner, FaExclamationTriangle, FaFileAlt } from 'react-icons/fa';
import SidebarEnseignant from './SidebarEnseignant';
import TopbarEnseignant from './TopbarEnseignant';

const MesDocuments = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Utilisateur non authentifié');
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          Utilisateur non authentifié
        </div>,
        { position: 'top-right', autoClose: 5000, toastId: 'auth-error', className: 'toast-error' }
      );
      return;
    }

    // Fetch documents
    setLoading(true);
    axios
      .get('http://127.0.0.1:8000/api/getEnseignantDocuments', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setDocuments(response.data);
        if (response.data.length === 0) {
          toast.warn(
            <div className="flex items-center gap-2">
              <FaExclamationTriangle className="w-5 h-5" />
              Aucun document disponible
            </div>,
            { position: 'top-right', autoClose: 5000, toastId: 'no-documents', className: 'toast-warning' }
          );
        }
      })
      .catch((error) => {
        let errorMessage = 'Erreur lors du chargement des documents';
        if (error.response) {
          switch (error.response.status) {
            case 401:
              errorMessage = 'Utilisateur non authentifié';
              break;
            case 403:
              errorMessage = error.response.data.message || 'Accès non autorisé';
              break;
            case 500:
              errorMessage = error.response.data.error || 'Erreur serveur interne';
              break;
            default:
              errorMessage = 'Erreur inconnue';
          }
        } else {
          errorMessage = error.message || 'Erreur réseau';
        }
        setError(errorMessage);
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="w-5 h-5" />
            {errorMessage}
          </div>,
          { position: 'top-right', autoClose: 5000, toastId: 'data-error', className: 'toast-error' }
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (documentId, documentName, extension) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          Utilisateur non authentifié
        </div>,
        { position: 'top-right', autoClose: 5000, toastId: 'auth-error-download', className: 'toast-error' }
      );
      return;
    }

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/documents/${documentId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${documentName}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(
        <div className="flex items-center gap-2">
          <FaFileDownload className="w-5 h-5" />
          Document téléchargé avec succès
        </div>,
        { position: 'top-right', autoClose: 3000, toastId: 'download-success', className: 'toast-success' }
      );
    } catch (error) {
      let errorMessage = 'Erreur lors du téléchargement du document';
      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Utilisateur non authentifié';
            break;
          case 403:
            errorMessage = error.response.data.message || 'Accès non autorisé';
            break;
          case 404:
            errorMessage = error.response.data.error || 'Document non trouvé';
            break;
          case 500:
            errorMessage = error.response.data.error || 'Erreur serveur interne';
            break;
          default:
            errorMessage = 'Erreur inconnue';
        }
      } else {
        errorMessage = error.message || 'Erreur réseau';
      }
      toast.error(
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="w-5 h-5" />
          {errorMessage}
        </div>,
        { position: 'top-right', autoClose: 5000, toastId: 'download-error', className: 'toast-error' }
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F7F9FC] font-poppins">
      <style>
        {`
          .table-container {
            overflow-x: auto;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .table th,
          .table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          .table th {
            background: #093A5D;
            color: white;
            font-weight: 600;
          }
          .table tr:hover {
            background: #f1f5f9;
            transition: background 0.2s ease;
          }
          .btn-download {
            background: #F49100;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }
          .btn-download:hover {
            background: #e07b00;
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }
          .toast-success {
            background: #27AE60 !important;
            color: #FFFFFF !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
            font-family: 'Poppins', sans-serif !important;
            font-size: 0.875rem !important;
            animation: slideIn 0.3s ease-out !important;
          }
          .toast-error {
            background: #E74C3C !important;
            color: #FFFFFF !important;
            border-radius: 0.5rem !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2) !important;
            font-family: 'Poppins', sans-serif !important;
            font-size: 0.875rem !important;
            animation: slideIn 0.3s ease-out !important;
          }
          .toast-warning {
            background: #F1C40F !important;
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
      <SidebarEnseignant
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex-1 flex flex-col">
        <TopbarEnseignant toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:pl-56 bg-[#F7F9FC]">
          <h1 className="text-xl sm:text-2xl font-bold text-[#093A5D] mb-6 flex items-center gap-2">
            <FaFileAlt className="w-6 h-6" />
            Mes Documents
          </h1>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
              <p>{error}</p>
            </div>
          )}
          {loading && (
            <div className="flex justify-center items-center">
              <FaSpinner className="animate-spin w-8 h-8 text-[#093A5D]" />
            </div>
          )}
          {!loading && !error && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Type</th>
                    <th>Année Académique</th>
                    <th>Matière</th>
                    <th>Salles</th>
                    <th>Uploader</th>
                    <th>Date d’Upload</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.nom}</td>
                      <td>{doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}</td>
                      <td>{doc.annee_academique?.annee || 'N/A'}</td>
                      <td>{doc.matiere?.nom || 'Aucune'}</td>
                      <td>{doc.salle_de_classes?.map((salle) => salle.nom).join(', ') || 'Aucune'}</td>
                      <td>{`${doc.uploader?.prenom} ${doc.uploader?.nom}`}</td>
                      <td>{new Date(doc.date_upload).toLocaleDateString()}</td>
                      <td>
                        <button
                          onClick={() => handleDownload(doc.id, doc.nom, doc.extension)}
                          className="btn-download"
                          aria-label={`Télécharger ${doc.nom}`}
                        >
                          <FaFileDownload className="w-4 h-4" />
                          Télécharger
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MesDocuments;