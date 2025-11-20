import React, { useEffect, useState } from 'react'
export default function AssignJobForm(){
  const [ticketId,setTicketId]=useState(''); const [technicians,setTechnicians]=useState([]); const [technicianId,setTechnicianId]=useState(''); const [eta,setEta]=useState('')
  useEffect(()=>{ fetchTechs() },[])
  async function fetchTechs(){ const token=localStorage.getItem('service:token'); const res=await fetch('/api/technicians',{headers:{Authorization:`Bearer ${token}`}}); const data=await res.json().catch(()=>[]); setTechnicians(data || []) }
  async function assign(){ const token=localStorage.getItem('service:token'); const res=await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},body:JSON.stringify({ticketId, technicianId, eta})}); if(res.status===201){ alert('Assigned'); setTicketId(''); setTechnicianId(''); setEta('') } else alert('Failed') }
  return (
    <div className='p-4 bg-avrCard rounded'>
      <h3 className='mb-3'>Assign Job</h3>
      <input className='w-full p-2 mb-2 bg-gray-700 rounded' value={ticketId} onChange={e=>setTicketId(e.target.value)} placeholder='Ticket ID' />
      <select className='w-full p-2 mb-2 bg-gray-700 rounded' value={technicianId} onChange={e=>setTechnicianId(e.target.value)}><option value=''>Select Technician</option>{technicians.map(t=>(<option key={t.id} value={t.id}>{t.name}</option>))}</select>
      <input className='w-full p-2 mb-2 bg-gray-700 rounded' value={eta} onChange={e=>setEta(e.target.value)} placeholder='ETA (optional)' />
      <button onClick={assign} className='w-full p-2 bg-avrBlue rounded'>Assign Job</button>
    </div>
  )
}
