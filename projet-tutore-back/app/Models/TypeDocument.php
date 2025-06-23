<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TypeDocument extends Model
{
    public function documents()
    {
        return $this->hasMany(Document::class, 'type_id');
    }
}

