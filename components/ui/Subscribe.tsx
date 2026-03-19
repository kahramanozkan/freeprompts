"use client";

import { useState } from "react";
import { subscribersApi } from "@/lib/supabase-queries";

export default function Subscribe() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    if (!validateEmail(email)) {
      setMessage("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (!acceptTerms) {
      setMessage("Please accept the terms and conditions.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if email already exists
      const exists = await subscribersApi.emailExists(email);
      if (exists) {
        setMessage("This email is already subscribed. Please check your inbox.");
        setIsSubmitting(false);
        return;
      }

      // Subscribe the user
      await subscribersApi.create(email, acceptTerms);
      setMessage("Thanks for subscribing!");
      setEmail("");
      setAcceptTerms(false);
    } catch (error) {
      console.error("Error subscribing:", error);
      let errorMessage = "Failed to subscribe. Please try again.";

      try {
        if (error && typeof error === 'object') {
          if ('message' in error) {
            errorMessage = `Failed to subscribe: ${(error as any).message}`;
          } else if ('error' in error && error.error && typeof error.error === 'object' && 'message' in error.error) {
            errorMessage = `Failed to subscribe: ${(error.error as any).message}`;
          }
        }
      } catch (parseError) {
        // Keep default error message
      }

      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-semibold text-black mb-4">
          Get New Free Copy-Paste Prompts Weekly
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Subscribe to receive the latest free copy&paste AI prompts directly in your inbox.
        </p>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-black text-sm"
              />
              <button
                type="submit"
                disabled={isSubmitting || !acceptTerms || !email}
                className="px-6 py-2 bg-yellow-100 text-gray-800 text-sm rounded-md hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "..." : "Subscribe"}
              </button>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="text-left">
              <div className="flex gap-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <label htmlFor="acceptTerms" className="text-xs text-gray-600 leading-relaxed">
                  I accept the{" "}
                  <a href="/terms" className="text-black hover:underline">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-black hover:underline">
                    Privacy Policy
                  </a>
                  , and I agree to receive newsletters and updates.
                </label>
              </div>
            </div>

            {message && (
              <p className={`text-sm text-left ${message.includes('Thanks') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}