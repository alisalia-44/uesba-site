<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    // On remplace 'welcome' par 'index' pour charger ton site UESBA
    return view('index');
});


