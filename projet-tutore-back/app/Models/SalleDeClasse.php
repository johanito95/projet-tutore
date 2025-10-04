<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Model;

// class SalleDeClasse extends Model
// {
//     protected $table = 'salles_de_classe';
//     protected $fillable = ['nom', 'capacite', 'filiere_id', 'responsable_id'];

//     public function filiere()
//     {
//         return $this->belongsTo(Filiere::class);
//     }

//     public function responsable()
//     {
//         return $this->belongsTo(ResponsableAcademique::class, 'responsable_id');
//     }

//     public function enseignants()
//     {
//         return $this->belongsToMany(Enseignant::class, 'enseignants_salles');
//     }

//     public function cours()
//     {
//         return $this->hasMany(Cours::class, 'salle_id');
//     }
// }

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalleDeClasse extends Model
{
    protected $table = 'salles_de_classe';
    protected $fillable = ['nom', 'capacite', 'filiere_id', 'responsable_id'];

    public function filiere()
    {
        return $this->belongsTo(Filiere::class);
    }

    public function responsable()
    {
        return $this->belongsTo(ResponsableAcademique::class, 'responsable_id');
    }

    public function etudiants()
    {
        return $this->belongsToMany(Etudiant::class, 'inscriptions_salle_etudiant', 'salle_de_classe_id', 'etudiant_id')
            ->withPivot('annee_academique_id')
            ->withTimestamps();
    }

    public function enseignants()
    {
        return $this->belongsToMany(Enseignant::class, 'inscriptions_salle_enseignant', 'salle_de_classe_id', 'enseignant_id')
            ->withPivot('annee_academique_id')
            ->withTimestamps();
    }

    public function cours()
    {
        return $this->hasMany(Cours::class, 'salle_id');
    }

    public function documents()
    {
        return $this->belongsToMany(Document::class, 'document_salle_de_classe', 'salle_de_classe_id', 'document_id');
    }

    public function rapports()
    {
        return $this->belongsToMany(RapportStage::class, 'rapport_salle_de_classe', 'salle_de_classe_id', 'rapport_id');
    }

}