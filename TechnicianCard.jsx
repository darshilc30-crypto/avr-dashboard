import React from 'react'
export default function TechnicianCard({ tech }){
  return (
    <div className='p-4 bg-avrCard rounded'>
      <h3 className='text-lg font-semibold'>{tech.name}</h3>
      <div className='text-sm'>{tech.email}</div>
      <div className='text-sm'>{tech.phone}</div>
      <div className='mt-2 text-xs'>Skills: {tech.skills}</div>
    </div>
  )
}
