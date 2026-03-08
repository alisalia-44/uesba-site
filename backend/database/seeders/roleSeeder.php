<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class roleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
                Role::firstOrCreate(['name' => 'Admin','guard_name'=>'web']);
        Role::firstOrCreate(['name' => 'SuperAdmin','guard_name'=>'web']);
        Role::firstOrCreate(['name' => 'utilisateur','guard_name'=>'web']);

        //
    }
}
