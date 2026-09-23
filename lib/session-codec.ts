import crypto from 'crypto';
const key = (token:string) => crypto.createHash('sha256').update('bharat-session-encryption:'+token).digest();
export function sealSession(value:unknown,token:string) {
  const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key(token),iv);
  const encrypted=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);
  return Buffer.concat([iv,cipher.getAuthTag(),encrypted]).toString('base64');
}
export function openSession(value:string,token:string) {
  const bytes=Buffer.from(value,'base64');
  if(bytes.length<29)throw new Error('Invalid session');
  const decipher=crypto.createDecipheriv('aes-256-gcm',key(token),bytes.subarray(0,12));
  decipher.setAuthTag(bytes.subarray(12,28));
  return JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)),decipher.final()]).toString('utf8'));
}
