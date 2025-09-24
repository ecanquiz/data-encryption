<?php
// app/Http/Middleware/DecryptRequest.php

namespace App\Http\Middleware;

use App\Libraries\Encryption;
use Closure;

class DecryptRequest
{
    protected $encryption;

    public function __construct(Encryption $encryption)
    {
        $this->encryption = $encryption;
    }

    public function handle($request, Closure $next)
    {
        // Solo desencriptar si viene encData en POST/PUT/PATCH
        if (in_array($request->method(), ['POST', 'PUT', 'PATCH']) && $request->has('encData')) {
            
            // En desarrollo, opcionalmente no desencriptar
            if (config('app.env') === 'local' && !$request->has('force_decrypt')) {
                return $next($request);
            }

            try {
                $decrypted = $this->encryption->decrypt($request->encData);
                $data = json_decode($decrypted['data'], true);
                
                // Reemplazar los datos del request
                $request->replace($data);
                
            } catch (\Exception $e) {
                \Log::error('Decryption error: ' . $e->getMessage());
                return response()->json(['error' => 'Invalid encrypted data'], 400);
            }
        }

        return $next($request);
    }
}