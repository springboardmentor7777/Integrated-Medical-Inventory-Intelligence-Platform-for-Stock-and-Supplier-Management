import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
      localStorage.getItem("token")
  );

  const [user, setUser] = useState(
      JSON.parse(localStorage.getItem("user")) || null
  );

  // Verify the stored JWT when the application loads
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        return;
      }

      try {
        const currentUser = await getCurrentUser(storedToken);

        // Keep saved user information because /me currently
        // returns only limited user information.
        const storedUser = JSON.parse(
            localStorage.getItem("user")
        );

        const userData = {
          name: storedUser?.name || null,
          email: currentUser.email,
          role: storedUser?.role || null,
        };

        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setUser(userData);
      } catch (error) {
        console.error(
            "Token verification failed:",
            error
        );

        // JWT is invalid/expired, so log the user out
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
      }
    };

    verifyToken();
  }, []);

  const login = (loginData) => {
    localStorage.setItem("token", loginData.token);

    const userData = {
      name: loginData.name,
      email: loginData.email,
      role: loginData.role,
    };

    localStorage.setItem(
        "user",
        JSON.stringify(userData)
    );

    setToken(loginData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
      <AuthContext.Provider
          value={{
            token,
            user,
            login,
            logout,
            isAuthenticated: !!token,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}