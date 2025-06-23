<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    public function habilitations()
    {
        return $this->hasMany(Habilitation::class);
    }
}

