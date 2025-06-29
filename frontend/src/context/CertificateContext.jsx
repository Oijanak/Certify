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

  const updateCertificate = async (id, updateData) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/certificates/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedCertificate = await response.json();
      console.log("Certificate updated:", updatedCertificate);
      await fetchCertificates();
      return updatedCertificate;
    } catch (error) {
      console.error("Error updating certificate:", error);
    }
  };

  const getAllUserWithCertificates = async (id) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/certificates/user/" + id,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const users = await response.json();
      console.log("User data " + users);
      return users;
    } catch (error) {
      return [];
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
        updateCertificate,
        getAllUserWithCertificates,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
};

export const useCertificate = () => useContext(CertificateContext);
