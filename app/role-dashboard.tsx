'use client';

type Role = 'tenant' | 'landlord' | 'agent';
type RecordRow = Record<string, unknown>;
type Props = {
  role: Role;
  properties: RecordRow[];
  tenancies: RecordRow[];
  viewings: RecordRow[];
  userId: string;
  navigate: (page: string) => void;
  addProperty: () => void;
  addTenancy: () => void;
  addViewing: () => void;
};

const text = (value: unknown) => String(value ?? '');
const money = (minor: number) => new Intl.NumberFormat('en-MY', {style:'currency',currency:'MYR',maximumFractionDigits:0}).format(minor/100);

function Tile({title,value,detail,onClick}: {title:string;value:string|number;detail:string;onClick?:()=>void}) {
  const content = <><span className="dashboard-tile-title">{title}</span><strong>{value}</strong><span className="dashboard-tile-detail">{detail}</span></>;
  return onClick ? <button className="dashboard-tile dashboard-tile-action" onClick={onClick}>{content}<span className="dashboard-tile-arrow" aria-hidden="true">→</span></button> : <div className="dashboard-tile">{content}</div>;
}

export default function RoleDashboard({role,properties,tenancies,viewings,userId,navigate,addProperty,addTenancy,addViewing}:Props){
  const confirmed = tenancies.filter(t=>t.status==='mutually_confirmed');
  const awaiting = tenancies.filter(t=>t.status==='invitation_sent');
  const ownViewings = viewings.filter(v=>v.agent_id===userId);
  const awaitingViewing = ownViewings.filter(v=>v.status==='reported');
  const clientCount = new Set(ownViewings.map(v=>text(v.tenant_id))).size;
  const current = confirmed.find(t=>new Date(text(t.start_date))<=new Date() && new Date(text(t.end_date))>=new Date());
  const upcoming = confirmed.filter(t=>new Date(text(t.start_date))>new Date()).sort((a,b)=>text(a.start_date).localeCompare(text(b.start_date)))[0];
  const scheduledRent = confirmed.filter(t=>new Date(text(t.start_date))<=new Date() && new Date(text(t.end_date))>=new Date()).reduce((sum,t)=>sum+Number(t.rent_minor||0),0);

  if(role==='landlord') return <section className="role-dashboard" aria-label="Landlord summary">
    <div className="role-dashboard-heading"><div><span className="overline">YOUR RENTAL OVERVIEW</span><h2>Everything in one place</h2><p>See your properties, tenancy records and items that need a response.</p></div><button className="secondary" onClick={addProperty}>Add property</button></div>
    <div className="dashboard-tile-grid">
      <Tile title="Properties" value={properties.length} detail="Properties on your account" onClick={()=>navigate('Properties')}/>
      <Tile title="Current tenancies" value={confirmed.length} detail="Mutually confirmed records" onClick={()=>navigate('Tenancies')}/>
      <Tile title="Rent due" value={scheduledRent?money(scheduledRent):'—'} detail="Scheduled rent this month; payment status is not recorded"/>
      <Tile title="Pending confirmations" value={awaiting.length} detail="Invitations awaiting a tenant" onClick={()=>navigate('Tenancies')}/>
      <Tile title="Maintenance issues" value="—" detail="No maintenance records are available"/>
      <Tile title="Rental history & reviews" value={tenancies.length} detail="Tenancy records; reviews are not recorded" onClick={()=>navigate('Tenancies')}/>
    </div>
    {!properties.length&&<button className="primary" onClick={addProperty}>Register your first property</button>}
    {properties.length>0&&!tenancies.length&&<button className="primary" onClick={addTenancy}>Create a tenancy</button>}
  </section>;

  if(role==='tenant') return <section className="role-dashboard" aria-label="Tenant summary">
    <div className="role-dashboard-heading"><div><span className="overline">YOUR RENTAL OVERVIEW</span><h2>Your home, at a glance</h2><p>Keep the details you have confirmed close at hand.</p></div></div>
    <div className="dashboard-tile-grid">
      <Tile title="Current rental" value={current?text(current.label):upcoming?'Not yet started':'None confirmed'} detail={current?'Your active tenancy':upcoming?`${text(upcoming.label)} starts ${new Date(text(upcoming.start_date)).toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'})}`:'Review an invitation to confirm a tenancy'} onClick={()=>navigate('Tenancies')}/>
      <Tile title="Property information" value={current?text(current.label):'—'} detail={current?text(current.address).replace(/^Fictional unit · /,''):'No current property record'} onClick={()=>navigate('Tenancies')}/>
      <Tile title="Payments" value="—" detail="No payment record is available"/>
      <Tile title="Maintenance" value="—" detail="No maintenance record is available"/>
      <Tile title="Agreements" value={confirmed.length} detail="Confirmed tenancies with private documents" onClick={()=>navigate('Agreements')}/>
      <Tile title="Rental Trust Passport" value="—" detail="No rental history has been shared"/>
    </div>
  </section>;

  return <section className="role-dashboard" aria-label="Agent summary">
    <div className="role-dashboard-heading"><div><span className="overline">YOUR AGENT OVERVIEW</span><h2>Stay close to every viewing</h2><p>Your clients and viewing responses are visible only within your account.</p></div><button className="secondary" onClick={properties.length?addViewing:addProperty}>{properties.length?'Record viewing':'Add property'}</button></div>
    <div className="dashboard-tile-grid">
      <Tile title="Clients" value={clientCount} detail="People in your viewing records" onClick={()=>navigate('Viewings')}/>
      <Tile title="Properties" value={properties.length} detail="Properties you own or manage" onClick={()=>navigate('Properties')}/>
      <Tile title="Upcoming viewings" value="—" detail="No scheduled viewing records are available"/>
      <Tile title="Pending confirmations" value={awaitingViewing.length} detail="Viewing records awaiting a tenant" onClick={()=>navigate('Viewings')}/>
      <Tile title="Viewing history" value={ownViewings.length} detail="Visits you have recorded" onClick={()=>navigate('Viewings')}/>
      <Tile title="Follow-up tasks" value={awaitingViewing.length} detail="Viewing responses to check" onClick={()=>navigate('Viewings')}/>
    </div>
  </section>;
}
