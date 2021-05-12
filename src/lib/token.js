import { randomBytes } from 'crypto';

const getToken = () => randomBytes(32).toString('hex');

export { getToken };
