<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Habilitation extends Model
{
    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
