<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddFieldsToDocumentsTable extends Migration
{
    public function up()
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->string('extension')->after('type')->nullable();
            $table->foreignId('matiere_id')->nullable()->after('annee_academique_id')->constrained('matieres')->onDelete('set null');
            $table->json('salle_ids')->nullable()->after('matiere_id');
            $table->text('raison')->nullable()->after('salle_ids');
        });
    }

    public function down()
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['extension', 'matiere_id', 'salle_ids', 'raison']);
        });
    }
}
