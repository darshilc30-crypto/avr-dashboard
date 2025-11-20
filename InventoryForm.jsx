import React, { useState, useEffect } from 'react'
export default function InventoryForm({ item, onSaved }){
  const [itemName,setItemName]=useState(item?.item_name||'')
  const [category,setCategory]=useState(item?.category||'')
  const [quantity,setQuantity]=useState(item?.quantity||0)
  const [location,setLocation]=useState(item?.location||'Main Store')
  const [vendor,setVendor]=useState(item?.vendor||'Default Vendor')
  const [description,setDescription]=useState(item?.description||'')
  async function save(){
    const token=localStorage.getItem('service:token')
    const url = item ? `/api/inventory/${item.id}` : '/api/inventory'
    const method = item ? 'PUT' : 'POST'
    const res=await fetch(url,{method,headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},body: JSON.stringify({ itemName, category, quantity, location, vendor, description })})
    if(res.status===200||res.status===201){ alert('Saved'); if(onSaved) onSaved() } else alert('Failed')
  }
  return (
    <div className='p-4 bg-avrCard rounded'>
      <input className='w-full p-2 mb-2 bg-gray-700 rounded' value={itemName} onChange={e=>setItemName(e.target.value)} placeholder='Item name' />
      <input className='w-full p-2 mb-2 bg-gray-700 rounded' value={category} onChange={e=>setCategory(e.target.value)} placeholder='Category' />
      <input type='number' className='w-full p-2 mb-2 bg-gray-700 rounded' value={quantity} onChange={e=>setQuantity(e.target.value)} placeholder='Quantity' />
      <input className='w-full p-2 mb-2 bg-gray-700 rounded' value={vendor} onChange={e=>setVendor(e.target.value)} placeholder='Vendor' />
      <textarea className='w-full p-2 mb-2 bg-gray-700 rounded' value={description} onChange={e=>setDescription(e.target.value)} placeholder='Description' />
      <button onClick={save} className='w-full p-2 bg-avrBlue rounded'>Save</button>
    </div>
  )
}
