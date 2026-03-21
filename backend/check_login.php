<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

$email = 'admin@example.com';
$password = 'secret1234';

echo "Checking login for $email with password '$password'\n";

$user = User::where('email', $email)->first();
if (! $user) {
    echo "User not found\n";
    exit(1);
}

echo "User id: {$user->id}\n";
echo "Stored password hash: {$user->password}\n";
try {
    $ok = Auth::attempt(['email' => $email, 'password' => $password]);
    echo "Auth::attempt returned: " . ($ok ? 'true' : 'false') . "\n";
} catch (Exception $e) {
    echo "Auth::attempt threw: " . $e->getMessage() . "\n";
}

// If attempt failed, replace password directly in DB and retry
if (!Auth::check()) {
    echo "Attempt failed — resetting password via DB update to ensure single hash...\n";
    DB::table('users')->where('email', $email)->update(['password' => Hash::make($password)]);
    $user = User::where('email', $email)->first();
    echo "New stored password hash: {$user->password}\n";
    $ok2 = Auth::attempt(['email' => $email, 'password' => $password]);
    echo "Auth::attempt after reset: " . ($ok2 ? 'true' : 'false') . "\n";
}

// show roles if available
if (method_exists($user, 'getRoleNames')) {
    echo "Roles: " . implode(',', $user->getRoleNames()->toArray()) . "\n";
}

echo "Done.\n";
