import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {openDatabase} from '../server/db';
import {RentalService} from '../server/domain';
import {PropertyVerificationService} from '../server/property-verification';

let db:Awaited<ReturnType<typeof openDatabase>>,domain:RentalService,svc:PropertyVerificationService,path:string;
before(async()=>{path=await mkdtemp(join(tmpdir(),'property-review-'));db=await openDatabase(path);domain=new RentalService(db.pg,'http://localhost:5199');svc=new PropertyVerificationService(db.pg);for(const u of ['owner','reviewer','other'])await db.pg.query('INSERT INTO auth_user(id,name,email,email_verified,created_at,updated_at) VALUES($1,$1,$2,true,now(),now())',[u,`${u}@example.invalid`]);await db.pg.query("INSERT INTO reviewer_grants(user_id) VALUES('reviewer')")});
after(async()=>{await db.pg.close();await rm(path,{recursive:true,force:true})});
test('claim stays unverified through evidence submission and allows separate reviewer checks',async()=>{
 const p=await domain.createProperty('owner',{label:'Test apartment',address:'12 Jalan Ampang, Kuala Lumpur',kind:'Apartment',role:'owner'});
 await assert.rejects(()=>svc.submit('owner',p.id),/reviewable document/);
 await assert.rejects(()=>svc.details('other',p.id),/Reviewer access/);
 await assert.rejects(()=>svc.decide('owner',p.id,{checkType:'ownership',decision:'verified',reason:'Reviewed land title'}),/Reviewer access/);
 const text=Buffer.from('Synthetic title evidence for test property.').toString('base64');
 await svc.uploadEvidence('owner',p.id,{category:'land_title',filename:'title.txt',contentBase64:text,syntheticOnly:true});
 assert.equal((await svc.details('owner',p.id)).claim.review_status,'not_started');
 assert.equal((await svc.submit('owner',p.id)).status,'submitted');
 assert.equal((await svc.details('reviewer',p.id)).claim.ownership_status,'not_started');
 assert.equal((await svc.decide('reviewer',p.id,{checkType:'ownership',decision:'verified',reason:'Synthetic title reviewed for this test'})).status,'verified');
 // Ownership alone does not grant authority or publication.
 assert.equal((await db.pg.query('SELECT status FROM claims WHERE property_id=$1',[p.id])).rows[0].status,'unverified');
 await svc.decide('reviewer',p.id,{checkType:'rental_authority',decision:'verified',reason:'Synthetic owner authority reviewed'});
 assert.equal((await db.pg.query('SELECT status FROM claims WHERE property_id=$1',[p.id])).rows[0].status,'verified');
 assert.equal((await svc.details('owner',p.id)).claim.identity_status,'not_started');
 await assert.rejects(()=>domain.changeListingStatus('owner',p.id,{status:'published'}),/not available|Google Maps/);
 const evidenceId=(await svc.details('owner',p.id)).evidence[0].id;
 await assert.rejects(()=>svc.evidenceBytes('other',evidenceId),/Reviewer access/);
});
test('photo bytes and actions are private and persist',async()=>{const p=await domain.createProperty('owner',{label:'Photo apartment',address:'13 Jalan Ampang, Kuala Lumpur',kind:'Apartment',role:'property_manager'});const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/lXcAAAAASUVORK5CYII=','base64').toString('base64');const photo=await svc.uploadPhoto('owner',p.id,{filename:'room.png',roomArea:'Living room',contentBase64:png,syntheticOnly:true});assert.equal((await svc.details('owner',p.id)).photos[0].is_cover,true);await assert.rejects(()=>svc.photoBytes('other',photo.id),/Reviewer access/);await svc.photoAction('owner',photo.id,{action:'stale'});assert.equal((await svc.details('owner',p.id)).photos[0].is_current,false);await svc.photoAction('owner',photo.id,{action:'remove'});assert.equal((await svc.details('owner',p.id)).photos.length,0)});
test('agent relationship requires matching evidence and keeps correction history after reopen',async()=>{const p=await domain.createProperty('owner',{label:'Agent apartment',address:'14 Jalan Ampang, Kuala Lumpur',kind:'Apartment',role:'registered_agent'});const text=Buffer.from('Synthetic agent registration details for local testing').toString('base64');await svc.uploadEvidence('owner',p.id,{category:'agent_registration',filename:'agent.txt',contentBase64:text,syntheticOnly:true});await svc.submit('owner',p.id);await assert.rejects(()=>svc.decide('reviewer',p.id,{checkType:'identity',decision:'verified',reason:'No identity source available'}),/separate identity/);await svc.decide('reviewer',p.id,{checkType:'rental_authority',decision:'more_information_required',reason:'Owner authorization is missing'});assert.equal((await svc.details('owner',p.id)).claim.review_status,'more_information_required');await db.pg.close();db=await openDatabase(path);domain=new RentalService(db.pg,'http://localhost:5199');svc=new PropertyVerificationService(db.pg);assert.equal((await svc.details('owner',p.id)).decisions[0].reason,'Owner authorization is missing');await assert.rejects(()=>svc.uploadEvidence('other',p.id,{category:'owner_authorization',filename:'owner.txt',contentBase64:text,syntheticOnly:true}),/not available/);});
