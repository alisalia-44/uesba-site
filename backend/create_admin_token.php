<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use App\Models\User;
use Spatie\Permission\Models\Role;

$email = 'admin@example.com';
$password = 'secret1234';
$name = 'Admin';

$user = User::where('email', $email)->first();
if (! $user) {
    $user = new User();
    $user->name = $name;
    $user->email = $email;
    if (Schema::hasColumn('users', 'prenom')) {
        $user->prenom = 'Admin';
    }
    $user->password = bcrypt($password);
    // set is_admin if column exists
    if (Schema::hasColumn('users', 'is_admin')) {
        $user->is_admin = 1;
    }
    $user->save();
    // ensure Admin role exists and assign it
    if (class_exists(Role::class)) {
        $role = Role::firstOrCreate(['name' => 'Admin']);
        $user->assignRole($role);
    }
} else {
    // ensure admin flag if possible
    if (Schema::hasColumn('users', 'is_admin') && ! $user->is_admin) {
        $user->is_admin = 1;
        $user->save();
    }
    // ensure role assigned on existing user
    if (class_exists(Role::class) && ! $user->hasRole('Admin')) {
        $role = Role::firstOrCreate(['name' => 'Admin']);
        $user->assignRole($role);
    }
}

$token = $user->createToken('api-token')->plainTextToken;
echo "TOKEN:" . $token . PHP_EOL;
echo "EMAIL:" . $email . PHP_EOL;
echo "PASSWORD:" . $password . PHP_EOL;
