import { useState } from "react";
import axios from "axios";
import { useContractContext } from "../context/ContractContext";

export default function CertificateVerification() {
  const [certificateId, setCertificateId] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [ipfsContent, setIpfsContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { connectWallet } = useContractContext();

  const verifyCertificate = async () => {
    if (!certificateId || !userAddress) {
      setError("Please enter both certificate ID and user address");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setIsVerified(false);
      setCertificateData(null);
      setIpfsContent(null);
      const contract = await connectWallet();

      const verified = await contract.verifyCertificate(
        userAddress,
        certificateId
      );

      setIsVerified(verified);

      if (verified) {
        const cert = await contract.getCertificateById(
          userAddress,
          certificateId
        );
        setCertificateData({
          id: cert.id,
          recipientName: cert.holderName,
          course: cert.courseName,
          issuer: cert.issuer,
          issuedDate: new Date(cert.issueDate * 1000).toLocaleDateString(),
          ipfsHash: cert.ipfsId,
        });

        await fetchIPFSContent(cert.ipfsId);
      } else {
        setError("Certificate not found or not valid");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(
        "Error verifying certificate. Please check the details and try again."
      );
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

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
      setError("Could not load certificate file from IPFS");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Verification Form Section */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Certificate Verification
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Verify the authenticity of certificates on the blockchain
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Wallet Address
                </label>
                <input
                  type="text"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  placeholder="0x123...abc"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate ID
                </label>
                <input
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Enter certificate ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <button
                  onClick={verifyCertificate}
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      Verifying...
                    </span>
                  ) : (
                    "Verify Certificate"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && !isVerified && (
            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8 rounded-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-red-800">
                    Verification Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                    <p className="mt-2">
                      Please check the details and try again.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isVerified && certificateData && (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              {/* Verification Header */}
              <div className="px-6 py-5 bg-green-50 border-b border-green-100">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-8 w-8 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-green-800">
                      Certificate Verified
                    </h2>
                    <p className="text-sm text-green-600">
                      This certificate has been successfully verified on the
                      blockchain
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate Content */}
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
                        <h4 className="text-sm font-medium text-gray-500">
                          Course
                        </h4>
                        <p className="mt-1 text-lg text-gray-900">
                          {certificateData.course}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Issuer
                        </h4>
                        <p className="mt-1 text-lg text-gray-900">
                          {certificateData.issuer}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Issued Date
                        </h4>
                        <p className="mt-1 text-lg text-gray-900">
                          {certificateData.issuedDate}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Certificate ID
                        </h4>
                        <p className="mt-1 font-mono text-lg text-gray-900 break-all">
                          {certificateData.id}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          IPFS Hash
                        </h4>
                        <p className="mt-1 font-mono text-sm text-gray-900 break-all">
                          {certificateData.ipfsHash}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
