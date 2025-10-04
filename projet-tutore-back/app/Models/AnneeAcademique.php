<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnneeAcademique extends Model
{
    protected $table = 'annees_academiques';
    protected $fillable = ['annee', 'date_debut', 'date_fin'];

    public function semestres()
    {
        return $this->hasMany(Semestre::class);
    }

    public function cours()
    {
        return $this->hasMany(Cours::class);
    }

    public function inscriptionsCours()
    {
        return $this->hasMany(InscriptionCours::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
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