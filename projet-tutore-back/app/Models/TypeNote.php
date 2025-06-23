<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeNote extends Model
{
    public function notes()
    {
        return $this->hasMany(Note::class, 'type_id');
    }
}

