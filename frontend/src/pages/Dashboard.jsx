import { useState, useEffect } from "react";
import {
  ArrowDownTrayIcon,
  CheckBadgeIcon,
  ClockIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  FaceSmileIcon,
  MagnifyingGlassIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("created");
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Mock certificate data
        const mockCertificates = [
          {
            id: 1,
            title: "Advanced Machine Learning Certification",
            issuer: "Computer Science Department",
            dateEarned: "2023-06-15",
            expiryDate: "2026-06-15",
            status: "created",
            type: "Course Completion",
            credentialId: "AML-2023-1567",
            image: "https://via.placeholder.com/150",
            shareUrl: "https://certs.edu/verify/AML-2023-1567",
            isVerified: true,
            canDownload: true,
          },
          {
            id: 2,
            title: "Data Science Fundamentals Certificate",
            issuer: "Data Science Institute",
            dateEarned: "2023-05-22",
            expiryDate: "2025-05-22",
            status: "created",
            type: "Workshop Completion",
            credentialId: "DSF-2023-0891",
            image: "https://via.placeholder.com/150",
            shareUrl: "https://certs.edu/verify/DSF-2023-0891",
            isVerified: true,
            canDownload: true,
          },
          {
            id: 3,
            title: "Blockchain Technology Certification",
            issuer: "Engineering Faculty",
            dateRequested: "2023-07-10",
            status: "created",
            type: "Program Completion",
            credentialId: "BLC-2023-2045",
            image: "https://via.placeholder.com/150",
            statusDetails: "Awaiting Department Approval",
            estimatedCompletion: "2023-08-15",
          },
          {
            id: 4,
            title: "Cybersecurity Specialist Certificate",
            issuer: "Computer Science Department",
            dateRequested: "2023-07-18",
            status: "pending",
            type: "Skill Assessment",
            credentialId: "CSS-2023-3178",
            image: "https://via.placeholder.com/150",
            statusDetails: "Under Faculty Review",
            estimatedCompletion: "2023-08-01",
          },
          {
            id: 5,
            title: "Cloud Architecture Certification",
            issuer: "Engineering Faculty",
            dateEarned: "2023-04-05",
            expiryDate: "2025-04-05",
            status: "created",
            type: "Course Completion",
            credentialId: "CAC-2023-0423",
            image: "https://via.placeholder.com/150",
            shareUrl: "https://certs.edu/verify/CAC-2023-0423",
            isVerified: true,
            canDownload: true,
          },
        ];

        setCertificates(mockCertificates);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCertificates = certificates
    .filter((cert) =>
      activeTab === "created"
        ? cert.status === "created"
        : cert.status === "pending"
    )
    .filter(
      (cert) =>
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const downloadCertificate = (certId) => {
    console.log(`Downloading certificate ${certId}`);
    alert(`Certificate ${certId} download started`);
  };

  const shareCertificate = (shareUrl) => {
    console.log(`Sharing certificate at ${shareUrl}`);
    navigator.clipboard.writeText(shareUrl);
    alert("Certificate link copied to clipboard!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="px-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <CheckBadgeIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Earned Certificates
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {certificates.filter((c) => c.status === "created").length}
                  </dd>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Certificates
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {certificates.filter((c) => c.status === "pending").length}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Section */}
        <div className="px-4">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("created")}
                    className={`${
                      activeTab === "created"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <CheckBadgeIcon className="h-5 w-5 mr-2" />
                    My Certificates
                  </button>
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`${
                      activeTab === "pending"
                        ? "border-indigo-500 text-indigo-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Pending Requests
                    {certificates.filter((c) => c.status === "pending").length >
                      0 && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {
                          certificates.filter((c) => c.status === "pending")
                            .length
                        }
                      </span>
                    )}
                  </button>
                </nav>
                <div className="mt-4 md:mt-0 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search certificates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Certificate List */}
            <div className="px-6 py-4">
              {filteredCertificates.length === 0 ? (
                <div className="text-center py-12">
                  {activeTab === "created" ? (
                    <>
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No certificates available
                      </h3>
                    </>
                  ) : (
                    <>
                      <FaceSmileIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No pending certificate requests
                      </h3>
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            navigate("certificate/request");
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Request Certificate
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                  {cert.title}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                  {cert.issuer}
                                </p>
                              </div>
                              <div className="mt-2 sm:mt-0">
                                {cert.status === "created" ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckBadgeIcon className="h-3 w-3 mr-1" />
                                    Issued
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Type:{" "}
                                  <span className="text-gray-900">
                                    {cert.type}
                                  </span>
                                </p>
                                {cert.status === "created" ? (
                                  <>
                                    <p className="text-sm text-gray-500">
                                      Earned:{" "}
                                      <span className="text-gray-900">
                                        {formatDate(cert.dateEarned)}
                                      </span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Expires:{" "}
                                      <span className="text-gray-900">
                                        {formatDate(cert.expiryDate)}
                                      </span>
                                    </p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm text-gray-500">
                                      Requested:{" "}
                                      <span className="text-gray-900">
                                        {formatDate(cert.dateRequested)}
                                      </span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Status:{" "}
                                      <span className="text-gray-900">
                                        {cert.status}
                                      </span>
                                    </p>
                                  </>
                                )}
                              </div>
                              <div>
                                {cert.status === "created" &&
                                  cert.isVerified && (
                                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                                      <DocumentCheckIcon className="h-4 w-4 mr-1 text-green-500" />
                                      <span className="text-green-600">
                                        Verified credential
                                      </span>
                                    </p>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center space-x-2">
                          {cert.status === "created" ? (
                            <>
                              <button
                                onClick={() => downloadCertificate(cert.id)}
                                disabled={!cert.canDownload}
                                className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                                  cert.canDownload
                                    ? "text-gray-700 bg-white hover:bg-gray-50"
                                    : "text-gray-400 bg-gray-100 cursor-not-allowed"
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                              >
                                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                Download
                              </button>
                              <button
                                onClick={() => shareCertificate(cert.shareUrl)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <ShareIcon className="h-4 w-4 mr-2" />
                                Share
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => downloadCertificate(cert.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <DocumentTextIcon className="h-4 w-4 mr-2" />
                                View Request
                              </button>
                            </>
                          )}
                        </div>
                        {cert.status === "created" && (
                          <a
                            href={cert.shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                          >
                            View verification page
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
