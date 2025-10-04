<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class RapportStage extends Model
{

    protected $table = 'rapports_stage';
    protected $fillable = ['etudiant_id','file','titre', 'statut', 'date_soumission'];
    public function etudiant()
    {
        return $this->belongsTo(Etudiant::class);
    }

    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }

    public function enseignant()
    {
        return $this->belongsTo(Enseignant::class);
    }

    public function anneeAcademique()
    {
        return $this->belongsTo(AnneeAcademique::class);
    }

    public function salleDeClasse()
    {
        return $this->belongsToMany(SalleDeClasse::class, 'rapport_salle_de_classe', 'rapport_id', 'salle_de_classe_id');
    }

    // public function document()
    // {
    //     return $this->belongsTo(Document::class);
    // }

    
}
