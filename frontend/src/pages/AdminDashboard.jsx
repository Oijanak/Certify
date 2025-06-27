import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { abi } from "../utils/abi";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  // State management
  const [stats, setStats] = useState({
    totalUsers: 0,
    certificatesCreated: 0,
    certificatesPending: 0,
    blockchainTransactions: 0,
    transactions: [],
  });
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [network, setNetwork] = useState("");
  const [contract, setContract] = useState(null);

  const contractAddress = "0xaE73Bb945CC8d736Bc62E6892D40018De45Ba335";
  const apiBaseUrl = "http://localhost:5000/api"; // Replace with your API URL

  // Initialize blockchain connection and fetch data
  useEffect(() => {
    const initBlockchain = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const network = await provider.getNetwork();
          setNetwork(network.name);

          const certificationContract = new ethers.Contract(
            contractAddress,
            abi,
            signer
          );

          setContract(certificationContract);

          // Fetch data from both API and blockchain
          await Promise.all([
            fetchApiData(),
            fetchBlockchainData(certificationContract, provider),
          ]);
        } catch (error) {
          console.error("Error connecting to blockchain:", error);
          setLoading(false);
        }
      } else {
        console.log("Please install MetaMask!");
        // Still try to fetch API data even without MetaMask
        fetchApiData();
        setLoading(false);
      }
    };

    initBlockchain();
  }, []);

  // Fetch data from your API
  const fetchApiData = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/user/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      setStats((prev) => ({
        ...prev,
        totalUsers: data.totalUsers,
        certificatesCreated: data.certificatesCreated,
        certificatesPending: data.certificatesPending,
      }));
    } catch (error) {
      console.error("Error fetching API data:", error);
    }
  };

  // Fetch data from blockchain
  const fetchBlockchainData = async (contract, provider) => {
    try {
      const filter = contract.filters.CertificateIssued();
      const events = await contract.queryFilter(filter);

      // Process events
      const processedEvents = events.map((event) => {
        const args = event.args;
        return {
          certificateId: String(args.certificateId || args[0]?.hash || ""),
          holder: String(args.holder || args[1] || ""),
          holderName: String(args.holderName || args[2] || ""),
          courseName: String(args.courseName || args[3] || ""),
          issueDate: new Date(Number(args.issueDate || args[4]) * 1000),
          issuer: String(args.issuer || args[5] || ""),
          ipfsId: String(args.ipfsId || args[6] || ""),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          status: "completed",
        };
      });

      setStats((prev) => ({
        ...prev,
        blockchainTransactions: events.length,
        transactions: processedEvents,
      }));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching blockchain data:", error);
      setLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await Promise.all([
        fetchApiData(),
        contract ? fetchBlockchainData(contract, provider) : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = stats.transactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(stats.transactions.length / itemsPerPage);

  // Formatting functions
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const shortenHash = (hash) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Certificate Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {network || "Disconnected"}
            </span>
            <button
              onClick={refreshData}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowPathIcon className="h-5 w-5 mr-1" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-full mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 mt-6 sm:grid-cols-2 lg:grid-cols-4 px-4 sm:px-0">
          {/* Total Users (from API) */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <UsersIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalUsers}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Certificates Created (from API) */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Certificates Created
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.certificatesCreated}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Certificates Pending (from API) */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Certificates Pending
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.certificatesPending}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Transactions (from blockchain) */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Blockchain Transactions
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.blockchainTransactions}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions (from blockchain) */}
        <div className="mt-8 px-4 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Certificate Transactions
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  All certificate creation transactions recorded on the
                  blockchain
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Holder
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issued Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IPFS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTransactions.map((tx, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tx.certificateId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-medium">{tx.holderName}</span>
                        <div className="text-xs text-gray-400">
                          {shortenHash(tx.holder)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.courseName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tx.issueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            tx.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {tx.status === "completed" ? (
                            <span className="flex items-center">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              {tx.status}
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              {tx.status}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={`http://localhost:8080/ipfs/${tx.ipfsId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          View
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={`https://sepolia.etherscan.io/tx/${tx.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          {shortenHash(tx.transactionHash)}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
