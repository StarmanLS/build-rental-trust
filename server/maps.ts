export type VerifiedPlace={id:string;formattedAddress:string;latitude:number;longitude:number};
export type PlaceVerifier=(placeId:string)=>Promise<VerifiedPlace>;

export function mapsConfig(){
 const approved=process.env.GOOGLE_MAPS_APPROVED==='1';
 const browserKey=process.env.GOOGLE_MAPS_BROWSER_KEY||'';
 const serverKey=process.env.GOOGLE_PLACES_SERVER_KEY||'';
 return {available:approved&&!!browserKey&&!!serverKey,browserKey:approved&&browserKey&&serverKey?browserKey:''};
}

export const verifyGooglePlace:PlaceVerifier=async placeId=>{
 const {available}=mapsConfig();if(!available)throw new Error('MAPS_NOT_CONFIGURED');
 if(!/^[A-Za-z0-9_-]{8,255}$/.test(placeId))throw new Error('INVALID_PLACE_ID');
 let response:Response;
 try{response=await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,{headers:{'X-Goog-Api-Key':process.env.GOOGLE_PLACES_SERVER_KEY!,'X-Goog-FieldMask':'id,formattedAddress,location'},signal:AbortSignal.timeout(8000)});}catch{throw new Error('PLACES_UNAVAILABLE')}
 if(response.status===404)throw new Error('PLACE_NOT_FOUND');
 if(!response.ok)throw new Error('PLACES_UNAVAILABLE');
 const result=await response.json() as any;
 const latitude=Number(result?.location?.latitude),longitude=Number(result?.location?.longitude);
 if(result?.id!==placeId||typeof result?.formattedAddress!=='string'||!result.formattedAddress||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)throw new Error('INVALID_PLACE_DETAILS');
 return {id:result.id,formattedAddress:result.formattedAddress,latitude,longitude};
};

export function metresBetween(a:{latitude:number;longitude:number},b:{latitude:number;longitude:number}){
 const radians=(n:number)=>n*Math.PI/180;
 const dLat=radians(b.latitude-a.latitude),dLon=radians(b.longitude-a.longitude);
 const h=Math.sin(dLat/2)**2+Math.cos(radians(a.latitude))*Math.cos(radians(b.latitude))*Math.sin(dLon/2)**2;
 return 6371000*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}

export function addressOverlap(entered:string,google:string){
 const words=(s:string)=>new Set(s.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter(w=>!['jalan','street','road','malaysia','kuala','lumpur','selangor','unit','block','tower'].includes(w))||[]);
 const a=words(entered),b=words(google);if(!a.size||!b.size)return false;
 return [...a].some(w=>b.has(w));
}
