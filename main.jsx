import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles.css'
import Login from './pages/login'
import Dashboard from './pages/index'
import Tickets from './pages/tickets'
import Technicians from './pages/technicians'
import Inventory from './pages/inventory'
import Track from './pages/track'
import TrackVerify from './pages/track/verify'
import TrackStatus from './pages/track/status'
import MobileApp from './mobile/tech-app'

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Dashboard/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/tickets' element={<Tickets/>} />
        <Route path='/technicians' element={<Technicians/>} />
        <Route path='/inventory' element={<Inventory/>} />
        <Route path='/track' element={<Track/>} />
        <Route path='/track/verify' element={<TrackVerify/>} />
        <Route path='/track/status' element={<TrackStatus/>} />
        <Route path='/mobile' element={<MobileApp/>} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
