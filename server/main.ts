import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import next from 'next';
import { mkdir,readFile,writeFile } from 'node:fs/promises';
import { randomBytes,randomUUID } from 'node:crypto';
import { openDatabase,openPostgres } from './db';
import { createAuth } from './auth';
import { mountApi } from './api';
import { RentalService } from './domain';
if(process.env.NODE_ENV==='production')throw new Error('Synthetic local server cannot run as production.');
const port=Number(process.env.PORT||5199),baseURL=`http://localhost:${port}`;
await mkdir('.local',{recursive:true,mode:0o700});
let secret:string;try{secret=await readFile('.local/auth-secret','utf8')}catch{secret=randomBytes(48).toString('hex');await writeFile('.local/auth-secret',secret,{mode:0o600,flag:'wx'})}
const db=process.env.DATABASE_URL?await openPostgres(process.env.DATABASE_URL):await openDatabase('.local/postgres');const auth=createAuth(db,secret,baseURL);const service=new RentalService(db.pg,baseURL);
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
mountApi(server,db.pg,auth,baseURL);
const frontend=next({dev:process.env.PREVIEW_BUILD!=='1',hostname:'localhost',port});await frontend.prepare();server.use((req:any,res:any)=>frontend.getRequestHandler()(req,res));
await app.listen(port,'127.0.0.1');console.log(`Rental Trust local preview: ${baseURL} — synthetic data only`);
async function shutdown(){await app.close();await db.pg.close();process.exit(0)}process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
