<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\SalleDeClasse;
use App\Models\Etudiant;
use App\Models\Enseignant;
use App\Models\InscriptionSalleEtudiant;
use App\Models\InscriptionSalleEnseignant;

class AffectationController extends Controller
{
    public function affecterEtudiant(Request $request, $salleId)
    {
        $validator = Validator::make($request->all(), [
            'etudiant_id' => 'required|exists:etudiants,id',
            'annee_academique_id' => 'required|exists:annees_academiques,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $salle = SalleDeClasse::findOrFail((int) $salleId);
        $etudiant = Etudiant::findOrFail($request->etudiant_id);

        // Vérifier si l'inscription existe déjà
        $exists = InscriptionSalleEtudiant::where([
            'salle_de_classe_id' => $salle->id,
            'etudiant_id' => $etudiant->id,
            'annee_academique_id' => $request->annee_academique_id,
        ])->exists();

        if ($exists) {
            return response()->json(['message' => 'L\'étudiant est déjà inscrit dans cette salle pour cette année académique'], 409);
        }

        // Créer l'inscription
        InscriptionSalleEtudiant::create([
            'salle_de_classe_id' => $salle->id,
            'etudiant_id' => $etudiant->id,
            'annee_academique_id' => $request->annee_academique_id,
        ]);

        return response()->json(['message' => 'Étudiant inscrit à la salle'], 200);
    }

    public function affecterEnseignant(Request $request, $salleId)
    {
        $validator = Validator::make($request->all(), [
            'enseignant_id' => 'required|exists:enseignants,id',
            'annee_academique_id' => 'required|exists:annees_academiques,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $salle = SalleDeClasse::findOrFail((int) $salleId);
        $enseignant = Enseignant::findOrFail($request->enseignant_id);

        // Vérifier si l'inscription existe déjà
        $exists = InscriptionSalleEnseignant::where([
            'salle_de_classe_id' => $salle->id,
            'enseignant_id' => $enseignant->id,
            'annee_academique_id' => $request->annee_academique_id,
        ])->exists();

        if ($exists) {
            return response()->json(['message' => 'L\'enseignant est déjà inscrit dans cette salle pour cette année académique'], 409);
        }

        // Créer l'inscription
        InscriptionSalleEnseignant::create([
            'salle_de_classe_id' => $salle->id,
            'enseignant_id' => $enseignant->id,
            'annee_academique_id' => $request->annee_academique_id,
        ]);

        return response()->json(['message' => 'Enseignant inscrit à la salle'], 200);
    }
}