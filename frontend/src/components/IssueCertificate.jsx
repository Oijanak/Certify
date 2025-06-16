import { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { useCertificate } from "../context/CertificateContext";
import { useParams } from "react-router-dom";
import PageSpinner from "./PageSpinner";

const IssueCertificate = () => {
  const { getCertificateById } = useCertificate();
  const { id } = useParams();
  // Dynamic data that would come from props or API
  const [dynamicData, setDynamicData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Editable organization data
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

  // File upload handlers
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

  const {
    getRootProps: getCertificateRootProps,
    getInputProps: getCertificateInputProps,
  } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setUploadedFile(acceptedFiles[0]);
    },
  });

  const handleOrganizationChange = (e) => {
    const { name, value } = e.target;
    setOrganizationData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadToIPFS = async (file) => {
    // In a real implementation, you would upload to IPFS here
    // This is a mock implementation that returns a fake IPFS hash
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          `Qm${Math.random().toString(36).substring(2, 15)}${Math.random()
            .toString(36)
            .substring(2, 15)}`
        );
      }, 1500);
    });
  };

  const handleIssueCertificate = async () => {
    console.log("click");
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

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const canvasRatio = canvasWidth / canvasHeight;
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

        // Instead of saving, get the PDF as a Blob:
        const pdfBlob = pdf.output("blob");

        // Upload to IPFS
        ipfsResponse = await uploadToIPFS(pdfBlob);
      } else {
        // Upload the file directly to IPFS
        ipfsResponse = await uploadToIPFS(uploadedFile);
      }

      setIpfsHash(ipfsResponse);
      alert("Certificate successfully issued and uploaded to IPFS!");
    } catch (error) {
      console.error("Error issuing certificate:", error);
      alert("Failed to issue certificate");
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

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const canvasRatio = canvasWidth / canvasHeight;
    const pdfRatio = pdfWidth / pdfHeight;

    let imgWidth, imgHeight;

    // Fit image inside PDF page by width or height to avoid cropping
    if (canvasRatio > pdfRatio) {
      // Canvas is wider - fit by width
      imgWidth = pdfWidth;
      imgHeight = pdfWidth / canvasRatio;
    } else {
      // Canvas is taller - fit by height
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

          {/* Method Selection */}
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
              {/* Organization Settings */}
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
                          <p className="text-xs text-gray-500 mt-1">
                            Click to change
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
                          <p className="text-xs text-gray-500 mt-1">
                            Click to change
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
                    {isUploading ? "Uploading to IPFS..." : "Issue Certificate"}
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

              {/* Certificate Preview */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                <h2 className="text-xl font-semibold mb-4 text-blue-800">
                  Certificate Preview
                </h2>
                <div
                  ref={certificateRef}
                  className="border-2 border-gray-200 p-8 bg-white min-h-[600px] flex flex-col items-center justify-center relative"
                >
                  {/* Modified decorative border - using simple hex colors */}
                  <div className="absolute inset-0 border-8 border-transparent border-t-[#bfdbfe] border-r-[#93c5fd] border-b-[#bfdbfe] border-l-[#93c5fd] pointer-events-none"></div>

                  <div className="text-center w-full max-w-2xl px-4 py-8 relative z-10">
                    {/* Organization Name at the top */}
                    <h2 className="text-2xl font-bold mb-6 text-[#1e40af]">
                      {organizationData.name}
                    </h2>

                    {/* Organization Logo */}
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
                      {/* Completion Date Section */}
                      <div>
                        <p className="font-semibold">Completion Date</p>
                        <p>{dynamicData.completionDate}</p>
                      </div>

                      {/* Signature and Issuer Section */}
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

              <div
                {...getCertificateRootProps()}
                className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:border-blue-500 mb-6"
              >
                <input {...getCertificateInputProps()} />
                {uploadedFile ? (
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
                    <p className="text-sm text-gray-500 mt-1">
                      Click to select a different file
                    </p>
                  </div>
                ) : (
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16 mx-auto text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mt-2 text-gray-600">
                      Drag & drop your certificate file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports: PNG, JPG, PDF (Max: 5MB)
                    </p>
                  </div>
                )}
              </div>

              {uploadedFile && (
                <div>
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
                      onClick={handleIssueCertificate}
                      disabled={isUploading || !organizationData.name}
                      className="flex-1 bg-blue-700 text-white py-3 px-6 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isUploading
                        ? "Uploading to IPFS..."
                        : "Issue Certificate"}
                    </button>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

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
