// Opt-in check against a dedicated PostgreSQL test database. No default database is used.
import {Pool} from 'pg';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {openPostgres} from '../server/db';
import {RentalService} from '../server/domain';
const url=process.env.RENTAL_TEST_DATABASE_URL;
if(!url)throw new Error('Set RENTAL_TEST_DATABASE_URL to a dedicated test database. No connection attempted.');
const schema='rental_test_'+randomBytes(8).toString('hex');
const admin=new Pool({connectionString:url});let db:Awaited<ReturnType<typeof openPostgres>>|undefined;
try{
 await admin.query(`CREATE SCHEMA ${schema}`);
 const scoped=new URL(url);scoped.searchParams.set('options',`-c search_path=${schema}`);
 db=await openPostgres(scoped.toString());const s=new RentalService(db.pg,'http://localhost:5199');
 await db.pg.query("INSERT INTO auth_user(id,name,email,email_verified,created_at,updated_at) VALUES('m','Test Manager','pg-manager@example.invalid',true,now(),now()),('t','Test Tenant','pg-tenant@example.invalid',true,now(),now())");
 await s.selectRole('m',{role:'landlord'});await s.selectRole('m',{role:'tenant'});
 const p=await s.createProperty('m',{label:'Postgres Test',address:'Synthetic only',kind:'Apartment',role:'owner'});
 const t=await s.createTenancy('m',{propertyId:p.id,startDate:'2027-01-01',endDate:'2027-12-31',rent:2000});
 const i=await s.invite('m',t.id,{email:'pg-tenant@example.invalid'});
 const link=(await db.pg.query('SELECT link FROM mail LIMIT 1')).rows[0].link;
 await s.respond({id:'t',email:'pg-tenant@example.invalid',emailVerified:true},i.id,{token:new URL(link).hash.slice(1),decision:'accept'});
 assert.equal((await s.dashboard({id:'m',email:'pg-manager@example.invalid'})).roles.length,2);
 assert.equal((await s.dashboard({id:'t',email:'pg-tenant@example.invalid'})).tenancies[0].status,'mutually_confirmed');
 await db.pg.close();db=undefined;
 db=await openPostgres(scoped.toString());assert.equal((await db.pg.query('SELECT * FROM tenancies')).rows.length,1);
 console.log('Standard PostgreSQL migrations, dual roles, invitation acceptance and reconnection passed.');
}finally{
 if(db)await db.pg.close();
 // Only the randomized schema created above is removed; never the supplied database or pre-existing schemas.
 await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);await admin.end();
}
