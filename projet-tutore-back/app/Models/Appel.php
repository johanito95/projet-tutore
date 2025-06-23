<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appel extends Model
{
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

