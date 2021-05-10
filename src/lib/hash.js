import { randomBytes, pbkdf2Sync } from 'crypto';

// Use these for passwords.
const hash = ({ text }) => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(text, salt, 2048, 32, 'sha512').toString('hex');
  return [salt, hash].join('$');
}

const verifyHash = ({ text, original }) => {
  const originalHash = original.split('$')[1];
  const salt = original.split('$')[0];
  const hash = pbkdf2Sync(text, salt, 2048, 32, 'sha512').toString('hex');
  return hash === originalHash;
}

export { hash, verifyHash };
