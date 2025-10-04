<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRapportSalleDeClasseTable extends Migration
{
    public function up()
    {
        Schema::create('rapport_salle_de_classe', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rapport_id')->constrained('rapports_stage')->onDelete('cascade');
            $table->foreignId('salle_de_classe_id')->constrained('salles_de_classe')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rapport_salle_de_classe');
    }
}
