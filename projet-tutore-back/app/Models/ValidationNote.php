<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ValidationNote extends Model
{
    public function note()
    {
        return $this->belongsTo(Note::class);
    }

    public function responsable()
    {
        return $this->belongsTo(ResponsableAcademique::class, 'responsable_id');
    }
}
