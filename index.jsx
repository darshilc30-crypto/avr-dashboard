import React, { useEffect, useState } from 'react'
import TicketForm from '../components/TicketForm'
import AssignJobForm from '../components/AssignJobForm'

export default function Dashboard(){
  const [stats,setStats]=useState({total:0,open:0,in_progress:0,closed:0})
  useEffect(()=>{fetchStats()},[])
  async function fetchStats(){
    const token=localStorage.getItem('service:token')
    const res=await fetch('/api/tickets?limit=200',{headers:{Authorization:`Bearer ${token}`}})
    const tickets=await res.json().catch(()=>[])
    const total=tickets.length
    setStats({ total, open: tickets.filter(t=>t.status==='open').length, in_progress: tickets.filter(t=>t.status==='in_progress').length, closed: tickets.filter(t=>t.status==='closed').length })
  }
  return (
    <div className='p-6 min-h-screen'>
      <header className='flex items-center gap-4 mb-6'><img src='/assets/avr-technology-high-resolution-logo-transparent.png' className='h-12'/><h1 className='text-2xl'>AVR Service Dashboard</h1></header>
      <div className='grid grid-cols-3 gap-4 mb-6'>
        <div className='p-4 bg-avrCard rounded'>Total<br/><span className='text-2xl'>{stats.total}</span></div>
        <div className='p-4 bg-avrCard rounded'>Open<br/><span className='text-2xl'>{stats.open}</span></div>
        <div className='p-4 bg-avrCard rounded'>In Progress<br/><span className='text-2xl'>{stats.in_progress}</span></div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <TicketForm onCreated={fetchStats}/>
        <AssignJobForm />
      </div>
    </div>
  )
}
