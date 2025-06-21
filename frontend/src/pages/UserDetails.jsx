import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCertificate } from "../context/CertificateContext";
import PageSpinner from "../components/PageSpinner";

const UserProfile = () => {
  // User data with multiple certificates of different statuses
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const { getAllUserWithCertificates } = useCertificate();

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await getAllUserWithCertificates(id);

      setUser(data);
    };
    fetchUsers();
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (user == null) return <PageSpinner />;

  // Group certificates by status
  const groupCertificatesByStatus = () => {
    return user.certificates.reduce((acc, certificate) => {
      if (!acc[certificate.status]) {
        acc[certificate.status] = [];
      }
      acc[certificate.status].push(certificate);
      return acc;
    }, {});
  };

  const certificateGroups = groupCertificatesByStatus();

  // Status display configuration
  const statusConfig = {
    created: {
      title: "Issued Certificates",
      color: "bg-green-100 text-green-800",
      icon: "✅",
    },
    pending: {
      title: "Pending Approval",
      color: "bg-yellow-100 text-yellow-800",
      icon: "⏳",
    },
    rejected: {
      title: "Rejected Certificates",
      color: "bg-red-100 text-red-800",
      icon: "❌",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* User Profile Card (same as before) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-blue-600 p-6 text-white">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-blue-100">
              {user.role} • {user.course}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Personal Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Roll No</p>
                    <p className="font-medium">{user.rollNo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium flex items-center">
                      {user.email}
                      {user.isEmailVerified && (
                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Verified
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Public Address</p>
                    <p className="font-mono text-sm break-all">
                      {user.publicAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Academic Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium">{user.course}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Certificates</p>
                    <p className="font-medium">{user.certificates.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Section Grouped by Status */}
        <div className="space-y-8">
          {Object.entries(certificateGroups).map(([status, certificates]) => (
            <div
              key={status}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div
                className={`p-4 border-b flex items-center ${
                  statusConfig[status]?.color || "bg-gray-100"
                }`}
              >
                <span className="mr-2">
                  {statusConfig[status]?.icon || "📄"}
                </span>
                <h2 className="text-lg font-semibold">
                  {statusConfig[status]?.title ||
                    `${
                      status.charAt(0).toUpperCase() + status.slice(1)
                    } Certificates`}
                </h2>
                <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-white">
                  {certificates.length}
                </span>
              </div>

              <div className="p-6 space-y-6">
                {certificates.map((certificate) => (
                  <div
                    key={certificate._id}
                    className="border rounded-lg p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {certificate.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {certificate.certificateType}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusConfig[certificate.status]?.color ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {certificate.status}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Organization</p>
                        <p className="font-medium">
                          {certificate.organizationName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issued to</p>
                        <p className="font-medium">
                          {certificate.recipientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Requested Date</p>
                        <p className="font-medium">
                          {formatDate(certificate.requestedDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Issued Date</p>
                        <p className="font-medium">
                          {formatDate(certificate.issuedDate)}
                        </p>
                      </div>
                      {certificate.issuer && (
                        <div>
                          <p className="text-sm text-gray-500">Issued by</p>
                          <p className="font-medium">{certificate.issuer}</p>
                        </div>
                      )}
                      {certificate.rejectionReason && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">
                            Rejection Reason
                          </p>
                          <p className="font-medium text-red-600">
                            {certificate.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    {(certificate.ipfsId || certificate.transactionId) && (
                      <div className="mt-4 pt-4 border-t">
                        {certificate.ipfsId && (
                          <>
                            <p className="text-sm text-gray-500">IPFS ID</p>
                            <p className="font-mono text-sm break-all">
                              {certificate.ipfsId}
                            </p>
                          </>
                        )}
                        {certificate.transactionId && (
                          <>
                            <p className="text-sm text-gray-500 mt-2">
                              Transaction ID
                            </p>
                            <p className="font-mono text-sm break-all">
                              {certificate.transactionId}
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
