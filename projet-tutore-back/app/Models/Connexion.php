<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Connexion extends Model
{
    use HasFactory;

    protected $fillable = ['email', 'password', 'code_securite', 'utilisateur_id', 'last_login'];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}
