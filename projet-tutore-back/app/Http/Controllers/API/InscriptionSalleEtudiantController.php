<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\InscriptionSalleEtudiant;
use App\Models\SalleDeClasse;
use App\Models\AnneeAcademique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InscriptionSalleEtudiantController extends Controller
{
    public function getStudentsBySalleAndAnnee(Request $request)
    {
        try {
            $salle_id = $request->query('salle_id');
            $annee_academique_id = $request->query('annee_academique_id');

            // Vérifier si salle_id existe
            if ($salle_id) {
                $salle = SalleDeClasse::find($salle_id);
                if (!$salle) {
                    Log::warning('Salle de classe non trouvée', ['salle_id' => $salle_id]);
                    return response()->json(['message' => 'Salle de classe non trouvée'], 404);
                }
            }

            // Si annee_academique_id n'est pas fourni, utiliser l'année académique courante
            if (!$annee_academique_id) {
                $annee_courante = AnneeAcademique::where('est_courante', true)->first();
                if (!$annee_courante) {
                    Log::warning('Aucune année académique courante trouvée');
                    return response()->json(['message' => 'Aucune année académique courante définie'], 422);
                }
                $annee_academique_id = $annee_courante->id;
            } elseif (!AnneeAcademique::find($annee_academique_id)) {
                Log::warning('Année académique non trouvée', ['annee_academique_id' => $annee_academique_id]);
                return response()->json(['message' => 'Année académique non trouvée'], 404);
            }

            // Récupérer les étudiants inscrits
            $inscriptions = InscriptionSalleEtudiant::with(['etudiant.utilisateur'])
                ->where('salle_de_classe_id', $salle_id)
                ->where('annee_academique_id', $annee_academique_id)
                ->get();

            if ($inscriptions->isEmpty()) {
                Log::warning('Aucun étudiant trouvé pour cette salle et année académique', [
                    'salle_id' => $salle_id,
                    'annee_academique_id' => $annee_academique_id,
                ]);
                return response()->json(['message' => 'Aucun étudiant inscrit dans cette salle pour cette année académique'], 404);
            }

            $etudiants = $inscriptions->map(function ($inscription) {
                $etudiant = $inscription->etudiant;
                return [
                    'id' => $etudiant->id,
                    'nom' => $etudiant->utilisateur ? $etudiant->utilisateur->nom : 'N/A',
                    'prenom' => $etudiant->utilisateur ? $etudiant->utilisateur->prenom : 'N/A',
                    'email' => $etudiant->utilisateur ? $etudiant->utilisateur->email : 'N/A',
                ];
            });

            Log::info('Étudiants récupérés via inscriptions', [
                'salle_id' => $salle_id,
                'annee_academique_id' => $annee_academique_id,
                'count' => $etudiants->count(),
            ]);

            return response()->json($etudiants, 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des étudiants via inscriptions', [
                'salle_id' => $salle_id ?? 'N/A',
                'annee_academique_id' => $annee_academique_id ?? 'N/A',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'query' => $salle_id ? "SELECT * FROM inscriptions_salle_etudiant WHERE salle_de_classe_id = $salle_id AND annee_academique_id = $annee_academique_id" : 'N/A',
            ]);
            return response()->json([
                'message' => 'Erreur lors de la récupération des étudiants',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
