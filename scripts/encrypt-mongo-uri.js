// scripts/encrypt-mongo-uri.js - Script to encrypt MongoDB URIs using AWS KMS
import { KMSClient, EncryptCommand } from '@aws-sdk/client-kms';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function encryptURI() {
  try {
    console.log('\n🔐 MongoDB URI Encryption Tool\n');

    // Get AWS credentials and config
    const awsRegion = await question('AWS Region (default: eu-west-1): ') || 'eu-west-1';
    const awsAccessKeyId = await question('AWS Access Key ID: ');
    const awsSecretAccessKey = await question('AWS Secret Access Key: ');
    const kmsKeyId = await question('AWS KMS Key ID (ARN or alias): ');

    console.log('\n📝 Enter MongoDB URIs to encrypt:\n');
    const mongoUri1 = await question('MONGODB_URI (primary): ');
    const mongoUri2 = await question('MONGODB_URI2 (secondary, press Enter to skip): ');

    // Initialize KMS client
    const kmsClient = new KMSClient({
      region: awsRegion,
      credentials: {
        accessKeyId: awsAccessKeyId,
        secretAccessKey: awsSecretAccessKey,
      },
    });

    console.log('\n🔄 Encrypting URIs...\n');

    // Encrypt primary URI
    if (mongoUri1) {
      const command1 = new EncryptCommand({
        KeyId: kmsKeyId,
        Plaintext: Buffer.from(mongoUri1, 'utf-8'),
      });
      const response1 = await kmsClient.send(command1);
      const encrypted1 = Buffer.from(response1.CiphertextBlob).toString('base64');

      console.log('✅ Primary URI encrypted successfully:');
      console.log(`ENCRYPTED_MONGODB_URI=${encrypted1}\n`);
    }

    // Encrypt secondary URI
    if (mongoUri2) {
      const command2 = new EncryptCommand({
        KeyId: kmsKeyId,
        Plaintext: Buffer.from(mongoUri2, 'utf-8'),
      });
      const response2 = await kmsClient.send(command2);
      const encrypted2 = Buffer.from(response2.CiphertextBlob).toString('base64');

      console.log('✅ Secondary URI encrypted successfully:');
      console.log(`ENCRYPTED_MONGODB_URI2=${encrypted2}\n`);
    }

    console.log('📋 Add these to your .env.local file and add the following AWS config:');
    console.log(`AWS_REGION=${awsRegion}`);
    console.log(`AWS_ACCESS_KEY_ID=${awsAccessKeyId}`);
    console.log(`AWS_SECRET_ACCESS_KEY=${awsSecretAccessKey}`);
    console.log(`AWS_KMS_KEY_ID=${kmsKeyId}\n`);

    console.log('⚠️  IMPORTANT: After adding encrypted URIs, remove the plain MONGODB_URI and MONGODB_URI2 variables!\n');
  } catch (error) {
    console.error('❌ Encryption failed:', error.message);
  } finally {
    rl.close();
  }
}

encryptURI();
