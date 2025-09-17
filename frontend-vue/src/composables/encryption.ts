// @ts-nocheck
export function useEncryption() {
  const encryptMethod = "AES-CBC";

  async function decrypt(encryptedString) {
    try {
      const json = JSON.parse(atob(encryptedString));

      const salt = hexStringToArrayBuffer(json.salt);
      const iv = hexStringToArrayBuffer(json.iv);
      const encrypted = base64StringToArrayBuffer(json.ciphertext);

      // Usar la misma clave que en PHP (desde environment)
      const password = import.meta.env.VITE_ENCKEY || import.meta.env.ENCKEY;
      
      const hashKey = await deriveKey(password, salt);

      const decrypted = await window.crypto.subtle.decrypt(
        { 
          name: encryptMethod, 
          iv: new Uint8Array(iv)
        },
        hashKey,
        new Uint8Array(encrypted)
      );

      let outcome = new TextDecoder().decode(decrypted);
      
      // Procesamiento similar al de PHP
      outcome = outcome.replace(/%22/g, '%27');
      outcome = outcome.replace(/\+/g, '%2B');
      outcome = decodeURIComponent(outcome);
      outcome = outcome.replace(/&quot;/g, '"').replace(/&#039;/g, "'");
      
      return parseQueryString(outcome);
    } catch (error) {
      console.error('Decryption error:', error);
      throw error;
    }
  }

  function parseQueryString(queryString) {
    const params = {};
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
      }
    }
    
    return params;
  }

  async function encrypt(string) {
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const salt = window.crypto.getRandomValues(new Uint8Array(256));
    const password = import.meta.env.VITE_ENCKEY || import.meta.env.ENCKEY;

    const hashKey = await deriveKey(password, salt);

    const encrypted = await window.crypto.subtle.encrypt(
      { 
        name: encryptMethod, 
        iv: iv 
      },
      hashKey,
      new TextEncoder().encode(string)
    );

    const output = {
      ciphertext: arrayBufferToBase64String(encrypted),
      iv: arrayBufferToHexString(iv),
      salt: arrayBufferToHexString(salt),
      iterations: 999
    };

    return btoa(JSON.stringify(output));
  }

  // Helper functions
  function hexStringToArrayBuffer(hexString) {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return bytes;
  }

  function arrayBufferToHexString(arrayBuffer) {
    return Array.from(new Uint8Array(arrayBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function base64StringToArrayBuffer(base64String) {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  function arrayBufferToBase64String(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async function deriveKey(password, salt) {
    // Convertir password a ArrayBuffer
    const passwordBuffer = new TextEncoder().encode(password);
    
    // Importar la clave base
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    // Derivar la clave usando PBKDF2
    return await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 999,
        hash: "SHA-512"
      },
      baseKey,
      {
        name: "AES-CBC",
        length: 256
      },
      true,
      ["encrypt", "decrypt"]
    );
  }

  async function decryptJson(encryptedString) {
  try {
    const json = JSON.parse(atob(encryptedString));

    const salt = hexStringToArrayBuffer(json.salt);
    const iv = hexStringToArrayBuffer(json.iv);
    const encrypted = base64StringToArrayBuffer(json.ciphertext);

    const password = import.meta.env.VITE_ENCKEY || import.meta.env.ENCKEY;
    
    const hashKey = await deriveKey(password, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { 
        name: encryptMethod, 
        iv: new Uint8Array(iv)
      },
      hashKey,
      new Uint8Array(encrypted)
    );

    const outcome = new TextDecoder().decode(decrypted);
    
    // Parsear directamente como JSON
    return JSON.parse(outcome);
    
  } catch (error) {
    console.error('JSON Decryption error:', error);
    throw error;
  }
}

  return { decrypt, encrypt, decryptJson };
}

