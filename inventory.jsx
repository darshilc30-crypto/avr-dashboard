import React, { useEffect, useState } from 'react'
import InventoryForm from '../components/InventoryForm'
export default function Inventory(){
  const [items,setItems]=useState([]); const [editing,setEditing]=useState(null)
  useEffect(()=>{ fetchItems() },[])
  async function fetchItems(){ const token=localStorage.getItem('service:token'); const res=await fetch('/api/inventory',{headers:{Authorization:`Bearer ${token}`}}); const data=await res.json().catch(()=>[]); setItems(data||[]) }
  return (
    <div className='p-6 min-h-screen'>
      <h1 className='text-2xl mb-4'>Inventory</h1>
      <div className='grid grid-cols-3 gap-4'>
        <div className='p-4 bg-avrCard rounded col-span-1'>
          <h3 className='mb-2'>Add / Edit</h3>
          <InventoryForm item={editing} onSaved={()=>{ setEditing(null); fetchItems() }} />
        </div>
        <div className='col-span-2'>
          <div className='grid grid-cols-2 gap-2'>
            {items.map(it=>(
              <div key={it.id} className='p-3 bg-gray-800 rounded'>
                <div className='font-semibold'>{it.item_name}</div>
                <div>Qty: {it.quantity}</div>
                <div>Category: {it.category}</div>
                <button onClick={()=>setEditing(it)} className='mt-2 p-2 bg-avrYellow text-black rounded'>Edit</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
