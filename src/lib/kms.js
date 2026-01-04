// lib/kms.js - AWS KMS encryption/decryption utility
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';

// Initialize KMS client
const kmsClient = new KMSClient({
  region: process.env.AWS_REGION || 'eu-west-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Encrypt a plaintext string using AWS KMS
 * @param {string} plaintext - The string to encrypt
 * @returns {Promise<string>} Base64-encoded encrypted data
 */
export async function encryptWithKMS(plaintext) {
  if (!process.env.AWS_KMS_KEY_ID) {
    throw new Error('AWS_KMS_KEY_ID environment variable is required');
  }

  try {
    const command = new EncryptCommand({
      KeyId: process.env.AWS_KMS_KEY_ID,
      Plaintext: Buffer.from(plaintext, 'utf-8'),
    });

    const response = await kmsClient.send(command);

    // Return base64-encoded ciphertext
    return Buffer.from(response.CiphertextBlob).toString('base64');
  } catch (error) {
    console.error('KMS Encryption Error:', error);
    throw new Error(`Failed to encrypt data: ${error.message}`);
  }
}

/**
 * Decrypt a base64-encoded encrypted string using AWS KMS
 * @param {string} encryptedData - Base64-encoded encrypted data
 * @returns {Promise<string>} Decrypted plaintext string
 */
export async function decryptWithKMS(encryptedData) {
  if (!encryptedData) {
    throw new Error('Encrypted data is required for decryption');
  }

  try {
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedData, 'base64'),
    });

    const response = await kmsClient.send(command);

    // Return decrypted plaintext
    return Buffer.from(response.Plaintext).toString('utf-8');
  } catch (error) {
    console.error('KMS Decryption Error:', error);
    throw new Error(`Failed to decrypt data: ${error.message}`);
  }
}

/**
 * Get decrypted MongoDB URI from environment variable
 * @param {string} envVarName - Name of the environment variable containing encrypted URI
 * @returns {Promise<string>} Decrypted MongoDB URI
 */
export async function getDecryptedMongoURI(envVarName = 'ENCRYPTED_MONGODB_URI') {
  const encryptedURI = process.env[envVarName];

  if (!encryptedURI) {
    throw new Error(`${envVarName} environment variable not found`);
  }

  // Check if already decrypted (for backward compatibility during migration)
  if (encryptedURI.startsWith('mongodb://') || encryptedURI.startsWith('mongodb+srv://')) {
    console.warn(`Warning: ${envVarName} appears to be unencrypted. Please encrypt it for security.`);
    return encryptedURI;
  }

  return await decryptWithKMS(encryptedURI);
}
