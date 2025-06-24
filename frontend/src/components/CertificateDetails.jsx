import React, { useEffect, useState } from "react";
import PageSpinner from "./PageSpinner";
import { useNavigate, useParams } from "react-router-dom";
import { useCertificate } from "../context/CertificateContext";
import { useAuth } from "../context/AuthContext";

const CertificateDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { getCertificateById, rejectCertificate } = useCertificate();
  const [certificateData, setCertificateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectReasonError, setRejectReasonError] = useState("");

  useEffect(() => {
    const fetchCertificate = async () => {
      setLoading(true);
      const data = await getCertificateById(id);
      setCertificateData(data);
      setLoading(false);
    };
    fetchCertificate();
  }, [id, getCertificateById]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  if (!certificateData || loading) return <PageSpinner />;
  const {
    _id,
    title,
    certificateType,
    status,
    requestedDate,
    documentUrl,
    user,
  } = certificateData;

  // Format the date
  const formattedDate = new Date(requestedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Split document URLs
  const documentUrls = documentUrl
    .split(",")
    .map((url) =>
      url.trim()
        ? `http://localhost:5000/uploads/certificates/${url.trim()}`
        : null
    )
    .filter((url) => url);

  function handleCreate() {
    navigate("../certificates/issue/" + id);
  }

  function handleOpenRejectModal() {
    setIsRejectModalOpen(true);
  }

  function handleCloseRejectModal() {
    setIsRejectModalOpen(false);
    setRejectReason("");
  }

  async function handleRejectSubmit() {
    if (!rejectReason.trim()) {
      setRejectReasonError("Reject Reason is required");
      return;
    }
    try {
      setIsRejecting(true);
      const response = await fetch(
        `http://localhost:5000/api/certificates/status/` + id,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({ rejectReason }),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch certificate");

      setIsRejectModalOpen(false);
      setRejectReason("");
      navigate(-1);
      console.log("finished");
    } catch (error) {
      setRejectReason("Server Error");
    }
  }

  const openImageModal = (url) => {
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden h-full">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4 overflow-hidden">
            {/* Certificate Information */}
            <div>
              <h3 className="text-base font-medium text-gray-500">
                Certificate ID
              </h3>
              <p className="mt-1 text-base text-gray-900">{_id}</p>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-500">Type</h3>
              <p className="mt-1 text-base text-gray-900">{certificateType}</p>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-500">Status</h3>
              <p
                className={`mt-1 text-base font-medium ${
                  status === "approved"
                    ? "text-green-600"
                    : status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </p>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-500">
                Requested Date
              </h3>
              <p className="mt-1 text-base text-gray-900">{formattedDate}</p>
            </div>
          </div>

          {/* Student Information Section */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Student Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-base text-gray-900">{user.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Roll Number
                </h3>
                <p className="mt-1 text-base text-gray-900">{user.rollNo}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-base text-gray-900">{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Public Address
                </h3>
                <p className="mt-1 text-base text-gray-900 break-all font-mono">
                  {user.publicAddress}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Course</h3>
                <p className="mt-1 text-base text-gray-900 break-all font-mono">
                  {user.course}
                </p>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="mb-8">
            <h3 className="text-base font-medium text-gray-500">Documents</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {documentUrls.map((url, index) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => openImageModal(url)}
                >
                  <img
                    src={url}
                    alt={`Certificate document ${index + 1}`}
                    className="w-full h-48 object-contain bg-gray-100"
                  />
                  <div className="p-3 bg-gray-50 text-center border-t">
                    <span className="text-sm text-blue-600 hover:text-blue-800">
                      Document {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {status === "pending" && (
            <div className="flex justify-end space-x-4 mt-8">
              <button
                onClick={handleOpenRejectModal}
                className="px-6 py-3 border border-red-600 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 text-base font-medium"
              >
                Reject
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 text-base font-medium"
              >
                Create
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-w-6xl w-full max-h-[90vh]">
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={selectedImage}
              alt="Enlarged certificate document"
              className="w-full h-full max-h-[80vh] object-contain"
            />
            <div className="mt-2 text-center">
              <a
                href={selectedImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-blue-300 underline"
              >
                Open in new tab
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-100 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Reject Certificate
              </h3>
              <button
                onClick={handleCloseRejectModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <label
                htmlFor="rejectReason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reason for rejection
              </label>
              <textarea
                id="rejectReason"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter the reason for rejecting this certificate request..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
              <span className="text-red-500">{rejectReasonError}</span>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseRejectModal}
                disabled={isRejecting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={isRejecting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isRejecting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateDetails;
