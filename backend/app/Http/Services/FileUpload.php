<?php

namespace App\Http\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class FileUpload
{
    public function UploadFile($file, $folderName)
    {
        if (!$file) {
            return null;
        }

     
        $maxSize = 10 * 1024 * 1024;

        if ($file->getSize() > $maxSize) {
            return false;
        }

       
        $extension = $file->getClientOriginalExtension();

       
        $name = 'uesba_' . time() . '_' . Str::random(8) . '.' . $extension;

      
        $path = $folderName . '/' . $name;

  
        Storage::disk('public')->putFileAs(
            $folderName,
            $file,
            $name
        );

        return $path;
    }

    public function DeleteFile($path)
    {
        if (!$path) {
            return false;
        }

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }
}