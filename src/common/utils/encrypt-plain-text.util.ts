import * as crypto from 'crypto';
import { CipherAlgorithmEnum } from '../enums';

export default function encryptPlainText(
  text: string,
  keyString: string,
  ivString: string,
  cipherAlgorithm: CipherAlgorithmEnum,
) {
  const keyBytes = Buffer.from(keyString, 'utf8');
  const ivBytes = Buffer.from(ivString, 'utf8');

  const cipher = crypto.createCipheriv(cipherAlgorithm, keyBytes, ivBytes);
  const encryptedText = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  return encryptedText.toString('base64');
}
