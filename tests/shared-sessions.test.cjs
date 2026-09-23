require('./helpers/register-typescript.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),Module=require('node:module');
test('Encrypted shared sessions survive a cold worker, enforce expiry and support deletion',async()=>{
 const records=new Map(),originalLoad=Module._load,originalStorage=process.env.SESSION_STORAGE;
 const backend={set:async(k,v,o)=>records.set(k,{value:v,metadata:o.metadata}),get:async k=>records.get(k)?.value??null,delete:async k=>records.delete(k)};
 Module._load=function(name,...args){return name==='@netlify/blobs'?{getStore:()=>backend}:originalLoad.call(this,name,...args)};
 process.env.SESSION_STORAGE='netlify';
 try {
  let sessions=require('../lib/sessions.ts');const {token,sessionId}=await sessions.createSession();
  let value=await sessions.validateSessionToken(token);value.drafts['draft-test']={draftId:'draft-test',brief:'Private tender',redactedBrief:'Private tender',revision:1,answers:{}};
  await sessions.saveSession(value,token);assert.ok(!records.get(sessionId).value.includes('Private tender'));
  delete require.cache[require.resolve('../lib/sessions.ts')];sessions=require('../lib/sessions.ts');
  value=await sessions.validateSessionToken(token);assert.equal(value.drafts['draft-test'].brief,'Private tender');
  assert.equal(await sessions.validateSessionToken('bad'),null);
  value.lastActiveAt=Date.now()-31*60*1000;await sessions.saveSession(value,token);
  assert.equal(await sessions.validateSessionToken(token),null);assert.equal(records.has(sessionId),false);
  const fresh=await sessions.createSession();await sessions.deleteSession(fresh.token);assert.equal(await sessions.validateSessionToken(fresh.token),null);
 }finally{Module._load=originalLoad;if(originalStorage===undefined)delete process.env.SESSION_STORAGE;else process.env.SESSION_STORAGE=originalStorage;}
});
