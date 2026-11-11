import { PGlite } from '@electric-sql/pglite';
import { drizzle as liteDrizzle } from 'drizzle-orm/pglite';
import { drizzle as nodeDrizzle } from 'drizzle-orm/node-postgres';
import { Pool, type PoolClient } from 'pg';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as schema from './schema';
export interface QueryPort {query(sql:string,params?:any[]):Promise<{rows:any[]}>;exec(sql:string):Promise<unknown>}
export interface DatabasePort extends QueryPort {transaction<T>(fn:(tx:QueryPort)=>Promise<T>):Promise<T>;close():Promise<void>}
function clientPort(client:PoolClient):QueryPort{return {query:async(sql,params)=>(await client.query(sql,params)),exec:async sql=>client.query(sql)}}
export async function migrate(pg:DatabasePort){
 await pg.exec('CREATE TABLE IF NOT EXISTS migrations (version integer PRIMARY KEY, applied_at timestamptz DEFAULT now())');
 // Additive metadata for the first local migration, already applied before file extraction.
 await pg.exec('ALTER TABLE migrations ADD COLUMN IF NOT EXISTS checksum text');
 for(const [version,file] of [[1,'001-foundation.sql'],[2,'002-role-onboarding.sql'],[3,'003-agent-viewings.sql'],[4,'004-tenancy-evidence.sql'],[5,'005-handovers.sql']] as const){
  const sql=await readFile(new URL(`../db/migrations/${file}`,import.meta.url),'utf8');
  const digest=createHash('sha256').update(sql).digest('hex');
  await pg.transaction(async tx=>{
   await tx.exec('LOCK TABLE migrations IN EXCLUSIVE MODE');
   const prior=(await tx.query('SELECT checksum FROM migrations WHERE version=$1',[version])).rows[0];
   if(prior){if(prior.checksum&&prior.checksum!==digest)throw new Error(`Applied migration ${version} has changed`);if(!prior.checksum)await tx.query('UPDATE migrations SET checksum=$1 WHERE version=$2',[digest,version]);return;}
   await tx.exec(sql);await tx.query('INSERT INTO migrations(version,checksum) VALUES($1,$2)',[version,digest]);
  });
 }
}
export async function openDatabase(path?:string){
 const lite=new PGlite(path);const pg:DatabasePort={query:async(s,p)=>lite.query(s,p),exec:s=>lite.exec(s),transaction:fn=>lite.transaction(tx=>fn(tx as QueryPort)),close:()=>lite.close()};
 await migrate(pg);return {pg,orm:liteDrizzle(lite,{schema}),mode:'embedded-postgres' as const};
}
export async function openPostgres(connectionString:string){
 const pool=new Pool({connectionString,max:10,connectionTimeoutMillis:5000});
 const pg:DatabasePort={query:async(s,p)=>pool.query(s,p),exec:s=>pool.query(s),transaction:async fn=>{const c=await pool.connect();try{await c.query('BEGIN');const result=await fn(clientPort(c));await c.query('COMMIT');return result}catch(e){await c.query('ROLLBACK');throw e}finally{c.release()}},close:()=>pool.end()};
 try{await migrate(pg)}catch(e){await pool.end();throw e}
 return {pg,orm:nodeDrizzle(pool,{schema}),mode:'postgres-server' as const};
}
