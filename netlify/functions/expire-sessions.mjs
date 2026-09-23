import {getStore} from '@netlify/blobs';
export default async () => {
  const store=getStore({name:'bharat-sessions-v1',consistency:'strong'});
  for await (const page of store.list({paginate:true})) {
    for(const blob of page.blobs) {
      const entry=await store.getMetadata(blob.key);
      if(entry && Number(entry.metadata.expiresAt)<=Date.now())await store.delete(blob.key);
    }
  }
  return new Response(null,{status:204});
};
export const config={schedule:'*/10 * * * *'};
