<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $email = 'admin@example.com';
        $password = 'secret123';

        if (User::where('email', $email)->exists()) {
            $this->command->info("Admin user {$email} already exists.");
            return;
        }

        // Ensure the Admin role exists (Spatie permissions)
        Role::firstOrCreate(['name' => 'Admin']);

        $user = User::create([
            'name' => 'Admin',
            'prenom' => 'Admin',
            'email' => $email,
            'password' => Hash::make($password),
        ]);

        // Assign Admin role
        $user->assignRole('Admin');

        $this->command->info("Created admin user and assigned Admin role: {$email} / {$password}");
    }
}
