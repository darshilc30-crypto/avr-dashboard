import React, { useEffect, useState } from 'react'
import TechnicianCard from '../components/TechnicianCard'
export default function Technicians(){
  const [techs,setTechs]=useState([])
  useEffect(()=>{ fetchTechs() },[])
  async function fetchTechs(){ const token=localStorage.getItem('service:token'); const res=await fetch('/api/technicians',{headers:{Authorization:`Bearer ${token}`}}); const data=await res.json().catch(()=>[]); setTechs(data || []) }
  return (
    <div className='p-6 min-h-screen'>
      <h1 className='text-2xl mb-4'>Technicians</h1>
      <div className='grid grid-cols-3 gap-4'>
        {techs.map(t=> <TechnicianCard key={t.id} tech={t} />)}
      </div>
    </div>
  )
}
