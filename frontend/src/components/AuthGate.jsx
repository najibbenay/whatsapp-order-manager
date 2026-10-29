import { Children, cloneElement, isValidElement, useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

import Login from "../pages/Login";
import Register from "../pages/Register";

const API_URL = "http://localhost:5000/api";

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [page, setPage] = useState("login");
  const [checking, setChecking] = useState(true);
  
  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        if (active) setChecking(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!active) return;

        setSession({
          token,
          user: response.data.user,
          store: response.data.store,
        });
      } catch (error) {
        if (!active) return;

        console.error("Session error:", error);
        localStorage.removeItem("auth_token");
        setSession(null);
      } finally {
        if (active) setChecking(false);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  const handleSuccess = (data) => {
    if (!data?.token) {
      console.error("Authentication token missing.");
      return;
    }

    localStorage.setItem("auth_token", data.token);

    setSession({
      token: data.token,
      user: data.user || null,
      store: data.store || null,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");

    setSession(null);
    setPage("login");
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 bg-[#080D1F] text-[#C4B5FD]">
        <Loader2
          className="animate-spin text-[#22D3EE]"
          size={24}
        />

        <span className="text-sm font-medium">
          Checking session...
        </span>
      </div>
    );
  }

  if (!session) {
    return page === "login" ? (
      <Login
        onSuccess={handleSuccess}
        onRegister={() => setPage("register")}
      />
    ) : (
      <Register
        onSuccess={handleSuccess}
        onLogin={() => setPage("login")}
      />
    );
  }

  const user = {
    ...(session.user || {}),
    storeName:
      session.store?.name ||
      session.user?.storeName ||
      session.user?.store_name ||
      "",
  };

  return (
    <>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) {
          return child;
        }

        return cloneElement(child, {
          user,
          onLogout: handleLogout,
        });
      })}
    </>
  );
}