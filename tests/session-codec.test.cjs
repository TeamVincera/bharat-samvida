require('./helpers/register-typescript.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {sealSession,openSession}=require('../lib/session-codec.ts');
test('Stored tender text is encrypted and bound to the anonymous token',()=>{
 const token=crypto.randomBytes(32).toString('hex'),value={draft:'private procurement detail'};
 const sealed=sealSession(value,token);assert.ok(!sealed.includes(value.draft));assert.deepEqual(openSession(sealed,token),value);
 assert.throws(()=>openSession(sealed,crypto.randomBytes(32).toString('hex')));
 const modified=Buffer.from(sealed,'base64');modified[30]^=1;assert.throws(()=>openSession(modified.toString('base64'),token));
});
