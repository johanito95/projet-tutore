<?php

namespace App\Http\Controllers\API;

use App\Models\Enseignant;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class EnseignantController extends Controller
{
    /**
     * Display a listing of teachers with their user information.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function viewTeachers()
    {
        try {
            // Fetch teachers with their related user data
            $enseignants = Enseignant::with('utilisateur')->get();
            return response()->json($enseignants, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des enseignants',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}