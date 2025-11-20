import React, { useState } from 'react'
export default function TicketForm({ onCreated }){
  const [customerName,setCustomerName]=useState(''); const [phone,setPhone]=useState(''); const [tvModel,setTvModel]=useState(''); const [issueSummary,setIssueSummary]=useState(''); const [description,setDescription]=useState('')
  async function submit(){
    const token=localStorage.getItem('service:token')
    const res=await fetch('/api/tickets',{method:'POST',headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},body:JSON.stringify({customerName,phone,tvModel,issueSummary,description})})
    if(res.status===201){ alert('Ticket created'); setCustomerName(''); setPhone(''); setTvModel(''); setIssueSummary(''); setDescription(''); if(onCreated) onCreated() } else { alert('Failed') }
  }
  return (
    <div className='p-4 bg-avrCard rounded'>
      <h3 className='mb-3'>Create Ticket</h3>
      <input className='w-full p-2 mb-2 bg-gray-700 rounded' value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder='Customer name' />
      <input className='w-full p-2 mb-2 bg-gray-700 rounded' value={phone} onChange={e=>setPhone(e.target.value)} placeholder='Phone' />
      <input className='w-full p-2 mb-2 bg-gray-700 rounded' value={tvModel} onChange={e=>setTvModel(e.target.value)} placeholder='TV model' />
      <input className='w-full p-2 mb-2 bg-gray-700 rounded' value={issueSummary} onChange={e=>setIssueSummary(e.target.value)} placeholder='Issue summary' />
      <textarea className='w-full p-2 mb-2 bg-gray-700 rounded' value={description} onChange={e=>setDescription(e.target.value)} placeholder='Description' />
      <button onClick={submit} className='w-full p-2 bg-avrYellow text-black rounded'>Create Ticket</button>
    </div>
  )
}
