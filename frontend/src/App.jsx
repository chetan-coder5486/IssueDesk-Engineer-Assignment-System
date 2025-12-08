<<<<<<< HEAD
import React, { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import HeroPage from './pages/HeroPage.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import Navbar from './pages/Navbar.jsx'
import EngineerDashboard from './pages/EngineerDashboard.jsx'
import Profile from './pages/profile.jsx'
=======
import React, { useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
  Outlet,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import HeroPage from "./pages/HeroPage.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import EngineerDashboard from "./pages/EngineerDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { forceLogout } from "./store/authSlice.js";

// Root layout component that handles auth events
function RootLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
>>>>>>> 7c01899ac1d92fbcde89a5161671e366185d2b0b

  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch(forceLogout());
      navigate("/login");
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [dispatch, navigate]);

  return <Outlet />;
}

const appRouter = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HeroPage />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/user-dashboard",
        element: <UserDashboard />,
      },
      {
        path: "/engineer-dashboard",
        element: <EngineerDashboard />,
      },
      {
        path: "/admin-dashboard",
        element: <AdminDashboard />,
      },
    ],
  },
<<<<<<< HEAD
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
      <RouterProvider router={appRouter} />
    </>
  );
}

export default App;
