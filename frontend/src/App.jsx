import React, { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import HeroPage from './pages/HeroPage.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import Navbar from './pages/Navbar.jsx'
import EngineerDashboard from './pages/EngineerDashboard.jsx'
import Profile from './pages/profile.jsx'

const appRouter =createBrowserRouter([
  {
    path:'/',
    element:<HeroPage />
  },
  {path:'/profile',
  element:<Profile />
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
    {/* <RouterProvider router = {appRouter}/> */}
    <UserDashboard />
    {/* <Navbar /> */}
    </>
  )
}

export default App