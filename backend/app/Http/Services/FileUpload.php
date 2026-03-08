<?php

namespace App\Http\Services;

use Illuminate\Support\Str;

class FileUpload
{

    public function UploadFile($file, $folderName)
    {
        if (!$file) {
            return null;
        }

        $maxsize = 10 * 1024 * 1024;

        if ($file->getSize() > $maxsize) {
            return false;
        }

        $extension = $file->getClientOriginalExtension();

        $name = 'uesba_' . time() . '_' . Str::random(8) . '.' . $extension;

        $file->storeAs($folderName, $name, 'public');

        return $name;
    }

    // public function DeleteFile($file, $folderName)
    // {
    // }
}