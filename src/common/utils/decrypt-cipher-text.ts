import * as crypto from 'crypto';
import { CipherAlgorithmEnum } from '../enums';

export default function decryptCipherText(
  encryptedText: string,
  keyString: string,
  ivString: string,
  cipherAlgorithm: CipherAlgorithmEnum,
) {
  const keyBytes = Buffer.from(keyString, 'utf8');
  const ivBytes = Buffer.from(ivString, 'utf8');
  const encryptedBytes = Buffer.from(encryptedText, 'base64');

  const decipher = crypto.createDecipheriv(cipherAlgorithm, keyBytes, ivBytes);
  const decryptedText = Buffer.concat([
    decipher.update(encryptedBytes),
    decipher.final(),
  ]);

  return decryptedText.toString('utf8');
}
