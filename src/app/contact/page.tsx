"use client";

import { useState } from "react";
import BreadcrumbNav from "@/components/BreadcrumbNav";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with form backend (Formspree, etc.)
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <BreadcrumbNav items={[{ label: "Contact" }]} />

      <div className="mt-8">
        <h1 className="text-4xl font-bold text-navy mb-4">Get in Touch</h1>
        <p className="text-lg text-warm-gray mb-8">
          Have a question about cyber insurance for your agency? Want to suggest
          a provider for us to review? We’d love to hear from you.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="md:col-span-2">
            {submitted ? (
              <div className="bg-teal/10 border border-teal/30 rounded-xl p-8 text-center">
                <svg
                  className="w-12 h-12 text-teal mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-xl font-bold text-navy mb-2">
                  Message Sent!
                </h2>
                <p className="text-warm-gray">
                  Thanks for reaching out. We’ll get back to you within 1-2
                  business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-navy mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-navy mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
                      placeholder="you@agency.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-navy mb-1"
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal bg-white"
                  >
                    <option>General Question</option>
                    <option>Provider Review Request</option>
                    <option>Content Suggestion</option>
                    <option>Partnership Inquiry</option>
                    <option>Bug Report</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-navy mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal resize-y"
                    placeholder="Tell us what’s on your mind..."
                  />
                </div>

                <button
                  type="submit"
                  className="px-8 py-3 bg-teal text-white font-semibold rounded-lg hover:bg-teal-dark transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-warm-gray-lightest rounded-xl p-6">
              <h3 className="font-bold text-navy mb-3">Response Time</h3>
              <p className="text-sm text-warm-gray">
                We typically respond within 1-2 business days. For urgent
                matters, please mention it in your subject line.
              </p>
            </div>

            <div className="bg-warm-gray-lightest rounded-xl p-6">
              <h3 className="font-bold text-navy mb-3">Important Note</h3>
              <p className="text-sm text-warm-gray">
                We’re not licensed insurance brokers or advisors. We can’t
                provide personalized insurance recommendations. For specific
                policy advice, please consult a licensed insurance professional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
