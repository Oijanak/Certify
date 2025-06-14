import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowPathIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

export default function RegisterForm() {
  const { allowedDomains, courses } = useLoaderData();
  const navigate = useNavigate();
  const [publicAddress, setPublicAddress] = useState("");
  const [isMetamaskInstalled, setIsMetamaskInstalled] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      setIsMetamaskInstalled(true);
    }
  }, []);

  const connectMetamask = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setPublicAddress(accounts[0]);
      window.ethereum.on("accountsChanged", ([newAccount]) => {
        setPublicAddress(newAccount);
      });
    } catch (error) {
      setError(error.message);
    }
  };

  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    rollNo: yup.string().required("Roll number is required"),
    email: yup
      .string()
      .email("Invalid email")
      .required("Email is required")
      .test(
        "Must be institute email",
        "Email should be student email",
        (value) => {
          const domain = value.split("@")[1];
          return allowedDomains.includes(domain);
        }
      ),
    course: yup.string().required("Course is required"),
    publicAddress: yup.string().required("Metamask address is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (publicAddress) {
      setValue("publicAddress", publicAddress);
    }
  }, [publicAddress, setValue]);

  const onSubmit = async (data) => {
    setIsLoading(true); // Set loading to true when submission starts
    setError("");
    const { name, rollNo, email, password, course, publicAddress } = data;
    const newData = {
      name,
      rollNo,
      email,
      password,
      course,
      publicAddress,
      course,
    };

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        const errorData = await response.json();

        console.log(errorData);
        setError(errorData.message);
        return;
      }
      const result = await response.json();

      console.log("Registration successful:", result);
      navigate(`/verify-email?email=${email}`);
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }

    reset();
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        {" "}
        {/* Increased max width */}
        <div className="sm:mx-auto sm:w-full">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="#"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to your existing account
            </a>
          </p>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full">
          <div className="bg-white py-8 px-8 shadow sm:rounded-lg">
            {" "}
            {error && (
              <div className="mb-4 mx-auto max-w-md rounded-md bg-red-100 border border-red-100 px-4 py-3 text-red-700 flex items-center space-x-2 shadow-sm">
                <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
            {/* Increased padding */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {" "}
                {/* Grid layout for two columns */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      {...register("name")}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.name ? "border-red-300" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="rollNo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Roll Number
                  </label>
                  <div className="mt-1">
                    <input
                      id="rollNo"
                      name="rollNo"
                      type="text"
                      autoComplete="off"
                      {...register("rollNo")}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.rollNo ? "border-red-300" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.rollNo && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.rollNo.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      {...register("email")}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.email ? "border-red-300" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="course"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Course
                  </label>
                  <div className="mt-1">
                    <select
                      id="course"
                      defaultValue=""
                      name="course"
                      {...register("course")}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.course ? "border-red-300" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    >
                      <option value="" disabled hidden>
                        Select a course
                      </option>
                      {courses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                    {errors.course && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.course.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="publicAddress"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Metamask Wallet Address
                  </label>
                  <div className="mt-1 flex">
                    <input
                      id="publicAddress"
                      name="publicAddress"
                      type="text"
                      readOnly
                      value={publicAddress}
                      {...register("publicAddress")}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.publicAddress
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    <button
                      type="button"
                      onClick={connectMetamask}
                      disabled={!isMetamaskInstalled}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                    >
                      Connect
                    </button>
                  </div>
                  {errors.publicAddress && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.publicAddress.message}
                    </p>
                  )}
                  {!isMetamaskInstalled && (
                    <p className="mt-2 text-sm text-red-600">
                      Metamask is not installed. Please install it first.
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      {...register("password")}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.password ? "border-red-300" : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      {...register("confirmPassword")}
                      className={`appearance-none block w-full px-3 py-2 border ${
                        errors.confirmPassword
                          ? "border-red-300"
                          : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function loader() {
  const response = await fetch("http://localhost:5000/api/auth/email");

  const data = await response.json();
  console.log(data);

  return data;
}
