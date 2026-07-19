import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Added Route import
import { useAppStore } from "./store";
import { apiClient } from "./lib/api-client";
import { GET_USER_INFO } from "./utils/constants";

// Lazy-loaded route components for code splitting
const Auth = lazy(() => import("./Pages/auth"));
const Chat = lazy(() => import("./Pages/chat"));
const Profile = lazy(() => import("./Pages/profile"));

const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  if (isAuthenticated) {
    return children;
  }
  return <Navigate to="/auth" />;
};
const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore();
  const isAuthenticated = !!userInfo;
  if (isAuthenticated) {
    return <Navigate to="/chat" />;
  }
  return children;
};

function App() {
  const { userInfo, setUserInfo } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO, {
          withCredentials: true,
        });
        // console.log(response);
        if (response.status === 200 && response.data.id) {
          setUserInfo(response.data);
        } else {
          setUserInfo(undefined);
        }
      } catch (error) {
        setUserInfo(undefined);
        console.log({ error });
      } finally {
        setLoading(false);
      }
    };

    if (!userInfo) {
      getUserData();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-slate-900 text-indigo-600 font-medium text-xl">Checking session...</div>;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center bg-white dark:bg-slate-900 text-indigo-600 font-medium text-xl">Loading PolyChat...</div>}>
        <Routes>
          <Route
            path="/auth"
            element={
              <AuthRoute>
                <Auth />
              </AuthRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <Chat />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/auth" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
