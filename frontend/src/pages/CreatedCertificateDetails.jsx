import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCertificate } from "../context/CertificateContext";
import PageSpinner from "../components/PageSpinner";
import axios from "axios";
const CreatedCertificateDetails = () => {
  const { id } = useParams();
  const { getCertificateById } = useCertificate();
  const [certificateData, setCertificateData] = useState(null);
  const [ipfsContent, setIpfsContent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      setLoading(true);
      const data = await getCertificateById(id);
      console.log("Certificates");
      console.log(data); // 👈 Fetch by ID
      setCertificateData(data);

      setLoading(false);
      await fetchIPFSContent(data.ipfsId);
    };
    fetchCertificate();
  }, [id, getCertificateById]);

  const fetchIPFSContent = async (ipfsHash) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/ipfs/${ipfsHash}`,
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(response.data);

      if (response.data.type.includes("image")) {
        setIpfsContent({ type: "image", url });
      } else if (response.data.type.includes("pdf")) {
        setIpfsContent({ type: "pdf", url });
      } else {
        setIpfsContent({ type: "unknown", url });
      }
    } catch (err) {
      console.error("Error fetching IPFS content:", err);
    }
  };
  if (!certificateData) return <PageSpinner />;
  return (
    <div className="p-6 space-y-8">
      {/* Certificate Details */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
          Certificate Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">
                Recipient Name
              </h4>
              <p className="mt-1 text-lg font-medium text-gray-900">
                {certificateData.recipientName}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Course</h4>
              <p className="mt-1 text-lg text-gray-900">
                {certificateData.user.course}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Issuer</h4>
              <p className="mt-1 text-lg text-gray-900">
                {certificateData.issuer}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">
                Public Address
              </h4>
              <p className="mt-1 text-lg text-gray-900">
                {certificateData.user.publicAddress}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Issued Date</h4>
              <p className="mt-1 text-lg text-gray-900">
                {certificateData.issuedDate}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">
                Certificate ID
              </h4>
              <p className="mt-1 font-mono text-lg text-gray-900 break-all">
                {certificateData._id}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">
                Public Address
              </h4>
              <p className="mt-1 text-lg text-gray-900">
                {certificateData.user.email}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">IPFS Hash</h4>
              <p className="mt-1 font-mono text-sm text-gray-900 break-all">
                {certificateData.ipfsId}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Document */}
      <div>
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Certificate Document
          </h3>
          {ipfsContent && (
            <a
              href={ipfsContent.url}
              download={`certificate_${certificateData.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Download Certificate
            </a>
          )}
        </div>

        {ipfsContent ? (
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            {ipfsContent.type === "image" ? (
              <img
                src={ipfsContent.url}
                alt="Certificate"
                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
              />
            ) : ipfsContent.type === "pdf" ? (
              <div className="h-[70vh]">
                <iframe
                  src={ipfsContent.url}
                  className="w-full h-full"
                  title="Certificate PDF"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-gray-50">
                <svg
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4 text-gray-500">
                  Preview not available for this file type
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-gray-200">
            <svg
              className="animate-spin h-8 w-8 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-4 text-gray-500">
              Loading certificate document...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatedCertificateDetails;
