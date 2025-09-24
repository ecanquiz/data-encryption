import { encryption } from './encryption';

export function setupEncryptionInterceptor () {
  const { encrypt, decrypt } = encryption();

  // Interceptor to ENCRYPT requests
  const encryptRequest = async (config: any) => {
    // Only encrypt if it is POST/PUT/PATCH and has data
    if (['post', 'put', 'patch'].includes(config.method?.toLowerCase()) && config.data) {
      try {
        // In development, optionally do not encrypt for debugging
        if (import.meta.env.MODE === 'development' && 
            import.meta.env.VITE_DISABLE_ENCRYPTION === 'true') {
          return config;
        }
          
        const encryptedData = await encrypt('data=' + JSON.stringify(config.data));
        config.data = { encData: encryptedData };
      } catch (error) {
        console.error('Encryption error:', error);
      }
    }
    return config;
  };

  // Interceptor to DECRYPT responses
  const decryptResponse = async (response: any) => {
    // Only decrypt if the response has encData
    if (response.data && response.data.encData) {
      try {
        // In development, optionally do not decrypt for debugging
        if (import.meta.env.MODE === 'development' && 
            import.meta.env.VITE_DISABLE_ENCRYPTION === 'true') {
          response.data._debug = 'Encryption disabled in development';
          return response;
        }
          
        const decrypted = await decrypt(response.data.encData);
        response.data = JSON.parse((decrypted as any).data);
      } catch (error: any) {
        console.error('Decryption error:', error);
        // Keep original data for debugging
        response.data._originalEncData = response.data.encData;
        response.data._decryptionError = error.message;
      }
    }
    return response;
  };

  return { encryptRequest, decryptResponse };
};
