import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext"; // adjust path

const CertificateContext = createContext();

export const CertificateProvider = ({ children }) => {
  const { token } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCertificates = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/certificates", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch certificates");

      const data = await res.json();
      console.log(data);
      setCertificates(data);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const getCertificateById = async (id) => {
    if (!token) return null;
    try {
      const res = await fetch(`http://localhost:5000/api/certificates/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch certificate");

      const data = await res.json();
      console.log(data);
      return data;
    } catch (err) {
      console.error("Error fetching certificate by ID:", err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [token]);

  return (
    <CertificateContext.Provider
      value={{
        certificates,
        loading,
        error,
        fetchCertificates,
        getCertificateById,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
};

export const useCertificate = () => useContext(CertificateContext);
