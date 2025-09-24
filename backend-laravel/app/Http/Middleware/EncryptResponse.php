<?php

namespace App\Http\Middleware;

use App\Libraries\Encryption;
use Closure;

class EncryptResponse
{
    protected $encryption;

    public function __construct(Encryption $encryption)
    {
        $this->encryption = $encryption;
    }

    public function handle($request, Closure $next)
    {
        $response = $next($request);

        if ($response->isSuccessful() && str_contains($response->headers->get('Content-Type'), 'application/json')) {            
            if (config('app.env') === 'local' && !$request->has('force_encrypt')) {
                return $response;
            }

            $content = $response->getContent();
            $encrypted = $this->encryption->encrypt('data=' . $content);
            
            $response->setContent(json_encode([
                'status' => true,
                'encData' => $encrypted
            ]));
        }

        return $response;
    }
}
