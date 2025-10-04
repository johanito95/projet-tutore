<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rapports_stage', function (Blueprint $table) {
            // Supprimer la contrainte de clé étrangère
            $table->dropForeign(['annee_academique_id']);
            // Supprimer la colonne
            $table->dropColumn('annee_academique_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapports_stage', function (Blueprint $table) {
            // Recréer la colonne
            $table->foreignId('annee_academique_id')->after('date_soumission');
            // Recréer la contrainte de clé étrangère
            $table->foreign('annee_academique_id')
                ->references('id')
                ->on('annees_academiques')
                ->onDelete('cascade');
        });
    }
};