export interface EncryptionResult {
  ciphertext: string;
  iv: string;
  salt: string;
  iterations: number;
}

export interface QueryParams {
  [key: string]: string;
}

export function encryption() {
  const encryptMethod = "AES-CBC";

  async function decrypt(encryptedString: string): Promise<QueryParams> {
    try {
      const json: EncryptionResult = JSON.parse(atob(encryptedString));

      // Create ArrayBuffers directly from strings
      const saltArrayBuffer = hexStringToArrayBuffer(json.salt);
      const ivArrayBuffer = hexStringToArrayBuffer(json.iv);
      const encryptedArrayBuffer = base64StringToArrayBuffer(json.ciphertext);

      const password = import.meta.env.VITE_ENCKEY as string || import.meta.env.ENCKEY as string;
      
      if (!password) {
        throw new Error('Encryption key not found in environment variables');
      }

      const hashKey = await deriveKey(password, new Uint8Array(saltArrayBuffer));

      const decrypted = await window.crypto.subtle.decrypt(
        { 
          name: encryptMethod, 
          iv: ivArrayBuffer
        },
        hashKey,
        encryptedArrayBuffer
      );

      let outcome = new TextDecoder().decode(decrypted);
      
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

  // Helper functions that return ArrayBuffer directly
  function hexStringToArrayBuffer(hexString: string): ArrayBuffer {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
      bytes[i / 2] = parseInt(hexString.substring(i, i + 2), 16);
    }
    return bytes.buffer;
  }

  function base64StringToArrayBuffer(base64String: string): ArrayBuffer {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  function parseQueryString(queryString: string): QueryParams {
    const params: QueryParams = {};
    const pairs = queryString.split('&');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=');
      if (key) {
        params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
      }
    }
    
    return params;
  }

  async function encrypt(string: string): Promise<string> {
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const salt = window.crypto.getRandomValues(new Uint8Array(256));
    const password = import.meta.env.VITE_ENCKEY as string || import.meta.env.ENCKEY as string;

    if (!password) {
      throw new Error('Encryption key not found in environment variables');
    }

    const hashKey = await deriveKey(password, salt);

    const encrypted = await window.crypto.subtle.encrypt(
      { 
        name: encryptMethod, 
        iv: iv.buffer
      },
      hashKey,
      new TextEncoder().encode(string)
    );

    const output: EncryptionResult = {
      ciphertext: arrayBufferToBase64String(encrypted),
      iv: uint8ArrayToHexString(iv),
      salt: uint8ArrayToHexString(salt),
      iterations: 999
    };

    return btoa(JSON.stringify(output));
  }

  function uint8ArrayToHexString(uint8Array: Uint8Array): string {
    return Array.from(uint8Array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function arrayBufferToBase64String(arrayBuffer: ArrayBuffer): string {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const passwordBuffer = new TextEncoder().encode(password);
    
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const saltArrayBuffer = createSafeArrayBuffer(salt);

    return await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltArrayBuffer,
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

  function createSafeArrayBuffer(uint8Array: Uint8Array): ArrayBuffer {
    const newBuffer = new ArrayBuffer(uint8Array.length);
    const newView = new Uint8Array(newBuffer);
    newView.set(uint8Array);
    return newBuffer;
  }

  return { decrypt, encrypt };
}

export type EncryptionFunctions = ReturnType<typeof encryption>;
