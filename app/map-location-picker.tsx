'use client';
import {useEffect,useRef,useState} from 'react';

type Choice={placeId:string;address:string;latitude:number;longitude:number};
let scriptPromise:Promise<void>|null=null;
function loadGoogle(key:string){
 if((window as any).google?.maps)return Promise.resolve();
 if(!scriptPromise)scriptPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=`https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async`;script.async=true;script.onload=()=>resolve();script.onerror=()=>{scriptPromise=null;reject(new Error('Map could not load'))};document.head.append(script);
 });return scriptPromise;
}

export default function MapLocationPicker({property,onSaved}:{property:any,onSaved:()=>Promise<unknown>}){
 const mapHost=useRef<HTMLDivElement>(null),searchHost=useRef<HTMLDivElement>(null),marker=useRef<any>(null),map=useRef<any>(null);
 const [available,setAvailable]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [choice,setChoice]=useState<Choice|null>(property.google_place_id&&property.latitude!=null?{placeId:property.google_place_id,address:property.address,latitude:Number(property.latitude),longitude:Number(property.longitude)}:null);
 useEffect(()=>{let active=true;let autocomplete:any=null;let dragListener:any=null;async function init(){
  try{const response=await fetch('/api/v1/maps/config');if(!response.ok)throw new Error('Map configuration unavailable');const config=await response.json();if(!active)return;if(!config.available){setLoading(false);return}await loadGoogle(config.browserKey);if(!active)return;setAvailable(true);setLoading(false);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));if(!active)return;
   const g=(window as any).google;const {Map}=await g.maps.importLibrary('maps');await g.maps.importLibrary('marker');const {PlaceAutocompleteElement}=await g.maps.importLibrary('places');if(!active||!mapHost.current||!searchHost.current)return;
   const center=property.latitude!=null?{lat:Number(property.latitude),lng:Number(property.longitude)}:{lat:3.139,lng:101.687};map.current=new Map(mapHost.current,{center,zoom:property.latitude!=null?17:11,mapTypeControl:false,streetViewControl:false,fullscreenControl:false});
   marker.current=new g.maps.Marker({map:map.current,position:center,draggable:true,visible:property.latitude!=null,title:'Property location pin'});
   dragListener=marker.current.addListener('dragend',()=>{const pos=marker.current.getPosition();setChoice(old=>old?{...old,latitude:pos.lat(),longitude:pos.lng()}:null);setNotice('Pin moved. Confirm the location to save it.');});
   autocomplete=new PlaceAutocompleteElement();searchHost.current.appendChild(autocomplete);
   autocomplete.addEventListener('gmp-select',async(event:any)=>{try{const place=event.placePrediction.toPlace();await place.fetchFields({fields:['id','formattedAddress','location']});if(!place.id||!place.location)throw new Error('Choose a place with a map location');const next={placeId:place.id,address:place.formattedAddress||'',latitude:place.location.lat(),longitude:place.location.lng()};setChoice(next);marker.current.setPosition({lat:next.latitude,lng:next.longitude});marker.current.setVisible(true);map.current.setCenter({lat:next.latitude,lng:next.longitude});map.current.setZoom(17);setNotice('Move the pin if needed, then confirm.');setError('')}catch(e){setError(e instanceof Error?e.message:'Address lookup failed')}});
   setLoading(false);
  }catch(e){if(active){setError(e instanceof Error?e.message:'Map unavailable');setAvailable(false);setLoading(false)}}
 }init();return()=>{active=false;dragListener?.remove();marker.current?.setMap(null);autocomplete?.remove();map.current=null};},[property.id]);
 function move(axis:'latitude'|'longitude',value:string){const n=Number(value);setChoice(old=>old&&Number.isFinite(n)?{...old,[axis]:n}:old);if(choice&&Number.isFinite(n)){const next={lat:axis==='latitude'?n:choice.latitude,lng:axis==='longitude'?n:choice.longitude};marker.current?.setPosition(next);map.current?.setCenter(next)}}
 async function confirm(){if(!choice||busy)return;setBusy(true);setError('');setNotice('');try{const response=await fetch(`/api/v1/properties/${property.id}/location`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({placeId:choice.placeId,latitude:choice.latitude,longitude:choice.longitude,confirmed:true})});const result=await response.json();if(!response.ok)throw new Error(result.message||'Unable to confirm location');await onSaved();setNotice(result.warnings.length?`Location submitted for review: ${result.warnings.join('; ')}.`:'Location submitted. Ownership and rental authority are separate checks.')}catch(e){setError(e instanceof Error?e.message:'Unable to confirm location')}finally{setBusy(false)}}
 return <section className="listing-location" aria-label="Property location"><strong>Property location</strong>{property.latitude!=null&&<p>Saved pin: {Number(property.latitude).toFixed(6)}, {Number(property.longitude).toFixed(6)} · {String(property.location_status).replaceAll('_',' ')}</p>}
  {loading?<p>Opening location search…</p>:!available?<p>Map location selection is currently unavailable. Your listing remains private until a pin can be confirmed.</p>:<><label>Search for the property address</label><div ref={searchHost} className="map-search"/><div ref={mapHost} className="property-map" role="application" aria-label="Google map with draggable property pin"/><p>Drag the pin or adjust the coordinates with the keyboard. The pin identifies a location; it does not verify the exact unit or ownership.</p>{choice&&<><p>Selected place: {choice.address||'Saved place'} · Place ID: {choice.placeId}</p><div className="map-coordinate-row"><label>Latitude<input type="number" min="-90" max="90" step="0.000001" value={choice.latitude} onChange={e=>move('latitude',e.target.value)}/></label><label>Longitude<input type="number" min="-180" max="180" step="0.000001" value={choice.longitude} onChange={e=>move('longitude',e.target.value)}/></label></div><button type="button" className="secondary" onClick={confirm} disabled={busy}>{busy?'Confirming…':'Confirm this location'}</button></>}</>}
  {error&&<p className="listing-error" role="alert">{error}</p>}{notice&&<p className="listing-success" role="status">{notice}</p>}
 </section>;
}
