import { createContext, useContext, useState } from "react";
import { useContractContext } from "./ContractContext";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const { disconnectWallet } = useContractContext();
  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const error = await res.json();
        setAuthError(error.message);
      } else {
        const data = await res.json();
        console.log("load user ");
        console.log(data);

        setUser(data);
        setRole(data.role);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setRole(null);
    setLoading(false);
    disconnectWallet();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        setRole,
        setUser,
        setToken,
        isAuthenticated: !!user,
        isAdmin: role === "admin",
        logout,
        loadUser,
        loading,
        setLoading,
        authError,
        // setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthProvider };
