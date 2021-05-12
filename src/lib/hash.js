import { randomBytes, pbkdf2Sync } from 'crypto';

// Use these for passwords.
const hash = ({ text }) => {
  const salt = randomBytes(16).toString('hex');
  const hashed = pbkdf2Sync(text, salt, 2048, 32, 'sha512').toString('hex');
  return [salt, hashed].join('$');
};

const verifyHash = ({ text, original }) => {
  const originalHash = original.split('$')[1];
  const salt = original.split('$')[0];
  const hashed = pbkdf2Sync(text, salt, 2048, 32, 'sha512').toString('hex');
  return hashed === originalHash;
};

export { hash, verifyHash };
