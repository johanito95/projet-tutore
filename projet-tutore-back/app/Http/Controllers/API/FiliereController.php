<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Filiere;
use Illuminate\Support\Facades\Log;

class FiliereController extends Controller
{
    public function showfiliere()
    {
        $filieres = Filiere::all();
        return response()->json($filieres);
    }

    public function createfiliere(Request $request)
    {
        Log::info('Début de FiliereController::store', ['user' => get_class($request->user())]);

        $user = $request->user();
        if (!$user) {
            Log::error('Aucun utilisateur authentifié');
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        Log::info('Utilisateur chargé', ['user_id' => $user->id, 'model' => get_class($user)]);

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'code' => 'required|string|unique:filieres,code',
            'niveau' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $filiere = Filiere::create($request->all());
        return response()->json(['message' => 'Filière créée', 'filiere' => $filiere], 201);
    }

    public function updatefiliere(Request $request, $id)
    {
        $filiere = Filiere::findOrFail($id);
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'code' => 'required|string|unique:filieres,code,' . $id,
            'niveau' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $filiere->update($request->all());
        return response()->json(['message' => 'Filière mise à jour', 'filiere' => $filiere]);
    }

    public function deletefiliere($id)
    {
        $filiere = Filiere::findOrFail($id);
        $user = request()->user();

        if (!$user->hasRole('responsable academique')) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $filiere->delete();
        return response()->json(['message' => 'Filière supprimée']);
    }
}