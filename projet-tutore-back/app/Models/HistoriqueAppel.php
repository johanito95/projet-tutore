<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistoriqueAppel extends Model
{
    public function appel()
    {
        return $this->belongsTo(Appel::class);
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}
