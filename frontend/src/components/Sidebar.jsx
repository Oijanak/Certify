import { useState } from "react";
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  CogIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileSidebar = () => setMobileOpen(!mobileOpen);

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
        >
          {mobileOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}

      {/* Sidebar - Removed minimization functionality */}
      <div
        className={`fixed inset-y-0 left-0 transform  ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition duration-200 ease-in-out z-10 bg-white shadow-lg w-90 md:relative`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Panel</h1>
        </div>

        {/* Sidebar Content - Removed overflow */}
        <div className="flex flex-col h-[calc(100%-128px)]">
          {" "}
          {/* Adjust based on header/footer height */}
          <nav className="px-4 py-4">
            {/* Dashboard */}
            <div className="mb-8">
              <Link
                to="dashboard"
                className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
              >
                <HomeIcon className="h-6 w-6" />
                <span className="ml-3">Dashboard</span>
              </Link>
            </div>

            {/* User Management Section */}
            <div className="mb-8">
              <h2 className="px-4 py-2 text-lg bg-indigo-100 font-semibold text-gray-500 uppercase tracking-wider mb-2 rounded-lg">
                User Management
              </h2>
              <ul>
                <li>
                  <Link
                    to="users"
                    className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                  >
                    <UsersIcon className="h-6 w-6" />
                    <span className="ml-3">All Users</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Certificate Management Section */}
            <div className="mb-8">
              <h2 className="px-4 py-2 text-lg bg-indigo-100 font-semibold text-gray-500 uppercase tracking-wider mb-2 rounded-lg">
                Certificate Management
              </h2>
              <ul>
                <li>
                  <Link
                    to="certificates"
                    className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                  >
                    <DocumentTextIcon className="h-6 w-6" />
                    <span className="ml-3">Certificates</span>
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
