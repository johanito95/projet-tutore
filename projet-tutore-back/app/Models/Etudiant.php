<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Database\Eloquent\Model;

// class Etudiant extends Model
// {
//     use HasFactory;

//     protected $table = 'etudiants';
//     // ✅ Autoriser l'assignation de masse pour ces colonnes
//     protected $fillable = [
//         'utilisateur_id',
//         'matricule',
//         'filiere_id',
//         'annee_entree',
//         'annee_academique_id',
//         'statut_diplomation',
//     ];

//     public function utilisateur()
//     {
//         return $this->belongsTo(Utilisateur::class);
//     }

//     public function filiere()
//     {
//         return $this->belongsTo(Filiere::class);
//     }

//     public function anneeAcademique()
//     {
//         return $this->belongsTo(AnneeAcademique::class);
//     }

//     public function inscriptionsCours()
//     {
//         return $this->hasMany(InscriptionCours::class);
//     }

//     public function presences()
//     {
//         return $this->hasMany(Presence::class);
//     }

//     public function notes()
//     {
//         return $this->hasMany(Note::class);
//     }

//     public function rapportsStage()
//     {
//         return $this->hasMany(RapportStage::class);
//     }

//     public function diplomes()
//     {
//         return $this->hasMany(Diplome::class);
//     }

//     public function requetes()
//     {
//         return $this->hasMany(Requete::class);
//     }
// }

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    use HasFactory;

    protected $table = 'etudiants';
    protected $fillable = [
        'utilisateur_id',
        'matricule',
        'filiere_id',
        'annee_entree',
        'annee_academique_id',
        'statut_diplomation',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function anneeAcademique()
    {
        return $this->belongsTo(AnneeAcademique::class);
    }

    public function salles()
    {
        return $this->belongsToMany(SalleDeClasse::class, 'inscriptions_salle_etudiant', 'etudiant_id', 'salle_de_classe_id')
            ->withPivot('annee_academique_id')
            ->withTimestamps();
    }

    public function inscriptionsCours()
    {
        return $this->hasMany(InscriptionCours::class);
    }

    public function presences()
    {
        return $this->hasMany(Presence::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function rapportsStage()
    {
        return $this->hasMany(RapportStage::class);
    }

    public function diplomes()
    {
        return $this->hasMany(Diplome::class);
    }

    public function requetes()
    {
        return $this->hasMany(Requete::class);
    }
}
