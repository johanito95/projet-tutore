import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaGraduationCap, FaIdCard, FaBuilding, FaUserTie } from 'react-icons/fa';

const RegisterForm = () => {
  const [role, setRole] = useState('');
  const [extraFields, setExtraFields] = useState([]);

  // Met à jour les champs supplémentaires selon le rôle sélectionné
  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);

    switch (selectedRole) {
      case 'etudiant':
        setExtraFields([
          { icon: <FaIdCard />, placeholder: 'Matricule' },
          { icon: <FaGraduationCap />, placeholder: 'Filière' },
          { icon: <FaGraduationCap />, placeholder: "Niveau d'étude" },
        ]);
        break;
      case 'enseignant':
        setExtraFields([
          { icon: <FaIdCard />, placeholder: 'Matricule enseignant' },
          { icon: <FaUserTie />, placeholder: 'Spécialité' },
          { icon: <FaBuilding />, placeholder: 'Département' },
        ]);
        break;
      case 'scolarite':
      case 'admin':
        setExtraFields([
          { icon: <FaIdCard />, placeholder: 'Identifiant interne' },
          { icon: <FaUserTie />, placeholder: 'Fonction ou service' },
        ]);
        break;
      default:
        setExtraFields([]);
    }
  };

  // Structure du champ avec icône à gauche de la page
  const renderInput = (icon, placeholder, type = 'text') => (
    <div className="flex items-center border-b border-white py-2 text-white">
      <span className="mr-2 text-lg">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        required
        className="bg-transparent outline-none flex-1 placeholder-white"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-cyan-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-lg overflow-hidden shadow-md flex flex-col md:flex-row">
        {/* Partie gauche (Logo + Message) */}
        <div className="md:w-1/2 bg-white flex flex-col items-center justify-center text-center p-8">
          <div className="w-40 h-40 bg-gray-200 mb-4">Logo</div>
          <h2 className="text-blue-800 text-3xl font-bold">PAS ENCORE INSCRIS?</h2>
          <p className="text-blue-800 mt-2">
            inscrivez vous soyez<br />connecter à votre<br />univers académique
          </p>
        </div>

        {/* Partie droite (Formulaire) */}
        <div className="md:w-1/2 bg-blue-700 text-white p-8 relative">
          <h3 className="text-2xl font-bold mb-6">inscription</h3>

          <form className="space-y-4">
            {/* Ligne nom + email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(<FaUser />, 'Nom')}
              {renderInput(<FaEnvelope />, 'Email', 'email')}
            </div>

            {/* Ligne mot de passe + rôle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(<FaLock />, 'Mot de passe', 'password')}
              <div className="flex items-center border-b border-white py-2">
                <span className="mr-2 text-lg">
                  <FaUserTie />
                </span>
                <select
                  onChange={handleRoleChange}
                  required
                  className="bg-transparent text-white outline-none flex-1 placeholder-white"
                >
                  <option value="">Rôle</option>
                  <option value="etudiant">Étudiant</option>
                  <option value="enseignant">Enseignant</option>
                  <option value="scolarite">Scolarité</option>
                  <option value="admin">Administration</option>
                </select>
              </div>
            </div>

            {/* Champs supplémentaires selon le rôle */}
            {extraFields.map(({ icon, placeholder }, index) => (
              <div key={index}>{renderInput(icon, placeholder)}</div>
            ))}

            <button
              type="submit"
              className="w-full bg-white text-blue-700 font-semibold py-2 rounded-full hover:bg-blue-100 transition"
            >
              s’inscrire
            </button>
          </form>

          <div className="mt-6 text-right text-sm">
            <span>vous avez déjà un compte ? </span>
            <a href="/login" className="underline text-white hover:text-blue-300">connexion</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
