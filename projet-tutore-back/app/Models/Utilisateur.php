<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Utilisateur extends Model
{
    use HasFactory;

    protected $fillable = ['nom', 'prenom', 'telephone', 'date_naissance', 'photo', 'role_id'];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function connexion()
    {
        return $this->hasOne(Connexion::class);
    }

    public function enseignant()
    {
        return $this->hasOne(Enseignant::class);
    }

    public function etudiant()
    {
        return $this->hasOne(Etudiant::class);
    }

    public function habilitations()
    {
        return $this->hasMany(Habilitation::class);
    }

    public function sauvegardes()
    {
        return $this->hasMany(Sauvegarde::class, 'effectue_par');
    }

    public function restaurations()
    {
        return $this->hasMany(Restauration::class, 'fait_par');
    }

    public function logs()
    {
        return $this->hasMany(LogAction::class);
    }
}
