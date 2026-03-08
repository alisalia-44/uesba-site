<?php 
namespace App\Http\Services;

use App\Mail\SendMail;
use Illuminate\Support\Facades\Mail;

class MailService{


  public $email;
  public string $message;
  public string $NomComplet;
    public function __construct(  $email ,  string $message ,  string $NomComplet){
        $this->email=$email;
        $this->message=$message;
        $this->NomComplet=$NomComplet;

    }

    public function Send(){
        return Mail::to(env('usba'))
        ->send( new SendMail($this->NomComplet,$this->message));
    }

}