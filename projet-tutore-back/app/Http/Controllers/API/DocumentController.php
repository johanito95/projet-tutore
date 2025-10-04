<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\Document;
use App\Models\AnneeAcademique;
use App\Models\SalleDeClasse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $documents = Document::with(['uploader', 'anneeAcademique'])->get();
        return response()->json($documents);
    }

    public function indexEnseignant(Request $request)
    {
        Log::debug('Début de DocumentController::indexEnseignant');

        try {
            DB::enableQueryLog();

            $documents = Document::with([
                'uploader' => function ($query) {
                    $query->select('id', 'nom', 'prenom')->with([
                        'roles' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                },
                'anneeAcademique'
            ])
                ->whereHas('uploader', function ($query) {
                    $query->whereHas('roles', function ($subQuery) {
                        $subQuery->where('nom', 'enseignant'); // Changé de 'enseignant' à 'enseignants'
                    });
                })
                ->get();

            Log::debug('Requête SQL exécutée', ['query' => DB::getQueryLog()]);

            Log::info('Documents des enseignants récupérés', ['count' => $documents->count()]);
            return response()->json($documents);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des documents des enseignants', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Erreur lors de la récupération des documents: ' . $e->getMessage()], 500);
        }
    }

    public function indexUserDocuments(Request $request)
    {
        Log::debug('Début de DocumentController::indexUserDocuments', ['request' => $request->all()]);

        try {
            $user = $request->user();
            if (!$user) {
                Log::error('Utilisateur non authentifié');
                return response()->json(['error' => 'Utilisateur non authentifié'], 401);
            }

            if (!is_numeric($user->id)) {
                Log::error('ID utilisateur invalide', ['user_id' => $user->id]);
                return response()->json(['error' => 'ID utilisateur invalide'], 500);
            }

            DB::enableQueryLog();

            $documents = Document::with([
                'uploader' => function ($query) {
                    $query->select('id', 'nom', 'prenom')->with([
                        'roles' => function ($query) {
                            $query->select('id', 'name');
                        }
                    ]);
                },
                'anneeAcademique',
                'matiere',
                'SalleDeClasse'
            ])
                ->where('uploader_id', $user->id)
                ->get();

            Log::debug('Requête SQL exécutée', ['query' => DB::getQueryLog(), 'user_id' => $user->id]);

            Log::info('Documents de l\'utilisateur récupérés', [
                'user_id' => $user->id,
                'count' => $documents->count()
            ]);
            return response()->json($documents);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des documents de l\'utilisateur', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Erreur lors de la récupération des documents: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        Log::debug('Début de DocumentController::store', ['request' => $request->all()]);

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'type' => 'required|string|in:cours,rapport,autre',
            'file' => 'required|file|mimes:pdf,doc,docx|max:204800',
            'annee_academique_id' => 'required|exists:annees_academiques,id',
            'matiere_id' => 'nullable|exists:matieres,id',
            'salle_ids' => 'nullable|array',
            'salle_ids.*' => 'exists:salle_de_classe,id',
            'raison' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            Log::error('Erreur de validation', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        if (!$user) {
            Log::error('Utilisateur non authentifié');
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        if (!$user->hasRole('enseignant') && !$user->hasRole('etudiant') && !$user->hasRole('responsable academique')) {
            Log::error('Utilisateur non autorisé', ['user_id' => $user->id]);
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        try {
            if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
                Log::error('Fichier invalide ou non fourni');
                return response()->json(['error' => 'Fichier invalide ou non fourni'], 422);
            }

            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $path = $file->store('documents', 'public');

            if (!$path || !Storage::disk('public')->exists($path)) {
                Log::error('Échec du stockage du fichier', ['path' => $path]);
                return response()->json(['error' => 'Échec du stockage du fichier'], 500);
            }

            $document = Document::create([
                'nom' => $request->nom,
                'type' => $request->type,
                'extension' => $extension,
                'url' => $path,
                'date_upload' => now()->toDateString(),
                'uploader_id' => $user->id,
                'annee_academique_id' => $request->annee_academique_id,
                'matiere_id' => $request->matiere_id,
                'salle_ids' => $request->salle_ids ? json_encode($request->salle_ids) : null,
                'raison' => $request->raison,
                'approved' => $user->hasRole('responsable academique') ? true : false, // Auto-approuver si RA
            ]);

            if ($request->salle_ids) {
                $document->SalleDeClasse()->sync($request->salle_ids);
            }

            Log::info('Document créé avec succès', ['document_id' => $document->id]);
            return response()->json(['message' => 'Document téléversé', 'document' => $document], 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'upload', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['error' => 'Erreur lors de l\'upload: ' . $e->getMessage()], 500);
        }
    }


    // public function show($id)
    // {
    //     $document = Document::with([
    //         'uploader' => function ($query) {
    //             $query->select('id', 'nom', 'prenom')->with('roles');
    //         },
    //         'anneeAcademique',
    //         'matiere',
    //         'SalleDeClasse'
    //     ])->findOrFail($id);

    //     return response()->json([
    //         'id' => $document->id,
    //         'nom' => $document->nom,
    //         'type' => $document->type,
    //         'extension' => $document->extension,
    //         'url' => $document->url,
    //         'date_upload' => $document->date_upload,
    //         'uploader' => [
    //             'id' => $document->uploader->id,
    //             'nom' => $document->uploader->nom,
    //             'prenom' => $document->uploader->prenom,
    //             'role' => $document->uploader->roles->first()->name ?? 'N/A'
    //         ],
    //         'annee_academique' => $document->anneeAcademique->annee ?? 'N/A',
    //         'matiere' => $document->matiere ? [
    //             'id' => $document->matiere->id,
    //             'nom' => $document->matiere->nom,
    //             'code' => $document->matiere->code
    //         ] : null,
    //         'salle_de_classes' => $document->SalleDeClasse->map(function ($salle) {
    //             return [
    //                 'id' => $salle->id,
    //                 'nom' => $salle->nom,
    //                 'filiere' => $salle->filiere->nom ?? 'N/A'
    //             ];
    //         })->toArray(),
    //         'raison' => $document->raison,
    //         'approved' => $document->approved,
    //     ]);
    // }

    public function storeForEnseignants(Request $request)
    {
        Log::debug('Début de DocumentController::storeForEnseignants', ['request' => $request->all()]);

        $user = $request->user();
        if (!$user) {
            Log::error('Utilisateur non authentifié');
            return response()->json(['error' => 'Utilisateur non authentifié'], 401);
        }

        if (!$user->hasRole('responsable academique')) {
            Log::error('Utilisateur non autorisé pour téléverser des documents réservés aux enseignants', ['user_id' => $user->id]);
            return response()->json(['message' => 'Seuls les responsables académiques peuvent téléverser des documents pour les enseignants'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'type' => 'required|string|in:cours,rapport,autre',
            'file' => 'required|file|mimes:pdf,doc,docx|max:204800',
            'annee_academique_id' => 'required|exists:annees_academiques,id',
            'matiere_id' => 'nullable|exists:matieres,id',
            'salle_ids' => 'nullable|array',
            'salle_ids.*' => 'exists:salles_de_classe,id',
            'raison' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            Log::error('Erreur de validation', ['errors' => $validator->errors()]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
                Log::error('Fichier invalide ou non fourni');
                return response()->json(['error' => 'Fichier invalide ou non fourni'], 422);
            }

            $file = $request->file('file');
            $extension = $file->getClientOriginalExtension();
            $path = $file->store('documents/enseignants', 'public');

            if (!$path || !Storage::disk('public')->exists($path)) {
                Log::error('Échec du stockage du fichier', ['path' => $path]);
                return response()->json(['error' => 'Échec du stockage du fichier'], 500);
            }

            $document = Document::create([
                'nom' => $request->nom,
                'type' => $request->type,
                'extension' => $extension,
                'url' => $path,
                'date_upload' => now()->toDateString(),
                'uploader_id' => $user->id,
                'annee_academique_id' => $request->annee_academique_id,
                'matiere_id' => $request->matiere_id,
                'salle_ids' => $request->salle_ids ? json_encode($request->salle_ids) : null,
                'raison' => $request->raison,
                'approved' => true, // Auto-approuvé pour les responsables académiques
                'restrict_to_role' => 'enseignant', // Restreint aux enseignants
            ]);

            if ($request->salle_ids) {
                $document->SalleDeClasse()->sync($request->salle_ids);
            }

            Log::info('Document réservé aux enseignants créé avec succès', [
                'document_id' => $document->id,
                'uploader_id' => $user->id
            ]);
            return response()->json(['message' => 'Document téléversé pour les enseignants', 'document' => $document], 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'upload pour enseignants', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Erreur lors de l\'upload: ' . $e->getMessage()], 500);
        }
    }

    public function getEnseignantDocuments(Request $request)
    {
        Log::debug('Début de DocumentController::getEnseignantDocuments', ['user_id' => $request->user()?->id]);

        try {
            $user = $request->user();
            if (!$user) {
                Log::error('Utilisateur non authentifié');
                return response()->json(['error' => 'Utilisateur non authentifié'], 401);
            }

            if (!$user->hasRole('enseignant')) {
                Log::error('Utilisateur non autorisé', ['user_id' => $user->id]);
                return response()->json(['message' => 'Seuls les enseignants peuvent accéder à ces documents'], 403);
            }

            DB::enableQueryLog();

            $documents = Document::with([
                'uploader' => function ($query) {
                    $query->select('id', 'nom', 'prenom')->with([
                        'role' => function ($query) {
                            $query->select('id', 'nom');
                        }
                    ]);
                },
                'anneeAcademique' => function ($query) {
                    $query->select('id', 'annee');
                },
                'matiere' => function ($query) {
                    $query->select('id', 'nom', 'code');
                },
                'SalleDeClasse' => function ($query) {
                    $query->select('salles_de_classe.id', 'salles_de_classe.nom', 'filiere_id')
                        ->with([
                            'filiere' => function ($query) {
                                $query->select('id', 'nom');
                            }
                        ]);
                }
            ])
                // ->where(function ($query) {
                //     $query->whereHas('uploader', function ($subQuery) {
                //         $subQuery->whereHas('role', function ($roleQuery) {
                //             $roleQuery->where('roles.id');
                //         });
                //     })->orWhere('documents.restrict_to_role', 'enseignant');
                // })
                ->where(function ($query) {
                    $query->whereHas('uploader', function ($subQuery) {
                        $subQuery->where('role_id', function ($roleQuery) {
                            $roleQuery->select('id')
                                ->from('roles')
                                ->where('nom', 'responsable academique')
                                ->limit(1);
                        });
                    })->orWhere('documents.restrict_to_role', 'enseignant');
                })
                ->get();

            if ($documents->isEmpty()) {
                Log::info('Aucun document trouvé pour les enseignants', ['user_id' => $user->id]);
                return response()->json([], 200);
            }

            $formattedDocuments = $documents->map(function ($document) {
                return [
                    'id' => $document->id,
                    'nom' => $document->nom,
                    'type' => $document->type,
                    'extension' => $document->extension,
                    'url' => $document->url,
                    'date_upload' => $document->date_upload,
                    'uploader' => [
                        'id' => $document->uploader->id,
                        'nom' => $document->uploader->nom,
                        'prenom' => $document->uploader->prenom,
                    ],
                    'annee_academique' => $document->anneeAcademique ? [
                        'id' => $document->anneeAcademique->id,
                        'annee' => $document->anneeAcademique->annee,
                    ] : null,
                    'matiere' => $document->matiere ? [
                        'id' => $document->matiere->id,
                        'nom' => $document->matiere->nom,
                        'code' => $document->matiere->code,
                    ] : null,
                    'salle_de_classes' => $document->SalleDeClasse->map(function ($salle) {
                        return [
                            'id' => $salle->id,
                            'nom' => $salle->nom,
                            'filiere' => $salle->filiere->nom ?? 'N/A',
                        ];
                    })->toArray(),
                    'raison' => $document->raison,
                    'approved' => $document->approved,
                    'restrict_to_role' => $document->restrict_to_role,
                ];
            });

            Log::debug('Requête SQL exécutée', ['query' => DB::getQueryLog()]);
            Log::info('Documents pour enseignants récupérés', [
                'user_id' => $user->id,
                'count' => $formattedDocuments->count(),
            ]);

            return response()->json($formattedDocuments, 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des documents pour enseignants', [
                'user_id' => $user->id ?? 'N/A',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => 'Erreur lors de la récupération des documents: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        Log::debug('Début de DocumentController::show', ['id' => $id]);

        if (!is_numeric($id)) {
            Log::error('ID de document invalide', ['id' => $id]);
            return response()->json(['error' => 'ID de document invalide'], 400);
        }

        try {
            $document = Document::with([
                'uploader' => function ($query) {
                    $query->select('id', 'nom', 'prenom')->with([
                        'role' => function ($query) {
                            $query->select('id', 'nom');
                        }
                    ]);
                },
                'anneeAcademique',
                'matiere',
                'SalleDeClasse'
            ])->findOrFail($id);

            return response()->json([
                'id' => (int) $document->id,
                'nom' => $document->nom,
                'type' => $document->type,
                'extension' => $document->extension,
                'url' => $document->url,
                'date_upload' => $document->date_upload,
                'uploader' => [
                    'id' => $document->uploader->id,
                    'nom' => $document->uploader->nom,
                    'prenom' => $document->uploader->prenom,
                    'role' => $document->uploader->role->nom ?? 'N/A'
                ],
                'annee_academique' => $document->anneeAcademique ? [
                    'id' => $document->anneeAcademique->id,
                    'annee' => $document->anneeAcademique->annee
                ] : null,
                'matiere' => $document->matiere ? [
                    'id' => $document->matiere->id,
                    'nom' => $document->matiere->nom,
                    'code' => $document->matiere->code
                ] : null,
                'salle_de_classes' => $document->SalleDeClasse->map(function ($salle) {
                    return [
                        'id' => $salle->id,
                        'nom' => $salle->nom,
                        'filiere' => $salle->filiere->nom ?? 'N/A'
                    ];
                })->toArray(),
                'raison' => $document->raison,
                'approved' => $document->approved,
                'restrict_to_role' => $document->restrict_to_role,
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération du document', [
                'document_id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Document non trouvé ou erreur: ' . $e->getMessage()], 404);
        }
    }

    // public function download($id)
    // {
    //     Log::debug('Début de DocumentController::download', ['id' => $id]);

    //     if (!is_numeric($id)) {
    //         Log::error('ID de document invalide', ['id' => $id]);
    //         return response()->json(['error' => 'ID de document invalide'], 400);
    //     }

    //     try {
    //         $document = Document::findOrFail($id);
    //         if (!Storage::disk('public')->exists($document->url)) {
    //             Log::error('Fichier non trouvé pour téléchargement', ['document_id' => $id, 'url' => $document->url]);
    //             return response()->json(['error' => 'Fichier non trouvé'], 404);
    //         }
    //         return Storage::disk('public')->download($document->url, $document->nom . '.' . $document->extension);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur lors du téléchargement du document', [
    //             'document_id' => $id,
    //             'message' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);
    //         return response()->json(['error' => 'Erreur lors du téléchargement: ' . $e->getMessage()], 500);
    //     }
    // }

    public function download($id)
    {
        $document = Document::findOrFail($id);
        if (!Storage::disk('public')->exists($document->url)) {
            Log::error('Fichier non trouvé pour téléchargement', ['document_id' => $id, 'url' => $document->url]);
            return response()->json(['error' => 'Fichier non trouvé'], 404);
        }
        return Storage::disk('public')->download($document->url, $document->nom . '.' . $document->extension);
    }
}

    // public function show($id)
    // {
    //     Log::debug('Début de DocumentController::show', ['id' => $id]);

    //     if (!is_numeric($id)) {
    //         Log::error('ID de document invalide', ['id' => $id]);
    //         return response()->json(['error' => 'ID de document invalide'], 400);
    //     }

    //     try {
    //         $document = Document::with([
    //             'uploader' => function ($query) {
    //                 $query->select('id', 'nom', 'prenom')->with('roles');
    //             },
    //             'anneeAcademique',
    //             'matiere',
    //             'SalleDeClasse'
    //         ])->findOrFail($id);

    //         return response()->json([
    //             'id' => $document->id,
    //             'nom' => $document->nom,
    //             'type' => $document->type,
    //             'extension' => $document->extension,
    //             'url' => $document->url,
    //             'date_upload' => $document->date_upload,
    //             'uploader' => [
    //                 'id' => $document->uploader->id,
    //                 'nom' => $document->uploader->nom,
    //                 'prenom' => $document->uploader->prenom,
    //                 'role' => $document->uploader->roles->first()->name ?? 'N/A'
    //             ],
    //             'annee_academique' => $document->anneeAcademique->annee ?? 'N/A',
    //             'matiere' => $document->matiere ? [
    //                 'id' => $document->matiere->id,
    //                 'nom' => $document->matiere->nom,
    //                 'code' => $document->matiere->code
    //             ] : null,
    //             'salle_de_classes' => $document->SalleDeClasse->map(function ($salle) {
    //                 return [
    //                     'id' => $salle->id,
    //                     'nom' => $salle->nom,
    //                     'filiere' => $salle->filiere->nom ?? 'N/A'
    //                 ];
    //             })->toArray(),
    //             'raison' => $document->raison,
    //             'approved' => $document->approved,
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur lors de la récupération du document', [
    //             'id' => $id,
    //             'message' => $e->getMessage(),
    //             'trace' => $e->getTraceAsString()
    //         ]);
    //         return response()->json(['error' => 'Document non trouvé ou erreur: ' . $e->getMessage()], 404);
    //     }
    // }




    // public function approve($id)
    // {
    //     Log::debug('Début de DocumentController::approve', ['document_id' => $id]);

    //     $user = auth()->user();
    //     if (!$user || !$user->hasRole('responsable academique')) {
    //         Log::error('Utilisateur non autorisé pour approuver', ['user_id' => $user?->id]);
    //         return response()->json(['message' => 'Non autorisé'], 403);
    //     }

    //     $document = Document::findOrFail($id);
    //     if (!$document->uploader || !$document->uploader->hasRole('etudiant')) {
    //         Log::error('Document non éligible à l\'approbation', ['document_id' => $id]);
    //         return response()->json(['message' => 'Seuls les documents des étudiants peuvent être approuvés'], 400);
    //     }

    //     try {
    //         $document->update(['approved' => true]);
    //         Log::info('Document approuvé', ['document_id' => $id, 'approved_by' => $user->id]);
    //         return response()->json(['message' => 'Document approuvé', 'document' => $document], 200);
    //     } catch (\Exception $e) {
    //         Log::error('Erreur lors de l\'approbation', ['message' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
    //         return response()->json(['error' => 'Erreur lors de l\'approbation: ' . $e->getMessage()], 500);
    //     }
    // }
