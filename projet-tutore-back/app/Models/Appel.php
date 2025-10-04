<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appel extends Model
{
    protected $table = 'appels';
    protected $fillable = ['cours_id', 'enseignant_id', 'date_heure', 'commentaire', 'etat'];
    public function cours()
    {
        return $this->belongsTo(Cours::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function presences()
    {
        return $this->hasMany(Presence::class);
    }

    public function historique()
    {
        return $this->hasMany(HistoriqueAppel::class);
    }
}
