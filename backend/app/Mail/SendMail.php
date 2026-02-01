<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     * 
     * 
     */

    private $message;
    private $NomComplet;

 public function __construct(   string $NomComplet, string $message){
    $this->message = $message;
    $this->NomComplet= $NomComplet;
 }

    /**
     * Get the message envelope.
     */

    public function build(){
        return $this->subject('Message d\'un Membre de la communute')
        ->with(['nom'=>$this->NomComplet,'message'=>$this->message])
        ->view('emails.send-mail');
    }

}
