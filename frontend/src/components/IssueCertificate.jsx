import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { useCertificate } from "../context/CertificateContext";
import { useParams } from "react-router-dom";
import PageSpinner from "./PageSpinner";
import { addFileToIPFS } from "../utils/ipfs";
import { useContractContext } from "../context/ContractContext";
import { useDropzone } from "react-dropzone";

const IssueCertificate = () => {
  const { getCertificateById, updateCertificate } = useCertificate();
  const { id } = useParams();
  const [dynamicData, setDynamicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { contract, connectWallet } = useContractContext();

  useEffect(() => {
    const fetchCertificate = async () => {
      setLoading(true);
      const data = await getCertificateById(id);
      setDynamicData({
        ...data,
        completionDate: new Date().toISOString().split("T")[0],
      });
      setLoading(false);
    };
    fetchCertificate();
  }, [id, getCertificateById]);

  const [organizationData, setOrganizationData] = useState({
    name: "",
    issuerName: "",
    logo: null,
    signature: null,
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const certificateRef = useRef(null);
  const [issuanceMethod, setIssuanceMethod] = useState("template");

  // Dropzone for logo and signature (kept for template method)
  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps } =
    useDropzone({
      accept: { "image/*": [".png", ".jpg", ".jpeg"] },
      maxFiles: 1,
      onDrop: (acceptedFiles) => {
        setOrganizationData((prev) => ({ ...prev, logo: acceptedFiles[0] }));
      },
    });

  const {
    getRootProps: getSignatureRootProps,
    getInputProps: getSignatureInputProps,
  } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setOrganizationData((prev) => ({ ...prev, signature: acceptedFiles[0] }));
    },
  });

  const handleOrganizationChange = (e) => {
    const { name, value } = e.target;
    setOrganizationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }
    setUploadedFile(file);
  };

  const handleIssueCertificate = async (e) => {
    if (e) e.preventDefault();

    console.log("Issuing certificate...");
    setIsUploading(true);
    try {
      let ipfsResponse;

      if (issuanceMethod === "template") {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 4,
          logging: true,
          useCORS: true,
          backgroundColor: null,
        });

        const pdf = new jsPDF("portrait", "mm", "a4");
        const imgData = canvas.toDataURL("image/png");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasRatio = canvas.width / canvas.height;
        const pdfRatio = pdfWidth / pdfHeight;

        let imgWidth, imgHeight;
        if (canvasRatio > pdfRatio) {
          imgWidth = pdfWidth;
          imgHeight = pdfWidth / canvasRatio;
        } else {
          imgHeight = pdfHeight;
          imgWidth = pdfHeight * canvasRatio;
        }

        const xOffset = (pdfWidth - imgWidth) / 2;
        const yOffset = (pdfHeight - imgHeight) / 2;

        pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);
        const pdfBlob = pdf.output("blob");
        ipfsResponse = await addFileToIPFS(pdfBlob);
      } else {
        ipfsResponse = await addFileToIPFS(uploadedFile);
      }

      setIpfsHash(ipfsResponse);

      const newContract = await connectWallet();

      const tx = await newContract.issueCertificate(
        dynamicData._id,
        dynamicData.user.publicAddress,
        dynamicData.user.name,
        dynamicData.user.course,
        organizationData.issuerName,
        ipfsResponse
      );

      const { transactionHash } = await tx.wait();

      const updateData = {
        recipientName: dynamicData.user.name,
        issuedDate: Date.now(),
        ipfsId: ipfsResponse,
        oraganizationName: organizationData.name,
        status: "created",
        transactionId: transactionHash,
        issuer: organizationData.issuerName,
      };

      const response = await updateCertificate(id, updateData);

      if (response.ok) {
        console.log(await response.json());
      }
    } catch (error) {
      console.error("Error issuing certificate:", error);
      alert(`Failed to issue certificate: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadCertificate = async () => {
    const canvas = await html2canvas(certificateRef.current, {
      scale: 4,
      useCORS: true,
      backgroundColor: null,
    });

    const pdf = new jsPDF("portrait", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasRatio = canvas.width / canvas.height;
    const pdfRatio = pdfWidth / pdfHeight;

    let imgWidth, imgHeight;
    if (canvasRatio > pdfRatio) {
      imgWidth = pdfWidth;
      imgHeight = pdfWidth / canvasRatio;
    } else {
      imgHeight = pdfHeight;
      imgWidth = pdfHeight * canvasRatio;
    }

    const xOffset = (pdfWidth - imgWidth) / 2;
    const yOffset = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, "PNG", xOffset, yOffset, imgWidth, imgHeight);
    pdf.save("certificate.pdf");
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
            Certificate Issuance System
          </h1>

          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setIssuanceMethod("template")}
                className={`px-6 py-3 text-lg font-medium rounded-l-lg ${
                  issuanceMethod === "template"
                    ? "bg-blue-700 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Create from Template
              </button>
              <button
                onClick={() => setIssuanceMethod("upload")}
                className={`px-6 py-3 text-lg font-medium rounded-r-lg ${
                  issuanceMethod === "upload"
                    ? "bg-blue-700 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Upload Existing Certificate
              </button>
            </div>
          </div>

          {issuanceMethod === "template" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                <h2 className="text-xl font-semibold mb-4 text-blue-800">
                  Organization Settings
                </h2>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="organizationName"
                  >
                    Organization Name*
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    name="name"
                    value={organizationData.name}
                    onChange={handleOrganizationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="issuerName"
                  >
                    Issuer Name*
                  </label>
                  <input
                    type="text"
                    id="issuerName"
                    name="issuerName"
                    value={organizationData.issuerName}
                    onChange={handleOrganizationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Organization Logo
                    </label>
                    <div
                      {...getLogoRootProps()}
                      className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500"
                    >
                      <input {...getLogoInputProps()} />
                      {organizationData.logo ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={URL.createObjectURL(organizationData.logo)}
                            alt="Organization Logo"
                            className="h-20 object-contain mb-2"
                          />
                          <p className="text-sm text-gray-600">
                            {organizationData.logo.name}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-600">Drag & drop logo here</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Supports: PNG, JPG
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Signature Image
                    </label>
                    <div
                      {...getSignatureRootProps()}
                      className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-blue-500"
                    >
                      <input {...getSignatureInputProps()} />
                      {organizationData.signature ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={URL.createObjectURL(
                              organizationData.signature
                            )}
                            alt="Signature"
                            className="h-20 object-contain mb-2"
                          />
                          <p className="text-sm text-gray-600">
                            {organizationData.signature.name}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-600">
                            Drag & drop signature here
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Supports: PNG, JPG
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-md mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Certificate Details (Auto-filled)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Recipient:</span>{" "}
                      {dynamicData.user.name}
                    </p>
                    <p>
                      <span className="font-medium">Roll No:</span>{" "}
                      {dynamicData.user.rollNo}
                    </p>
                    <p>
                      <span className="font-medium">Course:</span>{" "}
                      {dynamicData.user.course}
                    </p>
                    <p>
                      <span className="font-medium">Completion Date:</span>{" "}
                      {dynamicData.completionDate}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleIssueCertificate}
                    disabled={isUploading || !organizationData.name}
                    className="flex-1 bg-blue-700 text-white py-3 px-6 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isUploading ? (
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
                        Uploading...
                      </span>
                    ) : (
                      "Issue Certificate"
                    )}
                  </button>
                  <button
                    onClick={downloadCertificate}
                    disabled={!organizationData.name}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Download Preview
                  </button>
                </div>

                {ipfsHash && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md">
                    <p className="text-green-700">
                      Certificate issued successfully!
                    </p>
                    <p className="text-sm mt-1 break-all">
                      IPFS Hash: {ipfsHash}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                <h2 className="text-xl font-semibold mb-4 text-blue-800">
                  Certificate Preview
                </h2>
                <div
                  ref={certificateRef}
                  className="border-2 border-gray-200 p-8 bg-white min-h-[600px] flex flex-col items-center justify-center relative"
                >
                  <div className="absolute inset-0 border-8 border-transparent border-t-[#bfdbfe] border-r-[#93c5fd] border-b-[#bfdbfe] border-l-[#93c5fd] pointer-events-none"></div>

                  <div className="text-center w-full max-w-2xl px-4 py-8 relative z-10">
                    <h2 className="text-2xl font-bold mb-6 text-[#1e40af]">
                      {organizationData.name}
                    </h2>

                    {organizationData.logo && (
                      <div className="mb-6 flex justify-center">
                        <img
                          src={URL.createObjectURL(organizationData.logo)}
                          alt="Organization Logo"
                          className="h-20 object-contain"
                        />
                      </div>
                    )}

                    <h3 className="text-4xl font-bold mb-6 text-[#1e40af] tracking-wide">
                      CERTIFICATE OF ACHIEVEMENT
                    </h3>
                    <div className="w-24 h-1 bg-[#3b82f6] mx-auto mb-8"></div>

                    <p className="mb-8 text-gray-600 text-lg">
                      This is to certify that
                    </p>

                    <h4 className="text-5xl font-bold text-[#2563eb] mb-8 px-12 py-4 border-b-2 border-t-2 border-[#dbeafe]">
                      {dynamicData.user.name}
                    </h4>

                    <div className="mb-8 text-gray-700">
                      <p className="mb-2">
                        with Roll No:{" "}
                        <span className="font-semibold">
                          {dynamicData.user.rollNo}
                        </span>
                      </p>
                      <p>has successfully completed the course</p>
                    </div>

                    <h5 className="text-3xl font-semibold mb-8 text-gray-800 italic">
                      "{dynamicData.user.course}"
                    </h5>

                    <p className="mb-8 text-gray-700 italic">
                      "For outstanding performance and completion of all course
                      requirements with distinction."
                    </p>

                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 items-end">
                      <div>
                        <p className="font-semibold">Completion Date</p>
                        <p>{dynamicData.completionDate}</p>
                      </div>

                      <div className="flex flex-col items-center">
                        {organizationData.signature && (
                          <div className="mb-2 h-16">
                            <img
                              src={URL.createObjectURL(
                                organizationData.signature
                              )}
                              alt="Signature"
                              className="h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="w-24 h-0.5 bg-gray-400 mb-1"></div>
                        <p className="font-semibold">
                          {organizationData.issuerName}
                        </p>
                        <p className="text-sm">Authorized Signatory</p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mt-8">
                      <p>Certificate ID:{dynamicData._id}</p>
                      <p>
                        This digital certificate is valid and verifiable on the
                        blockchain
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
              <h2 className="text-xl font-semibold mb-4 text-blue-800">
                Upload Existing Certificate
              </h2>

              <form onSubmit={handleIssueCertificate}>
                <div className="mb-6">
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="certificateFile"
                  >
                    Certificate File*
                  </label>
                  <input
                    id="certificateFile"
                    type="file"
                    onChange={handleFileChange}
                    accept=".png,.jpg,.jpeg,.pdf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Supports: PNG, JPG, PDF (Max: 5MB)
                  </p>
                </div>

                {uploadedFile && (
                  <div className="mb-6">
                    <div className="flex flex-col items-center">
                      {uploadedFile.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(uploadedFile)}
                          alt="Uploaded Certificate"
                          className="max-h-60 object-contain mb-4"
                        />
                      ) : (
                        <div className="bg-red-100 p-6 rounded-full mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <p className="text-green-600 font-medium">
                        {uploadedFile.name}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="organizationNameUpload"
                  >
                    Organization Name*
                  </label>
                  <input
                    type="text"
                    id="organizationNameUpload"
                    name="name"
                    value={organizationData.name}
                    onChange={handleOrganizationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label
                    className="block text-gray-700 mb-2"
                    htmlFor="issuerNameUpload"
                  >
                    Issuer Name*
                  </label>
                  <input
                    type="text"
                    id="issuerNameUpload"
                    name="issuerName"
                    value={organizationData.issuerName}
                    onChange={handleOrganizationChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    disabled={
                      isUploading || !organizationData.name || !uploadedFile
                    }
                    className="flex-1 bg-blue-700 text-white py-3 px-6 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isUploading ? (
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
                        Uploading...
                      </span>
                    ) : (
                      "Issue Certificate"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {ipfsHash && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-green-700">
                    Certificate issued successfully!
                  </p>
                  <p className="text-sm mt-1 break-all">
                    IPFS Hash: {ipfsHash}
                  </p>
                  {uploadedFile && (
                    <a
                      href={URL.createObjectURL(uploadedFile)}
                      download={`${
                        organizationData.name
                      }_certificate.${uploadedFile.name.split(".").pop()}`}
                      className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                    >
                      Download Original File
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueCertificate;
