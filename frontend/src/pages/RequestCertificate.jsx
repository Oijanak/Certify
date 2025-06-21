import { useState, useEffect } from "react";
import {
  AcademicCapIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

const RequestCertificate = () => {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    certificateType: "",
    attachments: [],
    existingAttachments: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const certificateTypes = [
    "Course Completion",
    "Mark sheet",
    "Character Certificate",
  ];

  useEffect(() => {
    if (id) {
      // Fetch certificate data if in edit mode
      const fetchCertificate = async () => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/certificates/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) throw new Error("Failed to fetch certificate");
          const data = await response.json();

          // Process documentUrl into existingAttachments array
          const existingFiles = data.documentUrl
            ? data.documentUrl.split(",").map((url) => ({
                filename: url.trim(),
                path: `uploads/certificates/${url.trim()}`,
                _id: url.trim(), // Using filename as a temporary ID
              }))
            : [];

          setFormData({
            title: data.title,
            certificateType: data.certificateType,
            attachments: [],
            existingAttachments: existingFiles,
          });
          setIsEditMode(true);
        } catch (error) {
          console.error("Error fetching certificate:", error);
          navigate("/dashboard");
        }
      };
      fetchCertificate();
    }
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const removeExistingAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      existingAttachments: prev.existingAttachments.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.certificateType)
      newErrors.certificateType = "Certificate type is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setIsSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("certificateType", formData.certificateType);

    // Append new files
    formData.attachments.forEach((file) => {
      data.append("attachments", file);
    });

    // Append existing attachment filenames to keep (without the uploads/certifications/ prefix)
    formData.existingAttachments.forEach((attachment) => {
      if (attachment.filename) {
        data.append("keepAttachments", attachment.filename);
      }
    });

    try {
      const url = isEditMode
        ? `http://localhost:5000/api/certificates/request/${id}`
        : "http://localhost:5000/api/certificates/request";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      setSubmitSuccess(true);
      const result = await response.json();
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-3xl w-full bg-white shadow-xl rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <DocumentTextIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            {isEditMode
              ? "Update Successful!"
              : "Request Submitted Successfully!"}
          </h2>
          <p className="mt-2 text-gray-600">
            {isEditMode
              ? "Your certificate request has been updated successfully."
              : "Your certificate request has been received. We'll process it and notify you via email."}
          </p>
          <div className="mt-6 space-x-4">
            <button
              onClick={() => navigate("/user")}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Dashboard
            </button>
            {!isEditMode && (
              <button
                onClick={() => {
                  setFormData({
                    title: "",
                    certificateType: "",
                    attachments: [],
                    existingAttachments: [],
                  });
                  setSubmitSuccess(false);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Submit Another Request
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <AcademicCapIcon className="mx-auto h-12 w-12 text-indigo-600" />
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {isEditMode
              ? "Update Certificate Request"
              : "Certificate Request Form"}
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            {isEditMode
              ? "Update your certificate request information"
              : "Please provide all required information to request your certificate"}
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 divide-y divide-gray-200"
          >
            <div className="space-y-8">
              {/* Certificate Details */}
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  Certificate Information
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Provide details about the certificate you're requesting
                </p>

                <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Certificate Title *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`block w-full px-4 py-3 rounded-lg border ${
                          errors.title
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        } shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200`}
                        placeholder="Enter certificate title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.title}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label
                      htmlFor="certificateType"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Certificate Type *
                    </label>
                    <div className="relative">
                      <select
                        id="certificateType"
                        name="certificateType"
                        value={formData.certificateType}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-4 py-3 rounded-lg border ${
                          errors.certificateType
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                        } shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 pr-10`}
                        required
                      >
                        <option value="" disabled hidden>
                          Select a certificate type
                        </option>
                        {certificateTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      {errors.certificateType && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.certificateType}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <h2 className="text-xl font-medium text-gray-900">
                  Attachments
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload any supporting documents (ID card, Admit card)
                </p>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supporting Documents
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors duration-200">
                    <div className="space-y-1 text-center">
                      <div className="flex justify-center">
                        <ArrowUpTrayIcon className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </div>
                  </div>

                  {/* Existing attachments */}
                  {formData.existingAttachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Current Attachments
                      </h3>
                      <ul className="space-y-2">
                        {formData.existingAttachments.map((file, index) => (
                          <li
                            key={file._id || index}
                            className="group flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                          >
                            <div className="flex items-center">
                              <DocumentTextIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  {file.filename}
                                </p>
                                <a
                                  href={`http://localhost:5000/${file.path}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-indigo-600 hover:text-indigo-500"
                                >
                                  View file
                                </a>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExistingAttachment(index)}
                              className="text-gray-400 hover:text-red-500 focus:outline-none group-hover:opacity-100 opacity-0 transition-opacity duration-200"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* New attachments */}
                  {formData.attachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        New Files to Upload
                      </h3>
                      <ul className="space-y-2">
                        {formData.attachments.map((file, index) => (
                          <li
                            key={index}
                            className="group flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                          >
                            <div className="flex items-center">
                              <DocumentTextIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                  {file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)}MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-gray-400 hover:text-red-500 focus:outline-none group-hover:opacity-100 opacity-0 transition-opacity duration-200"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-8">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate("/user")}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <ArrowPathIcon className="animate-spin mr-2 h-5 w-5" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isEditMode ? (
                        <>
                          <PencilIcon className="mr-2 h-5 w-5" />
                          Update Request
                        </>
                      ) : (
                        <>
                          <DocumentTextIcon className="mr-2 h-5 w-5" />
                          Submit Request
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
              {errors.submit && (
                <div className="mt-4 text-center text-sm text-red-600">
                  {errors.submit}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestCertificate;
