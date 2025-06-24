import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import useClickOutside from "../../hooks/useClickOutside";
import ConfirmationModal from "../ConfirmationModal";

export default function UserDropdown({ user, isAdmin, onLogout, onClose }) {
  const dropdownRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, onClose);
  function handleSignOut() {
    onClose();
    onLogout();
  }

  return (
    <div
      ref={dropdownRef}
      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-gray-500 ring-opacity-5 focus:outline-none z-50"
      role="menu"
    >
      <div className="px-4 py-2  shadow-md">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-gray-500">{user?.email}</p>
      </div>
      <Link
        to="/user/profile"
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        role="menuitem"
        onClick={onClose}
      >
        Your Profile
      </Link>
      <button
        onClick={() => {
          setIsModalOpen(true);
        }}
        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        role="menuitem"
      >
        Sign out
      </button>

      <ConfirmationModal
        isOpen={isModalOpen}
        title="Confirm Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        cancelText="Cancel"
        onConfirm={handleSignOut}
        onCancel={() => {
          onClose();
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
