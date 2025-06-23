<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatutPresence extends Model
{
    protected $table = 'statuts_presences';

    public function presences()
    {
        return $this->hasMany(Presence::class, 'statut_id');
    }
}
