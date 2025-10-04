<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscriptions_salle_etudiant', function (Blueprint $table) {
            $table->id();
            $table->foreignId('salle_de_classe_id')->constrained('salles_de_classe')->onDelete('cascade');
            $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');
            $table->foreignId('annee_academique_id')->constrained('annees_academiques')->onDelete('cascade');
            $table->timestamps();

            // Index unique pour éviter les inscriptions multiples
            $table->unique(['salle_de_classe_id', 'etudiant_id', 'annee_academique_id'], 'inscription_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscriptions_salle_etudiant');
    }
};