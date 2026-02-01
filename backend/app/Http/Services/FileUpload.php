<?php

namespace App\Http\Services;

use Illuminate\Support\Str;

class FileUpload
{

    protected function UploadFile($file, $folderName)
    {
        $maxzize = 10 * 1024 * 1024;

        if ($file->getSize() > $maxzize) {
            return false;
        }

        $extension = $file->getClientOriginalExtension();


        $name = 'uesba_' . time() . '_' . Str::random(8) . '.' . $extension;

        $file->storeAs($folderName, $name, 'public');

        return $name;
    }
}