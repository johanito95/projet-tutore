<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnneeAcademiqueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('annees_academiques')->insert([
            [
                'annee' => '2022-2023',
                'date_debut' => Carbon::create(2022, 10, 1),
                'date_fin' => Carbon::create(2023, 7, 31),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'annee' => '2023-2024',
                'date_debut' => Carbon::create(2023, 10, 1),
                'date_fin' => Carbon::create(2024, 7, 31),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'annee' => '2024-2025',
                'date_debut' => Carbon::create(2024, 10, 1),
                'date_fin' => Carbon::create(2025, 7, 31),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
