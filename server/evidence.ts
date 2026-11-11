import {createHash,randomUUID} from 'node:crypto';
import {z} from 'zod';
import {DomainError} from './domain';
import type {DatabasePort,QueryPort} from './db';

const uuid=z.string().uuid();
const uploadInput=z.object({
 kind:z.enum(['agreement','stamp_evidence','supporting']),
 filename:z.string().trim().min(1).max(120).regex(/^[a-zA-Z0-9][a-zA-Z0-9 _().-]*$/,'Use a simple filename without folders or special characters'),
 contentBase64:z.string().min(4).max(2796204),
 relatedAgreementId:uuid.optional(),
 syntheticOnly:z.literal(true)
}).strict();
const relation=`(t.creator_id=$2 OR EXISTS(SELECT 1 FROM participants p WHERE p.tenancy_id=t.id AND p.user_id=$2))`;
export class EvidenceService{
 constructor(private db:DatabasePort){}
 private async authorize(tx:QueryPort,actor:string,tid:string,lock=false){
  const t=(await tx.query(`SELECT t.id,t.status FROM tenancies t WHERE t.id=$1 AND ${relation}${lock?' FOR UPDATE OF t':''}`,[tid,actor])).rows[0];
  if(!t)throw new DomainError(404,'Tenancy not available');
  if(t.status!=='mutually_confirmed')throw new DomainError(409,'Confirm the tenancy with the other party before adding shared evidence');
 }
 async list(actor:string,tid:string){
  uuid.parse(tid);await this.authorize(this.db,actor,tid);
  const docs=(await this.db.query(`SELECT d.id,d.tenancy_id,d.uploader_id,d.kind,d.version,d.related_agreement_id,d.filename,d.mime_type,d.byte_size,d.sha256,d.file_state,d.created_at,u.name uploader_name FROM tenancy_documents d JOIN auth_user u ON u.id=d.uploader_id WHERE d.tenancy_id=$1 ORDER BY d.created_at DESC,d.version DESC`,[tid])).rows;
  const responses=(await this.db.query(`SELECT r.id,r.document_id,r.user_id,r.response,r.note,r.created_at,u.name responder_name FROM document_responses r JOIN tenancy_documents d ON d.id=r.document_id JOIN auth_user u ON u.id=r.user_id WHERE d.tenancy_id=$1 ORDER BY r.created_at DESC,r.id`,[tid])).rows;
  return {documents:docs,responses};
 }
 async upload(actor:string,tid:string,body:unknown){
  uuid.parse(tid);const x=uploadInput.parse(body);
  const bytes=Buffer.from(x.contentBase64,'base64');
  if(!bytes.length||bytes.length>2097152||bytes.toString('base64')!==x.contentBase64)throw new DomainError(422,'Use a valid file up to 2 MB');
  const pdf=x.filename.toLowerCase().endsWith('.pdf');
  if(!pdf&&!x.filename.toLowerCase().endsWith('.txt'))throw new DomainError(422,'Only fictional .txt and .pdf evidence is accepted');
  if(pdf&&!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))throw new DomainError(422,'The file does not have a PDF header');
  if(!pdf){try{const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text))throw new Error('control bytes')}catch{throw new DomainError(422,'Text evidence must be plain UTF-8 without binary content')}}
  if(x.kind==='stamp_evidence'&&!x.relatedAgreementId)throw new DomainError(422,'Choose the agreement version this evidence relates to');
  if(x.kind!=='stamp_evidence'&&x.relatedAgreementId)throw new DomainError(422,'Only stamping evidence can be paired with an agreement');
  const digest=createHash('sha256').update(bytes).digest('hex');
  return this.db.transaction(async tx=>{
   await this.authorize(tx,actor,tid,true);
   if(x.relatedAgreementId&&!(await tx.query("SELECT id FROM tenancy_documents WHERE id=$1 AND tenancy_id=$2 AND kind='agreement'",[x.relatedAgreementId,tid])).rows.length)throw new DomainError(404,'Agreement version not available for this tenancy');
   if((await tx.query('SELECT id FROM tenancy_documents WHERE tenancy_id=$1 AND kind=$2 AND sha256=$3',[tid,x.kind,digest])).rows.length)throw new DomainError(409,'This file is already saved in this evidence category');
   const total=Number((await tx.query('SELECT COALESCE(sum(byte_size),0) bytes FROM tenancy_documents WHERE tenancy_id=$1',[tid])).rows[0].bytes);
   if(total+bytes.length>20*1024*1024)throw new DomainError(409,'This local tenancy has reached its 20 MB evidence limit');
   const version=Number((await tx.query('SELECT COALESCE(max(version),0)+1 version FROM tenancy_documents WHERE tenancy_id=$1 AND kind=$2',[tid,x.kind])).rows[0].version);
   const did=randomUUID();await tx.query('INSERT INTO tenancy_documents(id,tenancy_id,uploader_id,kind,version,related_agreement_id,filename,mime_type,byte_size,sha256,content_base64,file_state) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',[did,tid,actor,x.kind,version,x.relatedAgreementId||null,x.filename,pdf?'application/pdf':'text/plain',bytes.length,digest,x.contentBase64,pdf?'quarantined':'text_only']);
   await tx.query('INSERT INTO events(id,tenancy_id,actor_id,action,detail) VALUES($1,$2,$3,$4,$5)',[randomUUID(),tid,actor,'Evidence version saved',`${x.kind.replace('_',' ')} v${version}. ${pdf?'PDF quarantined pending a scanning service.':'Synthetic plain-text evidence.'} No signature or official stamping verified.`]);
   return {id:did,version,fileState:pdf?'quarantined':'text_only'};
  });
 }
 async download(actor:string,did:string){
  uuid.parse(did);
  const d=(await this.db.query(`SELECT d.* FROM tenancy_documents d JOIN tenancies t ON t.id=d.tenancy_id WHERE d.id=$1 AND ${relation}`,[did,actor])).rows[0];
  if(!d)throw new DomainError(404,'Document not available');
  if(d.file_state!=='text_only')throw new DomainError(409,'PDF is quarantined. A scanning service is required before release');
  return {filename:d.filename,bytes:Buffer.from(d.content_base64,'base64'),sha256:d.sha256};
 }
 async respond(actor:string,did:string,body:unknown){
  uuid.parse(did);const x=z.object({response:z.enum(['received','disputed']),note:z.string().trim().max(500).default('')}).strict().parse(body);
  if(x.response==='disputed'&&!x.note)throw new DomainError(422,'Add a brief explanation so the other party can understand the dispute');
  return this.db.transaction(async tx=>{
   const d=(await tx.query(`SELECT d.* FROM tenancy_documents d JOIN tenancies t ON t.id=d.tenancy_id WHERE d.id=$1 AND ${relation} FOR UPDATE OF d`,[did,actor])).rows[0];
   if(!d)throw new DomainError(404,'Document not available');
   if(d.uploader_id===actor)throw new DomainError(409,'The other party records receipt of your upload');
   if(d.file_state!=='text_only')throw new DomainError(409,'Quarantined files cannot be acknowledged or reviewed');
   const previous=(await tx.query('SELECT response,note FROM document_responses WHERE document_id=$1 AND user_id=$2 ORDER BY created_at DESC LIMIT 1',[did,actor])).rows[0];
   if(previous?.response===x.response&&previous?.note===x.note)return {ok:true,replayed:true};
   await tx.query('INSERT INTO document_responses(id,document_id,user_id,response,note) VALUES($1,$2,$3,$4,$5)',[randomUUID(),did,actor,x.response,x.note]);
   await tx.query('INSERT INTO events(id,tenancy_id,actor_id,action,detail) VALUES($1,$2,$3,$4,$5)',[randomUUID(),d.tenancy_id,actor,x.response==='received'?'Evidence receipt recorded':'Evidence disputed',`${d.kind.replace('_',' ')} v${d.version}. Receipt is not signing, agreement to terms, or official verification.`]);
   return {ok:true};
  });
 }
}
