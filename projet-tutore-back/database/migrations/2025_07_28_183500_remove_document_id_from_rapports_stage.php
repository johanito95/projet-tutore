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
            $table->dropForeign(['document_id']);
            // Supprimer la colonne
            $table->dropColumn('document_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapports_stage', function (Blueprint $table) {
            // Recréer la colonne comme nullable
            $table->unsignedBigInteger('document_id')->nullable()->after('etudiant_id');
            // Recréer la contrainte de clé étrangère
            $table->foreign('document_id')
                ->references('id')
                ->on('documents')
                ->onDelete('cascade');
        });
    }
};
