import React, { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import Navbar from './pages/Navbar.jsx'

const appRouter =createBrowserRouter([
  {
    path:'/login',
    element:<Login />
  },
  {
    path:'/signup',
    element:<Signup />
  },
  {
    path:'/',
    element:<UserDashboard />
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