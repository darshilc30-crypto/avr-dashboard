import React, { useState } from 'react'
export default function Login(){
  const [email,setEmail]=useState('')
  const [otp,setOtp]=useState('')
  const [sent,setSent]=useState(false)
  async function sendOtp(){
    if(!email) return alert('Enter email')
    await fetch('/api/auth/send-otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})})
    setSent(true)
    alert('OTP sent (check logs or email)')
  }
  async function verify(){
    const res = await fetch('/api/auth/verify-otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,otp})})
    const data = await res.json()
    if(data.token){ localStorage.setItem('service:token', data.token); window.location.href='/' }
    else alert('Invalid')
  }
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='w-full max-w-md p-6 bg-avrCard rounded-2xl'>
        <img src='/assets/avr-technology-high-resolution-logo-transparent.png' alt='logo' className='h-12 mb-4'/>
        <h2 className='text-xl mb-3'>Sign in</h2>
        <input value={email} onChange={e=>setEmail(e.target.value)} className='w-full p-2 mb-2 bg-gray-700 rounded' placeholder='email' />
        <button onClick={sendOtp} className='w-full p-2 mb-3 bg-avrYellow text-black rounded'>Send OTP</button>
        {sent && <>
          <input value={otp} onChange={e=>setOtp(e.target.value)} className='w-full p-2 mb-2 bg-gray-700 rounded' placeholder='OTP' />
          <button onClick={verify} className='w-full p-2 bg-avrBlue rounded'>Verify</button>
        </>}
      </div>
    </div>
  )
}
