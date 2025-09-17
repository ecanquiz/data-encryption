<?php

namespace App\Libraries;

class Encryption
{
    protected $encryptMethod = 'AES-256-CBC';

    public function decrypt($encryptedString)
    {

        $json = json_decode(base64_decode($encryptedString), true);

        $salt = hex2bin($json["salt"]);
        $iv = hex2bin($json["iv"]);

        $cipherText = base64_decode($json['ciphertext']);

        $iterations = intval(abs(999));
        if ($iterations <= 0) {
            $iterations = 999;
        }

        $hashKey = hash_pbkdf2('sha512', env('encKey'), $salt, $iterations, (256 / 4));
        unset($iterations, $json, $salt);

        $decrypted = openssl_decrypt($cipherText, $this->encryptMethod, hex2bin($hashKey), OPENSSL_RAW_DATA, $iv);
        unset($cipherText, $hashKey, $iv);


        $decrypted = str_replace('%22', '%27', $decrypted);

        // Reemplaza los '+' por '%2B' (codificación URL de '+')
        $decrypted = str_replace('+', '%2B', $decrypted);

        // Decodifica los caracteres URL a sus correspondientes caracteres especiales
        $decrypted = urldecode($decrypted);

        // Decodifica los caracteres HTML antes de usar parse_str
        $decrypted = htmlspecialchars_decode($decrypted, ENT_QUOTES);

        // Analiza la cadena de consulta y conviértela en variables PHP
        parse_str($decrypted, $outcome);

        return $outcome;
    }

    public function directDecrypt($encryptedString)
    {

        $json = json_decode(base64_decode($encryptedString), true);

        $salt = hex2bin($json["salt"]);
        $iv = hex2bin($json["iv"]);

        $cipherText = base64_decode($json['ciphertext']);

        $iterations = intval(abs(999));
        if ($iterations <= 0) {
            $iterations = 999;
        }

        $hashKey = hash_pbkdf2('sha512', env('encKey'), $salt, $iterations, (256 / 4));
        unset($iterations, $json, $salt);

        $decrypted = openssl_decrypt($cipherText, $this->encryptMethod, hex2bin($hashKey), OPENSSL_RAW_DATA, $iv);
        unset($cipherText, $hashKey, $iv);


        $decrypted = str_replace('%22', '%27', $decrypted);

        // Reemplaza los '+' por '%2B' (codificación URL de '+')
        $decrypted = str_replace('+', '%2B', $decrypted);

        // Decodifica los caracteres URL a sus correspondientes caracteres especiales
        $decrypted = urldecode($decrypted);

        // Decodifica los caracteres HTML antes de usar parse_str
        $decrypted = htmlspecialchars_decode($decrypted, ENT_QUOTES);

        return json_decode($decrypted);
    }

    public function stringDecrypt($encryptedString)
    {
        $json = json_decode(base64_decode($encryptedString), true);

        $salt = hex2bin($json["salt"]);
        $iv = hex2bin($json["iv"]);

        $cipherText = base64_decode($json['ciphertext']);

        $iterations = intval(abs(999));
        if ($iterations <= 0) {
            $iterations = 999;
        }

        $hashKey = hash_pbkdf2('sha512', env('encKey'), $salt, $iterations, (256 / 4));
        unset($iterations, $json, $salt);

        $decrypted = openssl_decrypt($cipherText, $this->encryptMethod, hex2bin($hashKey), OPENSSL_RAW_DATA, $iv);
        unset($cipherText, $hashKey, $iv);

        return $decrypted;
    }

    public function replace_double_quotes_in_json($json) {
        $array = json_decode($json, true);
    
        // Reemplaza comillas dobles por comillas simples en cada valor
        array_walk_recursive($array, function (&$value) {
            if (is_string($value)) {
                $value = str_replace('"', "'", $value);
            }
        });
    
        return json_encode($array, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public function encrypt($string)
    {
        if (false){
            parse_str($string, $result);
            return json_encode($result); 
        }

        $ivLength = openssl_cipher_iv_length($this->encryptMethod);
        $iv = openssl_random_pseudo_bytes($ivLength);

        $salt = openssl_random_pseudo_bytes(256);
        $iterations = 999;
        $hashKey = hash_pbkdf2('sha512', env('encKey'), $salt, $iterations, (256 / 4));

        $encryptedString = openssl_encrypt($string, $this->encryptMethod, hex2bin($hashKey), OPENSSL_RAW_DATA, $iv);

        $encryptedString = base64_encode($encryptedString);
        unset($hashKey);

        $output = ['ciphertext' => $encryptedString, 'iv' => bin2hex($iv), 'salt' => bin2hex($salt), 'iterations' => $iterations];
        unset($encryptedString, $iterations, $iv, $ivLength, $salt);

        return base64_encode(json_encode($output));
    }

    public function decryptFile($encryptedFileContent)
    {
        $json = json_decode(base64_decode($encryptedFileContent), true);
    
        if (!$json || !isset($json["salt"], $json["iv"], $json["ciphertext"])) {
            throw new \Exception('Contenido encriptado inválido.');
        }
    
        $salt = hex2bin($json["salt"]);
        $iv = hex2bin($json["iv"]);
        $cipherText = base64_decode($json['ciphertext']);
    
        $hashKey = hash_pbkdf2('sha512', env('encKey'), $salt, 999, (256 / 4));
        $decrypted = openssl_decrypt($cipherText, $this->encryptMethod, hex2bin($hashKey), OPENSSL_RAW_DATA, $iv);
    
        if ($decrypted === false) {
            throw new \Exception('Desencriptación fallida.');
        }
    
        // Crear un archivo temporal
        $tempFile = tempnam(sys_get_temp_dir(), 'decrypted_');
        file_put_contents($tempFile, $decrypted);
    
        // Obtener el tipo MIME usando finfo_file
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $tempFile);
        finfo_close($finfo);
    
        // Eliminar el archivo temporal
        unlink($tempFile);
    
        $fileType = '';
        if ($mimeType === 'image/png') {
            $fileType = 'png';
        } elseif ($mimeType === 'image/jpeg') {
            $fileType = 'jpg';
        } elseif ($mimeType === 'application/pdf') {
            $fileType = 'pdf';
        } else {
            throw new \Exception('Tipo de archivo no soportado: ' . $mimeType);
        }
    
        // Generar un nombre aleatorio para el archivo
        $randomName = uniqid('file_', true);

        $outputPath = "$_ENV[PATH_TO_SAVE_FILES]public/uploads/documents/$randomName.$fileType";
        //$outputPath = '/home/lysto/public_html/0/api/v1/adm/public/uploads/documents/' . $randomName . '.' . $fileType;
        //$outputPath = '/Users/davidsoto/projects/lysto/david/lysto-admin-api/public/uploads/documents/' . $randomName . '.' . $fileType;

        //die($outputPath);
        // Guardar el contenido desencriptado en el archivo
        file_put_contents($outputPath, $decrypted);
    
        return $randomName . '.' . $fileType;
    }

    protected function encryptMethodLength()
    {
        $number = filter_var($this->encryptMethod, FILTER_SANITIZE_NUMBER_INT);

        return intval(abs($number));
    }

    public function arrToQryStr(array $arr = []): string
    {
        $queryString = '';

        foreach ($arr as $key => $value) {
            $queryString .= ($queryString === '')
                ? $key . '=' . $value
                : '&' . $key . '=' . $value;
        }
        
        return $this->encrypt($queryString);
    }

}
