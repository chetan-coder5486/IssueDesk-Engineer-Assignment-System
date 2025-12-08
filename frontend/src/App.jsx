import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import HeroPage from "./pages/HeroPage.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import EngineerDashboard from "./pages/EngineerDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

const appRouter = createBrowserRouter([
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
]);

function App() {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
}

export default App;
