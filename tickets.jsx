import React, { useState, useEffect } from 'react'
import TicketsTable from '../components/TicketsTable'
export default function TicketsPage(){
  const [query,setQuery]=useState(''); const [status,setStatus]=useState(''); const [tickets,setTickets]=useState([])
  useEffect(()=>{ fetchTickets() },[])
  async function fetchTickets(){ const token=localStorage.getItem('service:token'); const qs=new URLSearchParams({ q:query, status, limit:50 }).toString(); const res=await fetch(`/api/tickets?${qs}`,{headers:{Authorization:`Bearer ${token}`}}); const data=await res.json().catch(()=>[]); setTickets(data || []) }
  return (
    <div className='p-6 min-h-screen'>
      <h1 className='text-2xl mb-4'>Tickets</h1>
      <div className='mb-4 flex gap-2'>
        <input placeholder='Search' value={query} onChange={e=>setQuery(e.target.value)} className='p-2 bg-gray-800 rounded' />
        <select value={status} onChange={e=>setStatus(e.target.value)} className='p-2 bg-gray-800 rounded'><option value=''>All</option><option value='open'>Open</option><option value='in_progress'>In Progress</option><option value='closed'>Closed</option></select>
        <button onClick={fetchTickets} className='p-2 bg-avrYellow text-black rounded'>Search</button>
      </div>
      <TicketsTable tickets={tickets} onRefresh={fetchTickets} />
    </div>
  )
}
