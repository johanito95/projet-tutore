<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Semestre;
use Illuminate\Support\Facades\Log;

class SemestreController extends Controller
{
    public function showsemestre()
    {
        $semestres = Semestre::with('anneeAcademique')->paginate(10);
        return response()->json($semestres);
    }

    public function createsemestre(Request $request)
    {
        Log::info('Début de SemestreController::store', ['user' => get_class($request->user())]);

        $user = $request->user();
        if (!$user) {
            Log::error('Aucun utilisateur authentifié');
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $validator = Validator::make($request->all(), [
            'libelle' => 'required|string|max:255',
            'annee_academique_id' => 'required|exists:annees_academiques,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $semestre = Semestre::create($request->all());
        return response()->json(['message' => 'Semestre créé', 'semestre' => $semestre], 201);
    }

    public function updatesemestre(Request $request, $id)
    {
        $semestre = Semestre::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'libelle' => 'required|string|max:255',
            'annee_academique_id' => 'required|exists:annees_academiques,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $semestre->update($request->all());
        return response()->json(['message' => 'Semestre mis à jour', 'semestre' => $semestre]);
    }

    public function deletesemestre($id)
    {
        $semestre = Semestre::findOrFail($id);
        $user = request()->user();

        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        if ($semestre->cours()->exists()) {
            return response()->json(['message' => 'Impossible de supprimer : semestre lié à des cours'], 409);
        }

        $semestre->delete();
        return response()->json(['message' => 'Semestre supprimé']);
    }
}