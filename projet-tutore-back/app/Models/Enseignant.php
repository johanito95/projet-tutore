<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enseignant extends Model
{
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    public function responsableAcademique()
    {
        return $this->hasOne(ResponsableAcademique::class);
    }

    public function salles()
    {
        return $this->belongsToMany(SalleDeClasse::class, 'enseignants_salles', 'enseignant_id', 'salle_id');
    }

    public function matieres()
    {
        return $this->belongsToMany(Matiere::class, 'matieres_enseignants');
    }

    public function cours()
    {
        return $this->hasMany(Cours::class);
    }

    public function appels()
    {
        return $this->hasMany(Appel::class);
    }

    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}
