import React, { useState, useRef } from "react";
import { useContractContext } from "../context/ContractContext";
import { addFileToIPFS } from "../utils/ipfs";

function IssueCertificate() {
  const [certificate, setCertificate] = useState({
    recipientName: "",
    courseName: "",
    dateOfIssue: new Date().toISOString().split("T")[0],
    issuerName: "",
    certificateId: "",
    description: "",
    file: null,
    ipfsHash: "",
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { contract, signer } = useContractContext();
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCertificate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCertificate((prev) => ({
        ...prev,
        file: e.target.files[0],
      }));
    }
  };

  const storeOnBlockchain = async (certificateId, ipfsHash) => {
    if (!signer) {
      throw new Error("Wallet not connected");
    }

    const tx = await contract.issueCertificate(
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      certificate.recipientName,
      certificate.courseName,
      certificate.issuerName,
      ipfsHash
    );

    await tx.wait();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (!certificate.file) {
        throw new Error("Please select a file to upload");
      }

      // Generate certificate ID if not provided
      const certId =
        certificate.certificateId ||
        `CERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // Upload to IPFS
      const ipfsHash = await addFileToIPFS(certificate.file);

      await storeOnBlockchain(certId, ipfsHash);

      setSuccessMessage(
        "Certificate created and stored on blockchain successfully!"
      );
      setCertificate((prev) => ({
        ...prev,
        certificateId: certId,
        ipfsHash: ipfsHash,
      }));
    } catch (error) {
      console.error("Error creating certificate:", error);
      setErrorMessage(error.message || "Failed to create certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateCertificateId = () => {
    const id = `CERT-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;
    setCertificate((prev) => ({ ...prev, certificateId: id }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Blockchain Certificate Creator
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Create certificates, store files on IPFS, and record on blockchain
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setPreviewMode(false)}
                className={`px-4 py-2 rounded-md ${
                  !previewMode
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Form
              </button>
              <button
                onClick={() => setPreviewMode(true)}
                className={`px-4 py-2 rounded-md ${
                  previewMode
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Preview
              </button>
            </div>

            {previewMode ? (
              <div className="border-2 border-gray-200 p-8 rounded-lg">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-blue-800 mb-2">
                    CERTIFICATE OF COMPLETION
                  </h2>
                  <div className="w-32 h-1 bg-blue-600 mx-auto mb-6"></div>
                  <p className="text-lg text-gray-600">
                    This is to certify that
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 my-4">
                    {certificate.recipientName || "Recipient Name"}
                  </h3>
                  <p className="text-lg text-gray-600">
                    has successfully completed the course
                  </p>
                  <h4 className="text-2xl font-semibold text-blue-700 my-4">
                    {certificate.courseName || "Course Name"}
                  </h4>
                </div>

                <div className="mb-8">
                  <p className="text-gray-700 text-center">
                    {certificate.description ||
                      "Description of achievement goes here"}
                  </p>
                </div>

                {certificate.ipfsHash && (
                  <div className="mb-6 p-4 bg-gray-100 rounded-md">
                    <p className="text-sm font-medium text-gray-700">
                      IPFS Hash:
                    </p>
                    <p className="text-sm text-gray-600 break-all">
                      {certificate.ipfsHash}
                    </p>
                    <a
                      href={`https://ipfs.io/ipfs/${certificate.ipfsHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View on IPFS
                    </a>
                  </div>
                )}

                <div className="flex justify-between mt-12">
                  <div className="text-center">
                    <div className="h-16 border-t-2 border-gray-400 w-32 mx-auto mb-2"></div>
                    <p className="text-gray-700">Date</p>
                    <p className="font-semibold">
                      {certificate.dateOfIssue ||
                        new Date().toISOString().split("T")[0]}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="h-16 border-t-2 border-gray-400 w-32 mx-auto mb-2"></div>
                    <p className="text-gray-700">Certificate ID</p>
                    <p className="font-semibold">
                      {certificate.certificateId || "XXXX-XXXX"}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="h-16 border-t-2 border-gray-400 w-32 mx-auto mb-2"></div>
                    <p className="text-gray-700">Issued by</p>
                    <p className="font-semibold">
                      {certificate.issuerName || "Issuing Organization"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="recipientName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      id="recipientName"
                      value={certificate.recipientName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="courseName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Course Name
                    </label>
                    <input
                      type="text"
                      name="courseName"
                      id="courseName"
                      value={certificate.courseName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="dateOfIssue"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Date of Issue
                    </label>
                    <input
                      type="date"
                      name="dateOfIssue"
                      id="dateOfIssue"
                      value={certificate.dateOfIssue}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="issuerName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Issuer Name
                    </label>
                    <input
                      type="text"
                      name="issuerName"
                      id="issuerName"
                      value={certificate.issuerName}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={certificate.description}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="certificateId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Certificate ID
                    </label>
                    <div className="flex mt-1">
                      <input
                        type="text"
                        name="certificateId"
                        id="certificateId"
                        value={certificate.certificateId}
                        onChange={handleChange}
                        className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={generateCertificateId}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="file"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Certificate File (PDF/Image)
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        ref={fileInputRef}
                        id="file"
                        name="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Choose File
                      </button>
                      <span className="ml-2 text-sm text-gray-500">
                        {certificate.file
                          ? certificate.file.name
                          : "No file chosen"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
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
                        Processing...
                      </>
                    ) : (
                      "Create & Store Certificate"
                    )}
                  </button>
                </div>

                {errorMessage && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-red-400"
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
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          {successMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IssueCertificate;
