import { useState, useRef } from "react";
import {
  PencilSquareIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  // User data
  const [user, setUser] = useState({
    _id: "684d8b45dbe94e5042b9e955",
    name: "Janak Chaudhary",
    rollNo: "171514",
    email: "janak.171514@ncit.edu.np",
    publicAddress: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    course: "Computer Engineering",
    profilePicture: null,
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      alert("Image size should be less than 2MB");
      return;
    }

    try {
      setIsUploading(true);

      // Simulate upload (in a real app, you would upload to your backend)
      const reader = new FileReader();
      reader.onloadend = () => {
        setUser((prev) => ({
          ...prev,
          profilePicture: reader.result,
        }));
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateForm = () => {
    const newErrors = {};

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.newPassword && !formData.currentPassword) {
      newErrors.currentPassword =
        "Current password is required to change password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("http://localhost:5000/api/user/change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        setErrors({ ...errors, message: err.message });
        return;
      }
      setEditMode(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-indigo-50">
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex flex-col sm:flex-row items-center">
                <div className="relative mb-6 sm:mb-0 sm:mr-8 group">
                  <div className="w-32 h-32 rounded-full bg-indigo-400 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg relative">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-300 cursor-pointer rounded-full">
                      <button
                        onClick={triggerFileInput}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-indigo-700 rounded-full p-3 shadow-lg hover:bg-gray-100"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <svg
                            className="animate-spin h-6 w-6 text-indigo-700"
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
                        ) : (
                          <CameraIcon className="h-6 w-6" />
                        )}
                      </button>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-indigo-200 text-lg mt-1">{user.course}</p>
                </div>
              </div>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-4 px-5 py-2.5 bg-white text-indigo-700 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition shadow-md hover:shadow-lg"
                >
                  <PencilSquareIcon className="h-5 w-5" /> Change Password
                </button>
              ) : null}
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {editMode ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-8">
                  {/* Password Change Section */}
                  <div className="border-t border-indigo-100 pt-8">
                    <h3 className="text-xl font-semibold text-indigo-800">
                      Change Password
                    </h3>

                    <div className="mt-6 space-y-6">
                      {/* Current Password */}
                      <div>
                        <label
                          htmlFor="currentPassword"
                          className="block text-sm font-medium text-indigo-700 mb-1"
                        >
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-lg border-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-700 text-lg p-3 ${
                            errors.currentPassword
                              ? "border-red-400"
                              : "border-indigo-200"
                          }`}
                          placeholder="Enter current password"
                        />
                        {errors.currentPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.currentPassword}
                          </p>
                        )}
                      </div>

                      {/* New Password */}
                      <div>
                        <label
                          htmlFor="newPassword"
                          className="block text-sm font-medium text-indigo-700 mb-1"
                        >
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-lg border-2 border-indigo-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-700 text-lg p-3"
                          placeholder="Enter new password"
                        />
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-indigo-700 mb-1"
                        >
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-lg border-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-700 text-lg p-3 ${
                            errors.confirmPassword
                              ? "border-red-400"
                              : "border-indigo-200"
                          }`}
                          placeholder="Confirm new password"
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.confirmPassword}
                          </p>
                        )}
                        {errors.message && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-8 border-t border-indigo-100 mt-8">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-6 py-3 border border-indigo-200 rounded-lg shadow-sm text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 transition"
                    >
                      <XMarkIcon className="h-5 w-5" /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 transition transform hover:scale-105"
                    >
                      <CheckIcon className="h-5 w-5" /> Save Changes
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name Field */}
                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-700">
                    Full Name
                  </label>
                  <p className="mt-1 text-lg font-medium text-indigo-900">
                    {user.name}
                  </p>
                </div>

                {/* Course Field */}
                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-700">
                    Course
                  </label>
                  <p className="mt-1 text-lg font-medium text-indigo-900">
                    {user.course}
                  </p>
                </div>

                {/* Email Field */}
                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-700">
                    Email
                  </label>
                  <p className="mt-1 text-lg font-medium text-indigo-900 break-all">
                    {user.email}
                  </p>
                </div>

                {/* Roll No Field */}
                <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-700">
                    Roll No
                  </label>
                  <p className="mt-1 text-lg font-medium text-indigo-900">
                    {user.rollNo}
                  </p>
                </div>

                {/* Public Address Field */}
                <div className="md:col-span-2 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-700">
                    Public Address
                  </label>
                  <p className="mt-1 text-lg font-mono font-medium text-indigo-900 break-all">
                    {user.publicAddress}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
