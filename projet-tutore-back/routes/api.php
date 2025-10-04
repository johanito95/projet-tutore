<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\FiliereController;
use App\Http\Controllers\API\AnneeAcademiqueController;
use App\Http\Controllers\API\AppelController;
use App\Http\Controllers\API\DocumentController;
use App\Http\Controllers\API\PresenceController;
use App\Http\Controllers\API\RapportStageController;
use App\Http\Controllers\API\SalleDeClasseController;
use App\Http\Controllers\API\CoursController;
use App\Http\Controllers\API\UniteEnseignementController;
use App\Http\Controllers\API\MatiereController;
use App\Http\Controllers\API\SemestreController;
use App\Http\Controllers\API\AffectationController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\EnseignantController;
use App\Http\Controllers\API\EtudiantController;
use App\Http\Controllers\API\InscriptionSalleEtudiantController;

// Route générale, accessible à /api/ping
Route::get('/ping', function () {
    return response()->json(['message' => 'pong']);
});

// ✅ Rendre /roles publique
Route::get('/roles', [RoleController::class, 'index']);

// Routes avec préfixe /auth
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);

    Route::get('/test', function () {
        return response()->json(['message' => 'API works']);
    });
});

// Routes protégées par auth:sanctum
Route::middleware('auth:sanctum')->group(function () {
    // utilisateurs
    Route::get('/infos', [AuthController::class, 'infos']);

    // Filières
    Route::get('/showfiliere', [FiliereController::class, 'showfiliere']);
    Route::post('/createfiliere', [FiliereController::class, 'createfiliere']);
    Route::put('/updatefiliere/{id}', [FiliereController::class, 'updatefiliere']);
    Route::delete('/deletefiliere/{id}', [FiliereController::class, 'deletefiliere']);

    // Années académiques
    Route::get('/showyearschool', [AnneeAcademiqueController::class, 'showyearschool']);
    Route::post('/createyearschool', [AnneeAcademiqueController::class, 'createyearschool']);
    Route::put('/updateyearschool/{id}', [AnneeAcademiqueController::class, 'updateyearschool']);
    Route::delete('/deleteyearschool/{id}', [AnneeAcademiqueController::class, 'deleteyearschool']);

    // Semestres
    Route::get('/showsemestre', [SemestreController::class, 'showsemestre']);
    Route::post('/createsemestre', [SemestreController::class, 'createsemestre']);
    Route::put('/updatesemestre/{id}', [SemestreController::class, 'updatesemestre']);
    Route::delete('/deletesemestre/{id}', [SemestreController::class, 'deletesemestre']);

    // Unités d'enseignement
    Route::get('/showUE', [UniteEnseignementController::class, 'showUE']);
    Route::post('/createUE', [UniteEnseignementController::class, 'createUE']);
    Route::put('/updateUE/{id}', [UniteEnseignementController::class, 'updateUE']);
    Route::delete('/deleteUE/{id}', [UniteEnseignementController::class, 'deleteUE']);

    // Matières
    Route::get('/showmatiere', [MatiereController::class, 'showmatiere']);
    Route::post('/creatematiere', [MatiereController::class, 'creatematiere']);
    Route::put('/updatematiere/{id}', [MatiereController::class, 'updatematiere']);
    Route::delete('/deletematiere/{id}', [MatiereController::class, 'deletematiere']);

    // Salles de classe
    Route::get('/showclasse', [SalleDeClasseController::class, 'showclasse']);
    Route::post('/createclasse', [SalleDeClasseController::class, 'createclasse']);
    Route::put('/updateclasse/{id}', [SalleDeClasseController::class, 'updateclasse']);
    Route::delete('/deleteclasse/{id}', [SalleDeClasseController::class, 'deleteclasse']);

    // Affectations
    Route::post('/salles-de-classe/{salleId}/affecter-etudiant', [AffectationController::class, 'affecterEtudiant']);
    Route::post('/salles-de-classe/{salleId}/affecter-enseignant', [AffectationController::class, 'affecterEnseignant']);

    // Cours
    Route::get('/cours', [CoursController::class, 'index']);
    Route::post('/cours', [CoursController::class, 'store']);
    Route::get('/cours/{id}', [CoursController::class, 'show']);
    Route::put('/cours/{id}', [CoursController::class, 'update']);
    Route::delete('/cours/{id}', [CoursController::class, 'destroy']);
    Route::get('/cours/etudiant', [CoursController::class, 'etudiantCours']);

    // Documents
    Route::get('/documents', [DocumentController::class, 'index']);
    Route::post('/documents', [DocumentController::class, 'store']);
    Route::get('/documents/{id}', [DocumentController::class, 'show']);
    Route::get('/documents/download/{id}', [DocumentController::class, 'download']);
    Route::post('/documents/{id}/approve', [DocumentController::class, 'approve']);
    Route::get('/getEnseignantDocuments', [DocumentController::class, 'getEnseignantDocuments']);
    Route::post('/documents/enseignants', [DocumentController::class, 'storeForEnseignants']);

    // Rapports de stage
    Route::get('/rapports-stage', [RapportStageController::class, 'index']);
    Route::post('/rapports-stage', [RapportStageController::class, 'store']);
    Route::post('/rapports-stage/{id}/valider', [RapportStageController::class, 'valider']);

    // Appels
    Route::get('/appels', [AppelController::class, 'index']);
    Route::post('/appels', [AppelController::class, 'store']);
    Route::put('/appels/{id}', [AppelController::class, 'update']);
    Route::post('/appels/{id}/valider', [AppelController::class, 'valider']);
    Route::get('/inscriptions-etudiants', [InscriptionSalleEtudiantController::class, 'getStudentsBySalleAndAnnee']);
    Route::get('/appels/cours/{cours_id}', [AppelController::class, 'appelsParCours']);
    Route::get('/appels/{id}', [AppelController::class, 'show']);

    // Présences
    Route::get('/presences', [PresenceController::class, 'index']);
    Route::post('/presences', [PresenceController::class, 'store']);
    Route::get('/presences/etudiant', [PresenceController::class, 'presencesEtudiant']);
    Route::get('/presences/salle/{salle_id}', [PresenceController::class, 'presencesParSalle']);
    Route::put('presences/{presence_id}', [PresenceController::class, 'updatePresence']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    // Enseignants
    Route::get('/enseignants', [EnseignantController::class, 'viewTeachers'])->name('enseignants.index');

    // Etudiants
    Route::get('/etudiants', [EtudiantController::class, 'viewStudents'])->name('etudiants.index');
});


// use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\API\AuthController;
// use App\Http\Controllers\API\RoleController;
// use App\Http\Controllers\API\FiliereController;
// use App\Http\Controllers\API\AnneeAcademiqueController;
// use App\Http\Controllers\API\AppelController;
// use App\Http\Controllers\API\DocumentController;
// use App\Http\Controllers\API\PresenceController;
// use App\Http\Controllers\API\RapportStageController;
// use App\Http\Controllers\API\SalleDeClasseController;
// use App\Http\Controllers\API\CoursController;
// use App\Http\Controllers\API\UniteEnseignementController;
// use App\Http\Controllers\API\MatiereController;
// use App\Http\Controllers\API\SemestreController;
// use App\Http\Controllers\API\AffectationController;
// use App\Http\Controllers\API\NotificationController;
// Use App\Http\Controllers\API\EnseignantController;
// use App\Http\Controllers\API\EtudiantController;
// use App\Http\Controllers\API\InscriptionSalleEtudiantController;

// // Route générale, accessible à /api/ping
// Route::get('/ping', function () {
//     return response()->json(['message' => 'pong']);
// });

// // Routes avec préfixe /auth
// Route::prefix('auth')->group(function () {
//     Route::post('register', [AuthController::class, 'register']);
//     Route::post('login', [AuthController::class, 'login']);
//     Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);

//     Route::get('/test', function () {
//         return response()->json(['message' => 'API works']);
//     });
// });

// // Routes protégées par auth:sanctum
// Route::middleware('auth:sanctum')->group(function () {
//     // utilisateurs
//     Route::get('/infos', [AuthController::class, 'infos']);

//     // Rôles
//     Route::get('/roles', [RoleController::class, 'index']);

//     // Filières
//     Route::get('/showfiliere', [FiliereController::class, 'showfiliere']);
//     Route::post('/createfiliere', [FiliereController::class, 'createfiliere']);
//     Route::put('/updatefiliere/{id}', [FiliereController::class, 'updatefiliere']);
//     Route::delete('/deletefiliere/{id}', [FiliereController::class, 'deletefiliere']);

//     // Années académiques
//     Route::get('/showyearschool', [AnneeAcademiqueController::class, 'showyearschool']);
//     Route::post('/createyearschool', [AnneeAcademiqueController::class, 'createyearschool']);
//     Route::put('/updateyearschool/{id}', [AnneeAcademiqueController::class, 'updateyearschool']);
//     Route::delete('/deleteyearschool/{id}', [AnneeAcademiqueController::class, 'deleteyearschool']);

//     // Semestres
//     Route::get('/showsemestre', [SemestreController::class, 'showsemestre']);
//     Route::post('/createsemestre', [SemestreController::class, 'createsemestre']);
//     Route::put('/updatesemestre/{id}', [SemestreController::class, 'updatesemestre']);
//     Route::delete('/deletesemestre/{id}', [SemestreController::class, 'deletesemestre']);

//     // Unités d'enseignement
//     Route::get('/showUE', [UniteEnseignementController::class, 'showUE']);
//     Route::post('/createUE', [UniteEnseignementController::class, 'createUE']);
//     Route::put('/updateUE/{id}', [UniteEnseignementController::class, 'updateUE']);
//     Route::delete('/deleteUE/{id}', [UniteEnseignementController::class, 'deleteUE']);

//     // Matières
//     Route::get('/showmatiere', [MatiereController::class, 'showmatiere']);
//     Route::post('/creatematiere', [MatiereController::class, 'creatematiere']);
//     Route::put('/updatematiere/{id}', [MatiereController::class, 'updatematiere']);
//     Route::delete('/deletematiere/{id}', [MatiereController::class, 'deletematiere']);

//     // Salles de classe
//     Route::get('/showclasse', [SalleDeClasseController::class, 'showclasse']);
//     Route::post('/createclasse', [SalleDeClasseController::class, 'createclasse']);
//     Route::put('/updateclasse/{id}', [SalleDeClasseController::class, 'updateclasse']);
//     Route::delete('/deleteclasse/{id}', [SalleDeClasseController::class, 'deleteclasse']);
//     // Route::get('/salles/user', [SalleDeClasseController::class, 'indexUserSalles']);

//     // Affectations
//     Route::post('/salles-de-classe/{salleId}/affecter-etudiant', [AffectationController::class, 'affecterEtudiant']);
//     //api/salles-de-classe/{salleId}/affecterEtudiant
//     Route::post('/salles-de-classe/{salleId}/affecter-enseignant', [AffectationController::class, 'affecterEnseignant']);
//     //api/salles-de-classe/{salleId}/affecter-enseignant
//     //fin affectations

//     // Cours
//     Route::get('/cours', [CoursController::class, 'index']);
//     Route::post('/cours', [CoursController::class, 'store']);
//     Route::get('/cours/{id}', [CoursController::class, 'show']);
//     Route::put('/cours/{id}', [CoursController::class, 'update']);
//     Route::delete('/cours/{id}', [CoursController::class, 'destroy']);
//     // Route vers les cours de l'étudiant
//     Route::get('/cours/etudiant', [CoursController::class, 'etudiantCours']);

//     // Documents
//     Route::get('/documents', [DocumentController::class, 'index']);
//     Route::post('/documents', [DocumentController::class, 'store']);
//     Route::get('/documents/{id}', [DocumentController::class, 'show']);
//     Route::get('/documents/download/{id}', [DocumentController::class, 'download']);
//     Route::post('/documents/{id}/approve', [DocumentController::class, 'approve']);
//     Route::get('/getEnseignantDocuments', [DocumentController::class, 'getEnseignantDocuments']);
//     Route::post('/documents/enseignants', [DocumentController::class, 'storeForEnseignants']);


//     // Rapports de stage
//     Route::get('/rapports-stage', [RapportStageController::class, 'index']);
//     Route::post('/rapports-stage', [RapportStageController::class, 'store']);
//     Route::post('/rapports-stage/{id}/valider', [RapportStageController::class, 'valider']);

//     // Appels
//     Route::get('/appels', [AppelController::class, 'index']);
//     Route::post('/appels', [AppelController::class, 'store']);
//     Route::put('/appels/{id}', [AppelController::class, 'update']);
//     Route::post('/appels/{id}/valider', [AppelController::class, 'valider']);
//     Route::get('/inscriptions-etudiants', [InscriptionSalleEtudiantController::class, 'getStudentsBySalleAndAnnee']);
//     Route::get('/appels/cours/{cours_id}', [AppelController::class, 'appelsParCours']);
//     Route::get('/appels/{id}', [AppelController::class, 'show']);


//     // Présences
//     Route::get('/presences', [PresenceController::class, 'index']);
//     Route::post('/presences', [PresenceController::class, 'store']);
//     Route::get('/presences/etudiant', [PresenceController::class, 'presencesEtudiant']);
//     Route::get('/presences/salle/{salle_id}', [PresenceController::class, 'presencesParSalle']);
//     Route::put('presences/{presence_id}', [PresenceController::class, 'updatePresence']);

//     // Notifications
//     Route::get('/notifications', [NotificationController::class, 'index']);
//     Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);

//     // Enseignants
//     Route::get('/enseignants', [EnseignantController::class, 'viewTeachers'])->name('enseignants.index');
//     // Etudiants
//     Route::get('/etudiants', [EtudiantController::class, 'viewStudents'])->name('etudiants.index');

// });
