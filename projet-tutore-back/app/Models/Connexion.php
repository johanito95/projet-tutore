<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable; // <-- important
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Connexion extends Authenticatable
{
    use HasApiTokens, Notifiable, HasFactory;

    protected $fillable = [
        'email',
        'password',
        'code_securite',
        'utilisateur_id',
        'last_login',
    ];

    protected $hidden = [
        'password',
        'code_securite',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}
