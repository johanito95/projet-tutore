<?php
 use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;

// Route générale, accessible à /api/ping
Route::get('/ping', function () {
    return response()->json(['message' => 'pong']);
});

// Routes avec préfixe /auth
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->post('logout', [AuthController::class, 'logout']);

    Route::get('/test', function () {
        return response()->json(['message' => 'API works']);
    });
});
