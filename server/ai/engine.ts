/** Provider-neutral contract. No model or external data transfer is configured in M1.1. */
export type AiCapability =
  | 'document_extract' | 'agreement_explain' | 'photo_items' | 'key_count'
  | 'maintenance_classify' | 'conversation_summary' | 'payment_extract'
  | 'property_match' | 'rental_history_summary' | 'trust_map_summary'
  | 'review_moderate' | 'record_inconsistency' | 'viewing_follow_up';

export type EvidenceKind =
  | 'identity' | 'property' | 'ownership_claim' | 'tenancy' | 'agreement_version'
  | 'payment_event' | 'maintenance_request' | 'viewing' | 'handover'
  | 'review' | 'dispute' | 'communication' | 'sharing_grant';

export type EvidenceRef = {kind:EvidenceKind; id:string; recordedAt?:string};
export type AiRequest = {
  actorId:string;
  capability:AiCapability;
  scopeId:string;
  evidence:EvidenceRef[];
  consentGrantId?:string;
};
export type AiSuggestion = {
  text:string;
  evidence:EvidenceRef[];
  confidence:'low'|'medium'|'high';
  limitations:string[];
  modelId:string;
  createdAt:string;
  reviewState:'needs_human_review';
};
export type AiOutcome =
  | {status:'unavailable'; reason:'provider_not_configured'}
  | {status:'failed'; reason:'provider_error'|'invalid_evidence'|'invalid_result'|'consent_required'}
  | {status:'suggested'; suggestion:AiSuggestion};
export type AiProvider = {suggest(request:AiRequest):Promise<Omit<AiSuggestion,'reviewState'>>};
export type AiPermission = (actorId:string, scopeId:string, evidence:EvidenceRef)=>Promise<boolean>;

/** Authorizes each source before any provider call and rejects unsupported model claims. */
export class RentalTrustAiEngine {
  constructor(private readonly authorize:AiPermission, private readonly provider?:AiProvider){}
  async suggest(request:AiRequest):Promise<AiOutcome>{
    if(!this.provider)return {status:'unavailable',reason:'provider_not_configured'};
    if(!request.actorId||!request.scopeId||!request.evidence.length)return {status:'failed',reason:'invalid_result'};
    if(request.evidence.some(ref=>['identity','payment_event','communication','sharing_grant'].includes(ref.kind))&&!request.consentGrantId)return {status:'failed',reason:'consent_required'};
    for(const ref of request.evidence){
      if(!ref.id||!await this.authorize(request.actorId,request.scopeId,ref))return {status:'failed',reason:'invalid_evidence'};
    }
    try{
      const result=await this.provider.suggest(request);
      if(!result.text.trim()||!result.modelId.trim()||!Number.isFinite(Date.parse(result.createdAt))||!['low','medium','high'].includes(result.confidence))return {status:'failed',reason:'invalid_result'};
      const allowed=new Set(request.evidence.map(ref=>`${ref.kind}:${ref.id}`));
      if(result.evidence.some(ref=>!allowed.has(`${ref.kind}:${ref.id}`)))return {status:'failed',reason:'invalid_evidence'};
      return {status:'suggested',suggestion:{...result,reviewState:'needs_human_review'}};
    }catch{return {status:'failed',reason:'provider_error'}}
  }
}
