<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Migrer les données de enseignants_salles vers inscriptions_salle_enseignant
        DB::table('enseignants_salles')->get()->each(function ($row) {
            DB::table('inscriptions_salle_enseignant')->insert([
                'salle_de_classe_id' => $row->salle_id,
                'enseignant_id' => $row->enseignant_id,
                'annee_academique_id' => 1, // Par défaut, utiliser l'année académique 1 (ajuste selon tes besoins)
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        // Supprimer la table enseignants_salles
        Schema::dropIfExists('enseignants_salles');
    }

    public function down(): void
    {
        // Recréer la table enseignants_salles pour la restauration
        Schema::create('enseignants_salles', function ($table) {
            $table->foreignId('salle_id')->constrained('salles_de_classe')->onDelete('cascade');
            $table->foreignId('enseignant_id')->constrained('enseignants')->onDelete('cascade');
            $table->primary(['salle_id', 'enseignant_id']);
        });

        // Restaurer les données depuis inscriptions_salle_enseignant
        DB::table('inscriptions_salle_enseignant')->get()->each(function ($row) {
            DB::table('enseignants_salles')->insert([
                'salle_id' => $row->salle_de_classe_id,
                'enseignant_id' => $row->enseignant_id,
            ]);
        });
    }
};