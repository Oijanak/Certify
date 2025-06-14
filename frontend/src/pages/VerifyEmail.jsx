import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import EmailVerified from "./EmailVerified";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [countdown, setCountdown] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const [isEmailVerified, setEmailVerified] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus the active input
  useEffect(() => {
    if (inputRefs.current[activeIndex]) {
      inputRefs.current[activeIndex].focus();
    }
  }, [activeIndex]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits

    if (!value) {
      // If backspace was pressed and input is empty
      const newDigits = [...digits];
      newDigits[index] = "";
      setDigits(newDigits);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = value.charAt(0); // Only take first character
    setDigits(newDigits);

    // Move to next input if there's a value
    if (index < 5 && value) {
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      setActiveIndex(index - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    if (pasteData.length === 6) {
      const newDigits = pasteData.split("").slice(0, 6);
      setDigits(newDigits);
      setActiveIndex(5); // Focus the last input
    }
  };

  const handleSubmit = async () => {
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Simulate API call
      const response = await fetch(
        `http://localhost:5000/api/auth/verify-email?email=${email}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
      }
      setEmailVerified(true);
      // Here you would typically redirect or update state
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/send-verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );
      setCountdown(30); // Reset countdown
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    }
  };

  return isEmailVerified ? (
    <EmailVerified />
  ) : (
    <div className=" bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a 6-digit verification code to your email {email}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <div className="flex justify-between space-x-2">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  onFocus={() => setActiveIndex(index)}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className={`w-12 h-12 text-2xl text-center border-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                    error ? "border-red-300" : "border-gray-300"
                  }`}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
              ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || digits.join("").length !== 6}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting || digits.join("").length !== 6
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>
          </div>

          <div className="mt-4 text-center text-sm">
            <p className="text-gray-600">
              Didn't receive a code?{" "}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0}
                className={`font-medium ${
                  countdown > 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-indigo-600 hover:text-indigo-500"
                }`}
              >
                Resend Code {countdown > 0 && `(${countdown}s)`}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
