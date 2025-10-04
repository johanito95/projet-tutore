<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Semestre;
use App\Models\AnneeAcademique;

class SemestreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Récupère toutes les années académiques existantes
        $annees = AnneeAcademique::all();

        foreach ($annees as $annee) {
            Semestre::create([
                'libelle' => 'Semestre 1',
                'annee_academique_id' => $annee->id,
            ]);

            Semestre::create([
                'libelle' => 'Semestre 2',
                'annee_academique_id' => $annee->id,
            ]);
        }
    }
}
