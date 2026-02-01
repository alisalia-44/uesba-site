<?php 
namespace Backend\App\Http\Services;

use App\Mail\SendMail;
use Illuminate\Support\Facades\Mail;

class MailService{

    public function __construct(private string $email , private string $message , private string $NomComplet){}

    public function Send(){
        return Mail::to(env('usba'))->send( new SendMail($this->NomComplet,$this->message));
    }

}