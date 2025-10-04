<?php

// namespace App\Http\Controllers\API;

// use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Validator;
// use App\Models\RapportStage;
// use App\Models\Document;

// class RapportStageController extends Controller
// {
//     public function index(Request $request)
//     {
//         $rapports = RapportStage::with(['etudiant.utilisateur', 'document'])->get();
//         return response()->json($rapports);
//     }

//     public function store(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'titre' => 'required|string|max:255',
//             'document_id' => 'required|exists:documents,id',
//             'annee_academique_id' => 'required|exists:annees_academiques,id',
//         ]);

//         if ($validator->fails()) {
//             return response()->json(['errors' => $validator->errors()], 422);
//         }

//         $user = $request->user();
//         if (!$user->hasRole('etudiant')) {
//             return response()->json(['message' => 'Non autorisé'], 403);
//         }

//         $rapport = RapportStage::create([
//             'etudiant_id' => $user->etudiant->id,
//             'document_id' => $request->document_id,
//             'titre' => $request->titre,
//             'statut' => 'soumis',
//             'date_soumission' => now(),
//             'annee_academique_id' => $request->annee_academique_id,
//         ]);

//         return response()->json(['message' => 'Rapport soumis', 'rapport' => $rapport], 201);
//     }

//     public function valider(Request $request, $id)
//     {
//         $rapport = RapportStage::findOrFail($id);
//         $user = $request->user();

//         if (!$user->hasRole('responsable academique')) {
//             return response()->json(['message' => 'Non autorisé'], 403);
//         }

//         $rapport->statut = 'valide';
//         $rapport->save();

//         return response()->json(['message' => 'Rapport validé']);
//     }
// }

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\RapportStage;
use App\Models\Document;

class RapportStageController extends Controller
{
    public function index(Request $request)
    {
        $rapports = RapportStage::with(['etudiant', 'matiere', 'enseignant', 'anneeAcademique'])
            ->get()
            ->map(function ($rapport) {
                return [
                    'id' => $rapport->id,
                    'titre' => $rapport->titre,
                    'statut' => $rapport->statut,
                    'date_soumission' => $rapport->date_soumission,
                    'file' => $rapport->file,
                    'etudiant' => $rapport->etudiant ? [
                        'id' => $rapport->etudiant->id,
                        'nom' => $rapport->etudiant->nom,
                        'prenom' => $rapport->etudiant->prenom,
                    ] : null,
                    'matiere' => $rapport->matiere ? [
                        'id' => $rapport->matiere->id,
                        'nom' => $rapport->matiere->nom,
                    ] : null,
                    'enseignant' => $rapport->enseignant ? [
                        'id' => $rapport->enseignant->id,
                        'nom' => $rapport->enseignant->nom,
                        'prenom' => $rapport->enseignant->prenom,
                    ] : null,
                    'anneeAcademique' => $rapport->anneeAcademique ? [
                        'id' => $rapport->anneeAcademique->id,
                        'annee' => $rapport->anneeAcademique->annee,
                    ] : null,
                ];
            });

        return response()->json($rapports);
    }


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titre' => 'required|string|max:255',
            'matiere_id' => 'nullable|exists:matieres,id',
            'file' => 'nullable|file|mimes:pdf,doc,docx|max:10240', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('etudiant')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $filePath = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . str_replace(' ', '_', $file->getClientOriginalName());
            $filePath = $file->storeAs('rapports', $filename, 'public');
        }

        $rapport = RapportStage::create([
            'etudiant_id' => $user->etudiant->id,
            'file' => $filePath,
            'titre' => $request->titre,
            'statut' => 'soumis',
            'date_soumission' => now(),
            'matiere_id' => $request->matiere_id,
        ]);

        return response()->json(['message' => 'Rapport soumis', 'rapport' => $rapport->load('etudiant', 'matiere', 'enseignant', 'anneeAcademique')], 201);
    }

    public function valider(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'statut' => 'required|in:valide,rejete',
            'commentaire' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rapport = RapportStage::findOrFail($id);
        $user = $request->user();

        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $rapport->statut = $request->statut;
        $rapport->commentaire = $request->commentaire;
        $rapport->save();

        return response()->json(['message' => 'Rapport mis à jour', 'rapport' => $rapport]);
    }
}
