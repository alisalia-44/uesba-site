<?php

use App\Http\Controllers\ActualitesController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\EvenementsController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\MessagesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    //routes pour reserver au admin 
    Route::middleware('isAdmin')->group(function () {
        route::get('/roles',[UserController::class,'getroles']);
        route::get('/dash', [HomeController::class, 'Dash']);
        Route::post('/logout', [AuthController::class, 'LogOut']);

        Route::get('/messages', [MessagesController::class, 'index']);
        Route::delete('/messages/{id}', [MessagesController::class, 'destroy']);

        Route::post('/create-actualite', [ActualitesController::class, 'CreateActualite']);
        Route::delete('/delete-actualite', [ActualitesController::class, 'DeleteActualite']);
        Route::put('/update-actualite', [ActualitesController::class, 'UpdateActualite']);


        Route::post('/create-evenement', [EvenementsController::class, 'CreateEvent']);
        Route::delete('/delete-evenement', [EvenementsController::class, 'DeleteEvent']);
        Route::put('/update-evenement', [EvenementsController::class, 'UpdateEvent']);

        // RESTful event endpoints (new)
        Route::get('/evenements', [EvenementsController::class, 'GetEvents']);
        Route::post('/evenements', [EvenementsController::class, 'CreateEvent']);
        Route::put('/evenements/{id}', [EvenementsController::class, 'UpdateEvent']);
        Route::delete('/evenements/{id}', [EvenementsController::class, 'DeleteEvent']);
        Route::get('/evenements/latest', [EvenementsController::class, 'Latest']);
        Route::get('/evenements/{id}', [EvenementsController::class, 'DetailEvent']);



        Route::post('/create-membre', [UserController::class, 'AjouterMembre']);
        Route::delete('/delete-membre', [UserController::class, 'SupprimerMembre']);
        Route::put('/update-membre', [UserController::class, 'ModiferMembre']);
        Route::get('/mail-list', [UserController::class, 'MailList']);
        Route::patch('/set-member-past', [UserController::class, 'SetMemberPast']);
    });

route::get('/members',[UserController::class,'GetMembers']);

    // routes reserver les ulisateurs lambda connectes


});


Route::post('/login', [AuthController::class, 'Login']);
Route::get('/send-mail', [UserController::class, 'SendMail']);
Route::post('/messages', [MessagesController::class, 'store']);
Route::get('evenements', [EvenementsController::class, 'GetEvents']);
Route::post("evenement/{id}", [EvenementsController::class, 'DetailEvent']);
Route::get('/actualites', [ActualitesController::class, 'GetActualites']);
Route::post('/actualite/{id}', [ActualitesController::class, 'DetailActualite']);

