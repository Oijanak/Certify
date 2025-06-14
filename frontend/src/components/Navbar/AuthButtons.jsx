import { Link } from "react-router-dom";

export default function AuthButtons() {
  return (
    <div className="flex space-x-4">
      <Link
        to="/login"
        className="border-transparent text-gray-500 hover:text-gray-700 inline-flex items-center px-4 py-4 text-lg font-medium"
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-4 rounded-md text-lg font-medium"
      >
        Register
      </Link>
    </div>
  );
}
