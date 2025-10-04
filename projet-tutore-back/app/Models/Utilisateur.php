<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use HasFactory, HasApiTokens;

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

    // public function sauvegardes()
    // {
    //     return $this->hasMany(Sauvegarde::class, 'effectue_par');
    // }

    // public function restaurations()
    // {
    //     return $this->hasMany(Restauration::class, 'fait_par');
    // }

    public function logs()
    {
        return $this->hasMany(LogAction::class);
    }

    public function hasRole($role)
    {
        return $this->role()->value('nom') === $role;
    }

    // public function hasRole($roleName)
    // {
    //     return $this->role && $this->role->nom === $roleName;
    // }
}