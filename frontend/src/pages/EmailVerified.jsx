import React from "react";
import { Link } from "react-router-dom"; // or your navigation library
import { CheckCircleIcon } from "@heroicons/react/24/outline"; // Requires @heroicons/react package

const EmailVerified = () => {
  return (
    <div className=" bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Success icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verified!
          </h2>

          {/* Message */}
          <p className="mt-4 text-lg text-gray-600">
            Your email address has been successfully verified.
          </p>

          {/* Additional info */}
          <p className="mt-2 text-sm text-gray-500">
            Thank you for verifying your email. You can now access all features
            of our platform.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            to="/login" // Replace with your actual dashboard route
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerified;
