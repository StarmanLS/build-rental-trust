import test from 'node:test';
import assert from 'node:assert/strict';
import {RentalTrustAiEngine,type AiRequest,type AiProvider} from '../server/ai/engine';

const request:AiRequest={actorId:'agent-1',capability:'viewing_follow_up',scopeId:'property-1',evidence:[{kind:'viewing',id:'viewing-1'}]};
const valid:AiProvider={suggest:async input=>({text:'Ask the tenant to confirm the recorded viewing.',evidence:input.evidence,confidence:'medium',limitations:['Only one viewing record is available.'],modelId:'provider-model',createdAt:new Date().toISOString()})};

test('AI engine reports unavailable when no provider is configured',async()=>{
 const engine=new RentalTrustAiEngine(async()=>true);
 assert.deepEqual(await engine.suggest(request),{status:'unavailable',reason:'provider_not_configured'});
});
test('AI engine refuses an unauthorized evidence source before provider access',async()=>{
 let called=false;
 const engine=new RentalTrustAiEngine(async()=>false,{suggest:async()=>{called=true;return valid.suggest(request)}});
 assert.deepEqual(await engine.suggest(request),{status:'failed',reason:'invalid_evidence'});
 assert.equal(called,false);
});
test('AI engine rejects invented citations and provider failures',async()=>{
 const invented=new RentalTrustAiEngine(async()=>true,{suggest:async()=>({...await valid.suggest(request),evidence:[{kind:'viewing',id:'invented'}]})});
 assert.deepEqual(await invented.suggest(request),{status:'failed',reason:'invalid_evidence'});
 const failed=new RentalTrustAiEngine(async()=>true,{suggest:async()=>{throw new Error('offline')}});
 assert.deepEqual(await failed.suggest(request),{status:'failed',reason:'provider_error'});
});
test('AI engine requires consent for sensitive source categories',async()=>{
 let called=false;
 const engine=new RentalTrustAiEngine(async()=>true,{suggest:async()=>{called=true;return valid.suggest(request)}});
 assert.deepEqual(await engine.suggest({...request,evidence:[{kind:'payment_event',id:'payment-1'}]}),{status:'failed',reason:'consent_required'});
 assert.equal(called,false);
});
test('AI output remains a human-reviewed suggestion',async()=>{
 const result=await new RentalTrustAiEngine(async()=>true,valid).suggest(request);
 assert.equal(result.status,'suggested');
 if(result.status==='suggested')assert.equal(result.suggestion.reviewState,'needs_human_review');
});
