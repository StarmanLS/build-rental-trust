import express from 'express';
import {toNodeHandler,fromNodeHeaders} from 'better-auth/node';
import type {createAuth} from './auth';
import type {DatabasePort} from './db';
import {RentalService,DomainError} from './domain';
import {EvidenceService} from './evidence';
import {HandoverService} from './handover';
import {ZodError} from 'zod';

// Shared by the local Nest bootstrap and isolated real-HTTP tests.
export function mountApi(server:express.Express,pg:DatabasePort,auth:ReturnType<typeof createAuth>,baseURL:string){
 const port=new URL(baseURL).port;
 const service=new RentalService(pg,baseURL),evidence=new EvidenceService(pg),handover=new HandoverService(pg);
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
 if(req.path==='/local-mail'&&req.method==='GET')return res.json((await pg.query('SELECT id,recipient,subject,link,created_at FROM mail ORDER BY created_at DESC LIMIT 50')).rows);
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
server.use('/api/v1',(err:any,req:any,res:any,next:any)=>{if(err?.type==='entity.too.large')return res.status(413).json({message:'File request is too large. Use a file up to 2 MB.'});if(err?.type==='charset.unsupported'||err?.type==='encoding.unsupported')return res.status(415).json({message:'Unsupported request encoding. Use UTF-8 JSON.'});if(err instanceof SyntaxError||err?.type==='entity.parse.failed')return res.status(400).json({message:'Invalid request body'});console.error('API middleware failed',err instanceof Error?err.name:'error');return res.status(500).json({message:'Unable to process request'});});
}
