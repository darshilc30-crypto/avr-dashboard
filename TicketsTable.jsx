import React from 'react'
export default function TicketsTable({ tickets, onRefresh }){
  async function completeJob(jobId){
    const token = localStorage.getItem('service:token')
    await fetch(`/api/jobs/${jobId}/update`,{method:'POST',headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},body: JSON.stringify({status:'completed'})})
    if(onRefresh) onRefresh()
  }
  return (
    <div className='bg-avrCard rounded p-4'>
      <table className='w-full text-left'>
        <thead><tr><th>Id</th><th>Customer</th><th>Model</th><th>Status</th><th>Assigned</th><th>Actions</th></tr></thead>
        <tbody>
          {tickets.map(t=>(
            <tr key={t.id} className='border-t border-gray-700'>
              <td className='py-2'>{t.id.slice(0,8)}</td>
              <td>{t.customer_name}</td>
              <td>{t.tv_model}</td>
              <td>{t.status}</td>
              <td>{t.assigned_to}</td>
              <td>{t.assigned_to && <button onClick={()=>completeJob(t.id)} className='px-2 py-1 bg-avrAqua text-black rounded'>Mark Done</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
