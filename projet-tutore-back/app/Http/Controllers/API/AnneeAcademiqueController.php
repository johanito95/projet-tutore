<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\AnneeAcademique;
use Illuminate\Support\Facades\Log;

class AnneeAcademiqueController extends Controller
{
    public function showyearschool()
    {
        $annees = AnneeAcademique::paginate(10);
        return response()->json($annees);
    }

    public function createyearschool(Request $request)
    {
        Log::info('Début de AnneeAcademiqueController::createyearschool', ['user' => get_class($request->user())]);

        $user = $request->user();
        if (!$user) {
            Log::error('Aucun utilisateur authentifié');
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $validator = Validator::make($request->all(), [
            'annee' => 'required|string|max:255|unique:annees_academiques,annee',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $annee = AnneeAcademique::create($request->all());
        return response()->json(['message' => 'Année académique créée', 'annee' => $annee], 201);
    }

    public function updateyearschool(Request $request, $id)
    {
        $annee = AnneeAcademique::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'annee' => 'required|string|max:255|unique:annees_academiques,annee,' . $id,
            'date_debut' => 'required|date',
            'date_fin' => 'required|date|after:date_debut',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $annee->update($request->all());
        return response()->json(['message' => 'Année académique mise à jour', 'annee' => $annee]);
    }

    public function deleteyearschool($id)
    {
        $annee = AnneeAcademique::findOrFail($id);
        $user = request()->user();

        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($annee->semestres()->exists() || $annee->cours()->exists()) {
            return response()->json(['message' => 'Impossible de supprimer : année liée à des semestres ou cours'], 409);
        }

        $annee->delete();
        return response()->json(['message' => 'Année académique supprimée']);
    }
}