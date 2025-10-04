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
            // Modifier document_id pour le rendre nullable
            $table->unsignedBigInteger('document_id')->nullable()->change();
            // Recréer la contrainte de clé étrangère
            $table->foreign('document_id')
                ->references('id')
                ->on('documents')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rapports_stage', function (Blueprint $table) {
            // Supprimer la contrainte de clé étrangère
            $table->dropForeign(['document_id']);
            // Restaurer document_id comme non-nullable
            $table->unsignedBigInteger('document_id')->nullable(false)->change();
            // Recréer la contrainte de clé étrangère
            $table->foreign('document_id')
                ->references('id')
                ->on('documents')
                ->onDelete('cascade');
        });
    }
};
