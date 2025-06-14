import { useState } from "react";
import {
  AcademicCapIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowPathIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";

const RequestCertificate = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    certificateType: "",
    attachments: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const certificateTypes = [
    "Course Completion",
    "Workshop Attendance",
    "Skill Certification",
    "Program Graduation",
    "Professional Development",
    "Academic Achievement",
    "Extracurricular Participation",
  ];

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
    formData.attachments.forEach((file) => {
      data.append("attachments", file);
    });
    const response = await fetch(
      "http://localhost:5000/api/certificates/request",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      }
    );
    if (!response.ok) {
      console.log("Error");
      return;
    }
    setSubmitSuccess(true);
    console.log(await response.json());
    setIsSubmitting(false);
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-3xl w-full bg-white shadow-xl rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <DocumentTextIcon className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-gray-900">
            Request Submitted Successfully!
          </h2>
          <p className="mt-2 text-gray-600">
            Your certificate request has been received. We'll process it and
            notify you via email.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setSubmitSuccess(false)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit Another Request
            </button>
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
            Certificate Request Form
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Please provide all required information to request your certificate
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
                  {/* Custom Input Field */}
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

                  {/* Custom Select Field */}
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

                  {formData.attachments.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Selected Files
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
                      <DocumentTextIcon className="mr-2 h-5 w-5" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestCertificate;
