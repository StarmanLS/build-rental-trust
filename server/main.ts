import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express from 'express';
import next from 'next';
import { toNodeHandler,fromNodeHeaders } from 'better-auth/node';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { randomBytes,randomUUID } from 'node:crypto';
import { openDatabase,openPostgres } from './db';
import { createAuth } from './auth';
import { RentalService,DomainError } from './domain';
import { HandoverService } from './handover';
import { EvidenceService } from './evidence';
import { ZodError } from 'zod';
if(process.env.NODE_ENV==='production')throw new Error('Synthetic local server cannot run as production.');
const port=Number(process.env.PORT||5199),baseURL=`http://localhost:${port}`;
await mkdir('.local',{recursive:true,mode:0o700});
let secret:string;try{secret=await readFile('.local/auth-secret','utf8')}catch{secret=randomBytes(48).toString('hex');await writeFile('.local/auth-secret',secret,{mode:0o600,flag:'wx'})}
const db=process.env.DATABASE_URL?await openPostgres(process.env.DATABASE_URL):await openDatabase('.local/postgres');const auth=createAuth(db,secret,baseURL);const service=new RentalService(db.pg,baseURL);const evidence=new EvidenceService(db.pg);const handover=new HandoverService(db.pg);
// Explicit synthetic seed: account email verification here is fixture setup, not an identity check.
for(const [name,email] of [['Aina · Test Manager','manager@example.invalid'],['Daniel · Test Tenant','tenant@example.invalid'],['Unrelated · Test User','outsider@example.invalid']]){
 if(!(await db.pg.query('SELECT id FROM auth_user WHERE email=$1',[email])).rows.length){await auth.api.signUpEmail({body:{name,email,password:'LocalRental!2026'}});await db.pg.query('UPDATE auth_user SET email_verified=true WHERE email=$1',[email]);}
}
const manager:any=(await db.pg.query('SELECT id FROM auth_user WHERE email=$1',['manager@example.invalid'])).rows[0];
if(!(await db.pg.query('SELECT id FROM claims WHERE user_id=$1',[manager.id])).rows.length){
 for(const [label,address,kind,rent] of [['Seri Maya · A-12-03','Fictional unit · Setapak, Kuala Lumpur','Condominium',2200],['Damansara · B-08-11','Fictional unit · Petaling Jaya, Selangor','Apartment',1800],['Taman Melati · 18','Fictional unit · Kuala Lumpur','Terrace house',2600]]){
 const p=await service.createProperty(manager.id,{label,address,kind,role:'property_manager'});await service.createTenancy(manager.id,{propertyId:p.id,startDate:'2027-01-01',endDate:'2027-12-31',rent});
 }
}
class Root{};Module({})(Root);
const app=await NestFactory.create(Root,{bodyParser:false,logger:['error','warn']});
const server=app.getHttpAdapter().getInstance();
server.use((req:any,res:any,next:any)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');if(req.path.startsWith('/api/'))res.setHeader('Cache-Control','no-store');if(!['localhost:'+port,'127.0.0.1:'+port].includes(req.headers.host)){res.status(403).json({message:'Local preview only'});return}next();});
// Better Auth receives the original stream, before JSON parsing.
server.use('/api/auth',toNodeHandler(auth));
server.use('/api/v1',express.json({limit:'3mb'}));
const limits=new Map<string,{count:number,until:number}>();
server.use('/api/v1',async(req:any,res:any)=>{
 try{
 const origin=req.headers.origin;
 if(!['GET','HEAD'].includes(req.method)&&origin!==baseURL)throw new DomainError(403,'Request origin is not allowed');
 const key=req.ip+req.path;const now=Date.now();let l=limits.get(key);if(!l||l.until<now){l={count:0,until:now+60000};limits.set(key,l)}if(++l.count>120)throw new DomainError(429,'Too many requests. Try again in one minute.');
 if(req.path==='/health')return res.json({app:'rental-trust-local',synthetic:true});
 // Local mail sink is intentionally operator-visible, contains synthetic mail only, and never exists in a production server.
 if(req.path==='/local-mail'&&req.method==='GET')return res.json((await db.pg.query('SELECT id,recipient,subject,link,created_at FROM mail ORDER BY created_at DESC LIMIT 50')).rows);
 const session=await auth.api.getSession({headers:fromNodeHeaders(req.headers)});
 if(!session)throw new DomainError(401,'Please sign in');
 if(!session.user.email.endsWith('@example.invalid'))throw new DomainError(403,'Use a synthetic @example.invalid account in this preview');
 if(!session.user.emailVerified)throw new DomainError(403,'Verify your email in the local mailbox');
 const user=session.user;
 if(req.path==='/dashboard'&&req.method==='GET')return res.json({...await service.dashboard(user),user});
 if(req.path==='/me/role'&&req.method==='POST')return res.json(await service.selectRole(user.id,req.body));
 if(req.path==='/me/setup'&&req.method==='POST')return res.json(await service.completeSetup(user.id,req.body));
 if(req.path==='/viewings'&&req.method==='POST')return res.status(201).json(await service.recordViewing(user.id,req.body));
 const viewingMatch=req.path.match(/^\/viewings\/([^/]+)\/respond$/);if(viewingMatch&&req.method==='POST')return res.json(await service.respondViewing(user.id,viewingMatch[1],req.body));
 if(req.path==='/properties'&&req.method==='POST')return res.status(201).json(await service.createProperty(user.id,req.body));
 if(req.path==='/tenancies'&&req.method==='POST')return res.status(201).json(await service.createTenancy(user.id,req.body));
 let hm=req.path.match(/^\/tenancies\/([^/]+)\/handovers$/);
 if(hm&&req.method==='GET')return res.json(await handover.list(user.id,hm[1]));
 if(hm&&req.method==='POST')return res.status(201).json(await handover.create(user.id,hm[1],req.body));
 hm=req.path.match(/^\/handovers\/([^/]+)\/respond$/);
 if(hm&&req.method==='POST')return res.json(await handover.respond(user.id,hm[1],req.body));
 hm=req.path.match(/^\/tenancies\/([^/]+)\/handover-export$/);
 if(hm&&req.method==='GET'){const pack=await handover.export(user.id,hm[1]);res.setHeader('Content-Disposition','attachment; filename="fictional-handover-record.json"');return res.json(pack);}
 let em=req.path.match(/^\/tenancies\/([^/]+)\/documents$/);
 if(em&&req.method==='GET')return res.json(await evidence.list(user.id,em[1]));
 if(em&&req.method==='POST')return res.status(201).json(await evidence.upload(user.id,em[1],req.body));
 em=req.path.match(/^\/documents\/([^/]+)\/download$/);
 if(em&&req.method==='GET'){const d=await evidence.download(user.id,em[1]);res.setHeader('Content-Type','text/plain; charset=utf-8');res.setHeader('Content-Disposition',`attachment; filename="${d.filename}"`);res.setHeader('Content-Security-Policy',"sandbox; default-src 'none'");return res.send(d.bytes);}
 em=req.path.match(/^\/documents\/([^/]+)\/respond$/);
 if(em&&req.method==='POST')return res.json(await evidence.respond(user.id,em[1],req.body));
 let m=req.path.match(/^\/tenancies\/([^/]+)\/invite$/);if(m&&req.method==='POST')return res.status(201).json(await service.invite(user.id,m[1],req.body));
 m=req.path.match(/^\/tenancies\/([^/]+)\/revoke$/);if(m&&req.method==='POST')return res.json(await service.revoke(user.id,m[1]));
 m=req.path.match(/^\/invitations\/([^/]+)\/respond$/);if(m&&req.method==='POST')return res.json(await service.respond(user,m[1],req.body));
 throw new DomainError(404,'Page not available');
 }catch(e){if(e instanceof DomainError)return res.status(e.status).json({message:e.message});if(e instanceof ZodError)return res.status(422).json({message:e.issues.map(i=>i.message).join('. ')});console.error('API operation failed',e instanceof Error?e.name:'error');res.status(500).json({message:'Unable to save. Please retry; no success has been assumed.'});}
});
server.use('/api/v1',(err:any,req:any,res:any,next:any)=>{if(err?.type==='entity.too.large')return res.status(413).json({message:'File request is too large. Use a file up to 2 MB.'});if(err instanceof SyntaxError)return res.status(400).json({message:'Invalid request body'});next(err);});
const frontend=next({dev:process.env.PREVIEW_BUILD!=='1',hostname:'localhost',port});await frontend.prepare();server.use((req:any,res:any)=>frontend.getRequestHandler()(req,res));
await app.listen(port,'127.0.0.1');console.log(`Rental Trust local preview: ${baseURL} — synthetic data only`);
async function shutdown(){await app.close();await db.pg.close();process.exit(0)}process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
