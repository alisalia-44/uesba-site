API routes for messages — add these to your project's `routes/api.php`.

// -- Copy into routes/api.php --

use App\Http\Controllers\Api\MessageController;

// Public endpoint to submit a contact message
Route::post('/messages', [MessageController::class, 'store']);

// Admin endpoints (protect with auth middleware in production)
Route::get('/messages', [MessageController::class, 'index']);
Route::delete('/messages/{id}', [MessageController::class, 'destroy']);

// Note: In production wrap GET/DELETE with appropriate auth middleware, e.g.:
// Route::middleware('auth:api')->group(function () {
//     Route::get('/messages', [MessageController::class, 'index']);
//     Route::delete('/messages/{id}', [MessageController::class, 'destroy']);
// });
