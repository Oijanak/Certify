import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
    website: user?.website || "",
    location: user?.location || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-indigo-600 px-6 py-8 sm:px-10 sm:py-12">
            <div className="flex flex-col sm:flex-row items-center">
              <div className="relative group">
                <img
                  className="h-24 w-24 rounded-full border-4 border-white object-cover"
                  src={formData.avatar || "https://via.placeholder.com/150"}
                  alt="Profile"
                />
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="cursor-pointer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setFormData((prev) => ({
                                ...prev,
                                avatar: event.target.result,
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="text-2xl font-bold text-white bg-indigo-500 bg-opacity-50 rounded px-2 py-1 mb-1 w-full sm:w-auto"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white">
                    {formData.name}
                  </h1>
                )}
                <p className="text-indigo-200">{user?.role || "Member"}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="px-6 py-8 sm:px-10">
            <div className="flex justify-end mb-6">
              {isEditing ? (
                <div className="space-x-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Bio Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  About
                </h2>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-600">
                    {formData.bio || "No bio yet."}
                  </p>
                )}
              </div>

              {/* Details Section */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{formData.email}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Location
                  </h3>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">
                      {formData.location || "Not specified"}
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Website</h3>
                  {isEditing ? (
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="https://example.com"
                    />
                  ) : formData.website ? (
                    <a
                      href={formData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-indigo-600 hover:text-indigo-500"
                    >
                      {formData.website}
                    </a>
                  ) : (
                    <p className="mt-1 text-gray-900">No website</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Member Since
                  </h3>
                  <p className="mt-1 text-gray-900">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
