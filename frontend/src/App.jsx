import React, { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import HeroPage from './pages/HeroPage.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import EngineerDashboard from './pages/EngineerDashboard.jsx'

const appRouter =createBrowserRouter([
  {
    path:'/',
    element:<HeroPage />
  },
  {
    path:'/login',
    element:<Login />
  },
  {
    path:'/signup',
    element:<Signup />
  },
  {
    path:'/user-dashboard',
    element:<UserDashboard />
  },
  {
    path:'/engineer-dashboard',
    element:<EngineerDashboard />
  }
])

function App() {
  return (
    <>
    <RouterProvider router = {appRouter}/>
    </>
  )
}

export default App