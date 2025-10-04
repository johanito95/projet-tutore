<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

use App\Models\Utilisateur;
use App\Models\Connexion;
use App\Models\Role;
use App\Models\Etudiant;
use App\Models\Enseignant;
use App\Models\ResponsableAcademique;
use App\Mail\CodeSecuriteMail;

class AuthController extends Controller
{

    public function register(Request $request)
    {
        // Récupération du rôle
        $role = Role::find($request->role_id);
        if (!$role) {
            return response()->json(['message' => 'Rôle invalide.'], 422);
        }

        // Règles de validation de base
        $rules = [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
            'date_naissance' => 'required|date',
            'email' => 'required|email|unique:connexions,email',
            'password' => 'required|string|min:8',
            'role_id' => 'required|exists:roles,id',
        ];

        // Ajout des règles spécifiques selon le rôle
        switch (strtolower($role->nom)) {
            case 'etudiant':
                $rules = array_merge($rules, [
                    'filiere_id' => 'required|exists:filieres,id',
                    'annee_entree' => 'required|integer',
                    'annee_academique_id' => 'required|exists:annees_academiques,id',
                    'statut_diplomation' => 'nullable|string',
                ]);
                break;

            case 'enseignant':
                $rules = array_merge($rules, [
                    'grade' => 'required|string',
                    'specialite' => 'required|string',
                ]);
                break;

            case 'responsable academique':
                $rules = array_merge($rules, [
                    'grade' => 'required|string',
                    'specialite' => 'required|string',
                    'departement' => 'required|string',
                ]);
                break;
        }

        // Validation des données
        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Création de l'utilisateur
        $utilisateur = Utilisateur::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'telephone' => $request->telephone,
            'date_naissance' => $request->date_naissance,
            'role_id' => $request->role_id,
        ]);

        // Génération du code de sécurité
        $code = Str::upper(Str::random(6));

        // Création des identifiants de connexion
        $connexion = Connexion::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'code_securite' => $code,
            'utilisateur_id' => $utilisateur->id,
        ]);

        // Création des entités liées selon le rôle
        switch (strtolower($role->nom)) {
            case 'etudiant':
                $matricule = $this->generateMatricule($request->annee_entree);
                Etudiant::create([
                    'utilisateur_id' => $utilisateur->id,
                    'matricule' => $matricule,
                    'filiere_id' => $request->filiere_id,
                    'annee_entree' => $request->annee_entree,
                    'annee_academique_id' => $request->annee_academique_id,
                    'statut_diplomation' => $request->statut_diplomation,
                ]);
                break;

            case 'enseignant':
                Enseignant::create([
                    'utilisateur_id' => $utilisateur->id,
                    'grade' => $request->grade,
                    'specialite' => $request->specialite,
                ]);
                break;

            case 'responsable academique':
                $enseignant = Enseignant::create([
                    'utilisateur_id' => $utilisateur->id,
                    'grade' => $request->grade,
                    'specialite' => $request->specialite,
                ]);

                ResponsableAcademique::create([
                    'enseignant_id' => $enseignant->id,
                    'departement' => $request->departement,
                ]);
                break;
        }

        // Envoi du mail avec le code de sécurité
        Mail::to($connexion->email)->send(new CodeSecuriteMail($utilisateur, $code));

        return response()->json([
            'message' => 'Inscription réussie. Vérifiez votre email pour le code de sécurité.'
        ], 201);
    }

    private function generateMatricule($anneeEntree)
    {
        // Compter le nombre d'étudiants pour l'année d'entrée
        $count = Etudiant::where('annee_entree', $anneeEntree)->count() + 1;
        // Générer le matricule au format IUT-YYYY-NNN
        $matricule = sprintf('IUT-%d-%03d', $anneeEntree, $count);
        // Vérifier l'unicité
        while (Etudiant::where('matricule', $matricule)->exists()) {
            $count++;
            $matricule = sprintf('IUT-%d-%03d', $anneeEntree, $count);
        }
        return $matricule;
    }

    /**
     * Connexion avec email, mot de passe et code de sécurité
     */


    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'code_securite' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $connexion = Connexion::where('email', $request->email)->first();
        if (!$connexion || !Hash::check($request->password, $connexion->password) || $connexion->code_securite !== $request->code_securite) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        $utilisateur = $connexion->utilisateur; // Charge l’utilisateur via la relation
        $token = $utilisateur->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'redirect_url' => '/',
            'role' => $utilisateur->role->nom,
        ]);
    }
    /**
     * Déconnexion : révoque tous les tokens
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    /**
     * Récupérer les informations de l’utilisateur connecté
     */
    public function infos(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'email' => $user->connexion->email,
            'role' => $user->role->nom,
        ]);
    }

}