import {
  AcademicCapIcon,
  CheckBadgeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";

const Home = () => {
  const [certifications, setCertifications] = useState([]);
  const [filteredCerts, setFilteredCerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch certifications
    const fetchCertifications = async () => {
      setIsLoading(true);
      try {
        // In a real app, you would fetch from your API
        const mockData = [
          {
            id: 1,
            title: "React Developer Certification",
            issuer: "React Institute",
            date: "2023-05-15",
            image: "https://via.placeholder.com/150",
            credentialId: "RCT-2023-001",
            status: "active",
            category: "Web Development",
          },
          {
            id: 2,
            title: "Advanced JavaScript Specialist",
            issuer: "JavaScript Academy",
            date: "2023-03-10",
            image: "https://via.placeholder.com/150",
            credentialId: "JS-2023-045",
            status: "active",
            category: "Programming",
          },
          {
            id: 3,
            title: "Cloud Architecture Professional",
            issuer: "Cloud Certification Board",
            date: "2022-11-22",
            image: "https://via.placeholder.com/150",
            credentialId: "CLD-2022-312",
            status: "active",
            category: "Cloud Computing",
          },
          {
            id: 4,
            title: "UI/UX Design Certification",
            issuer: "Design Institute",
            date: "2022-09-05",
            image: "https://via.placeholder.com/150",
            credentialId: "DSN-2022-178",
            status: "expired",
            category: "Design",
          },
        ];

        setCertifications(mockData);
        setFilteredCerts(mockData);
      } catch (error) {
        console.error("Error fetching certifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  useEffect(() => {
    const filtered = certifications.filter(
      (cert) =>
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCerts(filtered);
  }, [searchTerm, certifications]);

  const downloadCertificate = (certId) => {
    // In a real app, this would download the actual certificate
    console.log(`Downloading certificate ${certId}`);
    alert(`Certificate ${certId} download started`);
  };

  const shareCertificate = (certId) => {
    // In a real app, this would implement sharing functionality
    console.log(`Sharing certificate ${certId}`);
    alert(`Share dialog for certificate ${certId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <CheckBadgeIcon className="h-8 w-8 text-indigo-600 mr-2" />
              My Certifications
            </h1>
            <div className="mt-4 md:mt-0 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                placeholder="Search certifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="px-4 mb-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <CheckBadgeIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Certifications
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {certifications.length}
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <AcademicCapIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Certifications
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {
                          certifications.filter((c) => c.status === "active")
                            .length
                        }
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <ClipboardDocumentCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Expired Certifications
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {
                          certifications.filter((c) => c.status === "expired")
                            .length
                        }
                      </div>
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications Grid */}
        <div className="px-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="text-center py-12">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No certifications found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Try a different search term"
                  : "You currently have no certifications"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-md"
                          src={cert.image}
                          alt={cert.issuer}
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {cert.title}
                        </h3>
                        <p className="text-sm text-gray-500">{cert.issuer}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>
                          Issued: {new Date(cert.date).toLocaleDateString()}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            cert.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {cert.status}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        <span>Credential ID: {cert.credentialId}</span>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {cert.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => shareCertificate(cert.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Share
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadCertificate(cert.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <ArrowDownTrayIcon className="-ml-1 mr-2 h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-500">
            &copy; {new Date().getFullYear()} Certifications Portal. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
