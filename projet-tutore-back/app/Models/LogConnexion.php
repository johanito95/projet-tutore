<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogConnexion extends Model
{
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}

