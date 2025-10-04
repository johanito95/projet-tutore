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
            // Ajouter la colonne file comme nullable
            $table->string('file')->nullable()->after('etudiant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapports_stage', function (Blueprint $table) {
            // Supprimer la colonne
            $table->dropColumn('file');
        });
    }
};
