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
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import { forceLogout } from "./store/authSlice.js";
import {
  ProtectedRoute,
  RoleBasedRoute,
  PublicRoute,
} from "./components/ProtectedRoute.jsx";

// Root layout component that handles auth events
function RootLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password/:token",
        element: <ResetPassword />,
      },
      {
        path: "/signup",
        element: (
          <PublicRoute>
            <Signup />
          </PublicRoute>
        ),
      },
      {
        path: "/user-dashboard",
        element: (
          <RoleBasedRoute allowedRoles={["RANGER"]}>
            <UserDashboard />
          </RoleBasedRoute>
        ),
      },
      {
        path: "/engineer-dashboard",
        element: (
          <RoleBasedRoute allowedRoles={["ENGINEER"]}>
            <EngineerDashboard />
          </RoleBasedRoute>
        ),
      },
      {
        path: "/admin-dashboard",
        element: (
          <RoleBasedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </RoleBasedRoute>
        ),
      },
    ],
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
