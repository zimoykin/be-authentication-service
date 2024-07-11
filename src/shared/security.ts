import * as myCrypto from 'crypto';

export const generateSalt = (length: number): string => {
    return myCrypto.randomBytes(length).toString('hex');
}

export const generateHash = (password: string, salt: string, iterations: number, length: number) => {
    return myCrypto.pbkdf2Sync(password, salt, iterations, length, 'sha512').toString('hex');
}
