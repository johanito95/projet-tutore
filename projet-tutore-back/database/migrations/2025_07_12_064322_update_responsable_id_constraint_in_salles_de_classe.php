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
        Schema::table('salles_de_classe', function (Blueprint $table) {
            // Supprimer l'ancienne contrainte (remplace par le nom exact trouvé)
            $table->dropForeign('salles_de_classe_responsable_id_foreign');
            // Ajouter la nouvelle contrainte
            $table->foreign('responsable_id')->references('id')->on('responsable_academiques')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salles_de_classe', function (Blueprint $table) {
            // Restaurer l'ancienne contrainte
            $table->dropForeign('salles_de_classe_responsable_id_foreign');
            $table->foreign('responsable_id')->references('id')->on('responsables_academiques')->onDelete('cascade');
        });
    }
};