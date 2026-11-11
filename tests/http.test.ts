import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {createServer,request as nodeRequest,type Server} from 'node:http';
import type {AddressInfo} from 'node:net';
import {randomBytes,randomUUID} from 'node:crypto';
import express from 'express';
import {openDatabase} from '../server/db';
import {createAuth} from '../server/auth';
import {mountApi} from '../server/api';
import {RentalService} from '../server/domain';
let db:Awaited<ReturnType<typeof openDatabase>>,server:Server,base:string,network:string,tid:string,draftId:string;
let owner:string,tenant:string,other:string,unverified:string;
const cookies:Record<string,string>={};
const password='HttpSyntheticFixture!2026';
async function request(path:string,{actor='owner',method='GET',body,raw,headers={}}:{actor?:string,method?:string,body?:unknown,raw?:string,headers?:Record<string,string>}={}){
 const response=await fetch(network+path,{method,headers:{host:new URL(base).host,origin:base,'x-forwarded-for':`127.0.0.${({owner:10,tenant:11,other:12,unverified:13,none:14} as Record<string,number>)[actor]||15}`,...(cookies[actor]?{cookie:cookies[actor]}:{}),...(body!==undefined||raw!==undefined?{'content-type':'application/json'}:{}),...headers},body:raw!==undefined?raw:body===undefined?undefined:JSON.stringify(body),redirect:'manual',signal:AbortSignal.timeout(10000)});
 return response;
}
const file=(text='FICTIONAL HTTP evidence')=>({kind:'agreement',filename:'fictional.txt',contentBase64:Buffer.from(text).toString('base64'),syntheticOnly:true});
const handover=()=>({phase:'move_in',observedOn:'2026-01-01',syntheticOnly:true,items:[{kind:'condition',label:'Fictional room',condition:'wear',note:'Fictional mark'}]});
async function post(path:string,body:unknown,actor='owner'){return request(path,{method:'POST',body,actor})}
async function addDoc(text:string=randomUUID()){const r=await post(`/api/v1/tenancies/${tid}/documents`,file(text));assert.equal(r.status,201);return r.json()}
async function addHandover(){const r=await post(`/api/v1/tenancies/${tid}/handovers`,handover());assert.equal(r.status,201);const h=await r.json();const list=await (await request(`/api/v1/tenancies/${tid}/handovers`)).json();return list.reports.find((x:any)=>x.id===h.id)}
before(async()=>{
 db=await openDatabase();const app=express();server=createServer(app);
 await new Promise<void>((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',()=>resolve())});
 const port=(server.address() as AddressInfo).port;base=`http://localhost:${port}`;network=`http://127.0.0.1:${port}`;
 const auth=createAuth(db,randomBytes(48).toString('hex'),base);mountApi(app,db.pg,auth,base);
 // Separate synthetic client addresses avoid exhausting Better Auth's sign-in fixture bucket. Rate limits stay enabled.
 for(const name of ['owner','tenant','other','unverified']){
 const r=await post('/api/auth/sign-up/email',{name:`HTTP ${name}`,email:`http-${name}@example.invalid`,password},name);assert.equal(r.status,200);
 // Email verification is fixture setup, not an independent identity check.
 await db.pg.query('UPDATE auth_user SET email_verified=true WHERE email=$1',[`http-${name}@example.invalid`]);
 const login=await post('/api/auth/sign-in/email',{email:`http-${name}@example.invalid`,password},name);assert.equal(login.status,200);cookies[name]=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');assert.ok(cookies[name]);
 }
 const users=(await db.pg.query('SELECT id,email FROM auth_user')).rows;const id=(name:string)=>users.find(u=>u.email===`http-${name}@example.invalid`).id;
 owner=id('owner');tenant=id('tenant');other=id('other');unverified=id('unverified');await db.pg.query('UPDATE auth_user SET email_verified=false WHERE id=$1',[unverified]);
 const svc=new RentalService(db.pg,base);const p=await svc.createProperty(owner,{label:'HTTP fictional unit',address:'Fictional address KL',kind:'Apartment',role:'owner'});
 const terms={propertyId:p.id,startDate:'2026-01-01',endDate:'2027-12-31',rent:2200};tid=(await svc.createTenancy(owner,terms)).id;draftId=(await svc.createTenancy(owner,terms)).id;
 const invite=await svc.invite(owner,tid,{email:'http-tenant@example.invalid'});const mail=(await db.pg.query('SELECT link FROM mail WHERE link LIKE $1',[`%${invite.id}%`])).rows[0];await svc.respond({id:tenant,email:'http-tenant@example.invalid',emailVerified:true},invite.id,{decision:'accept',token:new URL(mail.link).hash.slice(1)});
});
after(async()=>{if(server){server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()))}if(db)await db.pg.close()});

test('HTTP unauthenticated evidence/handover routes require a session',async()=>{
 for(const path of [`/tenancies/${tid}/documents`,`/tenancies/${tid}/handovers`,`/tenancies/${tid}/handover-export`,`/documents/${randomUUID()}/download`]){const r=await request('/api/v1'+path,{actor:'none'});assert.equal(r.status,401);assert.equal(r.headers.get('cache-control'),'no-store')}
 for(const [path,body] of [[`/tenancies/${tid}/documents`,file()],[`/tenancies/${tid}/handovers`,handover()],[`/documents/${randomUUID()}/respond`,{response:'received'}],[`/handovers/${randomUUID()}/respond`,{itemId:randomUUID(),response:'acknowledged'}]] as const)assert.equal((await post('/api/v1'+path,body,'none')).status,401);
});
test('HTTP missing/foreign origin and foreign host cannot mutate records',async()=>{for(const origin of ['', 'https://foreign.example']){const r=await request(`/api/v1/tenancies/${tid}/documents`,{method:'POST',body:file(),headers:{origin}});assert.equal(r.status,403)}const hostStatus=await new Promise<number>((resolve,reject)=>{const req=nodeRequest(network+'/api/v1/dashboard',{headers:{host:'foreign.example',cookie:cookies.owner}},res=>{res.resume();resolve(res.statusCode!)});req.on('error',reject);req.end()});assert.equal(hostStatus,403);assert.equal((await request('/api/v1/dashboard',{headers:{cookie:'better-auth.session_token=forged'}})).status,401)});
test('HTTP unverified session is refused at protected route',async()=>{assert.equal((await request(`/api/v1/tenancies/${tid}/documents`,{actor:'unverified'})).status,403)});
test('HTTP unrelated users cannot list, create, download, respond or export',async()=>{const d=await addDoc(),h=await addHandover();for(const path of [`/tenancies/${tid}/documents`,`/tenancies/${tid}/handovers`,`/tenancies/${tid}/handover-export`,`/documents/${d.id}/download`])assert.equal((await request('/api/v1'+path,{actor:'other'})).status,404);for(const [path,body] of [[`/tenancies/${tid}/documents`,file()],[`/tenancies/${tid}/handovers`,handover()],[`/documents/${d.id}/respond`,{response:'received'}],[`/handovers/${h.id}/respond`,{itemId:h.items[0].id,response:'acknowledged'}]] as const)assert.equal((await post('/api/v1'+path,body,'other')).status,404)});
test('HTTP draft tenancy cannot receive evidence or handover records',async()=>{assert.equal((await post(`/api/v1/tenancies/${draftId}/documents`,file())).status,409);assert.equal((await post(`/api/v1/tenancies/${draftId}/handovers`,handover())).status,409)});
test('HTTP valid upload/list/download preserves bytes and safe headers',async()=>{const content='FICTIONAL HTTP download content';const d=await addDoc(content);const list=await (await request(`/api/v1/tenancies/${tid}/documents`,{actor:'tenant'})).json();assert.ok(list.documents.some((x:any)=>x.id===d.id));assert.ok(list.documents.every((x:any)=>!('content_base64' in x)));const r=await request(`/api/v1/documents/${d.id}/download`,{actor:'tenant'});assert.equal(r.status,200);assert.equal(await r.text(),content);assert.match(r.headers.get('content-disposition')!,/^attachment; filename="fictional.txt"$/);assert.match(r.headers.get('content-type')!,/^text\/plain/);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.equal(r.headers.get('x-frame-options'),'DENY');assert.match(r.headers.get('content-security-policy')!,/sandbox/)});
test('HTTP own-upload response denied; tenant receipt replay has one effect',async()=>{const d=await addDoc();const path=`/api/v1/documents/${d.id}/respond`;assert.equal((await post(path,{response:'received'})).status,409);assert.equal((await post(path,{response:'received'},'tenant')).status,200);const replay=await post(path,{response:'received'},'tenant');assert.equal((await replay.json()).replayed,true);const data=await (await request(`/api/v1/tenancies/${tid}/documents`)).json();assert.equal(data.responses.filter((r:any)=>r.document_id===d.id).length,1)});
test('HTTP PDF quarantine blocks download and acknowledgement',async()=>{const r=await post(`/api/v1/tenancies/${tid}/documents`,{...file('%PDF-1.4\nFictional quarantine fixture'),filename:'fictional.pdf'});assert.equal(r.status,201);const d=await r.json();assert.equal((await request(`/api/v1/documents/${d.id}/download`,{actor:'tenant'})).status,409);assert.equal((await post(`/api/v1/documents/${d.id}/respond`,{response:'received'},'tenant')).status,409)});
test('HTTP handover response binds exact item/version and exports the dispute',async()=>{const a=await addHandover(),b=await addHandover();const path=`/api/v1/handovers/${a.id}/respond`;assert.equal((await post(path,{itemId:a.items[0].id,response:'acknowledged'})).status,409);assert.equal((await post(path,{itemId:b.items[0].id,response:'acknowledged'},'tenant')).status,404);assert.equal((await post(path,{itemId:a.items[0].id,response:'disputed',note:'Fictional disagreement'},'tenant')).status,200);const out=await request(`/api/v1/tenancies/${tid}/handover-export`,{actor:'tenant'});assert.equal(out.status,200);assert.match(out.headers.get('content-disposition')!,/^attachment/);assert.equal(out.headers.get('cache-control'),'no-store');const pack=await out.json();assert.equal(pack.tenancyId,tid);assert.ok(pack.responses.some((r:any)=>r.handover_id===a.id&&r.response==='disputed'));assert.ok(pack.reports.every((r:any)=>r.tenancy_id===tid))});
test('HTTP malformed JSON, oversized body and invalid evidence return bounded errors',async()=>{const path=`/api/v1/tenancies/${tid}/documents`;const malformed=await request(path,{method:'POST',raw:'{"broken":'});assert.equal(malformed.status,400);assert.match(malformed.headers.get('content-type')!,/application\/json/);const oversized=await request(path,{method:'POST',raw:JSON.stringify({value:'x'.repeat(3*1024*1024)})});assert.equal(oversized.status,413);assert.equal((await oversized.json()).message,'File request is too large. Use a file up to 2 MB.');for(const body of [{...file(),filename:'../private.txt'},{...file(),contentBase64:'invalid'},{...file(),syntheticOnly:false},{...file(),verified:true}])assert.equal((await post(path,body)).status,422)});
test('HTTP wrong content type or encoding must not expose an HTML stack trace',async()=>{const r=await request(`/api/v1/tenancies/${tid}/documents`,{method:'POST',raw:'{}',headers:{'content-type':'application/json; charset=madeup'}});assert.equal(r.status,415);assert.match(r.headers.get('content-type')!,/application\/json/);const body=await r.text();assert.doesNotMatch(body,/node_modules|UnsupportedMediaTypeError|<!DOCTYPE/i)});
test('HTTP unknown route and unsupported method cannot mutate',async()=>{assert.equal((await request('/api/v1/not-a-route')).status,404);assert.equal((await request(`/api/v1/tenancies/${tid}/documents`,{method:'DELETE'})).status,404)});
test('HTTP logout invalidates the same session cookie',async()=>{assert.equal((await post('/api/auth/sign-out',{},'other')).status,200);assert.equal((await request(`/api/v1/tenancies/${tid}/documents`,{actor:'other'})).status,401)});
