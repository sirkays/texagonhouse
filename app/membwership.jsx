"use client";

import FormInput from "@/components/FormInput";
import Loader from "@/components/Loader";
import {useFormHandler} from "@/hooks/use-form-handler";
import {useEffect, useRef, useState} from "react";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function MembershipPage() {
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [planError, setPlanError] = useState(null);

  const submitMembershipApplication = async (formData) => {
    console.log("Submitting membership application:", formData);
    try {
      const response = await fetch("/api/membership", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(formData),
        cache: "no-store",
      });
      const result = await response.json();
      console.log("Submission response:", result);
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application");
      }
      return result;
    } catch (error) {
      console.error("Submission error:", error.message);
      throw error;
    }
  };

  const {
    formData,
    handleChange,
    handleSubmit,
    errors,
    isSubmitting,
    submitSuccess,
  } = useFormHandler(
    {
      full_name: "",
      email: "",
      phone: "",
      plan_id: "",
      attachments: null,
      notes: "",
    },
    submitMembershipApplication
  );

  const pageRef = useRef(null);
  const benefitsRef = useRef([]);
  const eligibilityRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log("Fetching membership plans from /api/membership");
        const response = await fetch("/api/membership", {cache: "no-store"});
        if (!response.ok) {
          throw new Error("Failed to fetch membership plans");
        }
        const result = await response.json();
        console.log("Membership plans received:", result.plans);
        setMembershipPlans(result.plans);
        setLoadingPlans(false);
      } catch (error) {
        console.error("Fetch plans error:", error.message);
        setPlanError(error.message);
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    if (!pageRef.current) return; // Prevent running if pageRef is null

    const ctx = gsap.context(() => {
      const h1 = pageRef.current.querySelector("h1");
      if (h1) {
        gsap.from(h1, {
          opacity: 0,
          y: -50,
          duration: 0.8,
          ease: "power3.out",
        });
      }

      if (benefitsRef.current.length > 0) {
        gsap.from(benefitsRef.current, {
          opacity: 0,
          y: 50,
          stagger: 0.2,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: benefitsRef.current[0],
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      if (eligibilityRef.current) {
        gsap.from(eligibilityRef.current, {
          opacity: 0,
          y: 50,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: eligibilityRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }

      if (formRef.current) {
        gsap.from(formRef.current.children, {
          opacity: 0,
          y: 30,
          stagger: 0.1,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, [membershipPlans]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fileUrls = files.map((file) => `/uploads/${file.name}`);
    handleChange({target: {name: "attachments", value: fileUrls.join(",")}});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name) newErrors.full_name = "Name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid.";
    if (!formData.plan_id) newErrors.plan_id = "Membership plan is required.";
    if (!formData.notes) newErrors.notes = "Notes are required.";
    return newErrors;
  };

  const onSubmit = async (e) => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      console.error("Validation errors:", validationErrors);
      return;
    }
    handleSubmit(e);
  };

  if (loadingPlans) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading plans...
      </div>
    );
  }

  if (planError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error: {planError}
      </div>
    );
  }

  return (
    <div ref={pageRef} className="container mx-auto px-4 py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-12">
        Membership
      </h1>

      <section className="mb-16 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-primary mb-6">
          Membership Categories & Benefits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {membershipPlans.map((plan, index) => (
            <div
              key={plan.id}
              ref={(el) => (benefitsRef.current[index] = el)}
              className="border border-gray-200 p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {plan.name.toUpperCase()}
              </h3>
              {/* <p className="text-gray-600 mb-3">{plan.description}</p> */}
              <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
                {plan.benefits.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>
              <p className="text-gray-700 mt-3">
                {/* {plan.price} {plan.currency} / {plan.billing_period} */}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        ref={eligibilityRef}
        className="mb-16 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-primary mb-6">
          Eligibility Criteria
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>Individual Membership:</strong> Open to professionals and
            enthusiasts in technology-related fields.
          </li>
          <li>
            <strong>Corporate Membership:</strong> Available for companies and
            organizations looking to empower their teams.
          </li>
          <li>
            <strong>Student Membership:</strong> Requires valid student ID from
            an accredited educational institution.
          </li>
          <li>Adherence to CIDET's code of conduct and ethical guidelines.</li>
        </ul>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-primary mb-6">
          Membership Application Form
        </h2>
        <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
          <FormInput
            label="Full Name"
            id="full_name"
            type="text"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={handleChange}
            error={errors.full_name}
            required
          />
          <FormInput
            label="Email Address"
            id="email"
            type="email"
            placeholder="john.doe@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <FormInput
            label="Phone Number"
            id="phone"
            type="tel"
            placeholder="(123) 456-7890"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="Additional information or comments"
              value={formData.notes}
              onChange={handleChange}
              required
              rows={4}
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="plan_id"
              className="block text-sm font-medium text-gray-700 mb-1">
              Membership Plan
            </label>
            <select
              id="plan_id"
              name="plan_id"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              value={formData.plan_id}
              onChange={handleChange}
              required>
              <option value="">Select a plan</option>
              {membershipPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
            {errors.plan_id && (
              <p className="mt-1 text-sm text-red-600">{errors.plan_id}</p>
            )}
          </div>
          <FormInput
            label="Upload Supporting Documents (e.g., Resume, Student ID)"
            id="attachments"
            type="file"
            onChange={handleFileChange}
            multiple
            error={errors.attachments}
          />
          {isSubmitting && <Loader message="Submitting your application..." />}
          {submitSuccess && (
            <p className="text-green-600 text-center font-semibold">
              Application submitted successfully!
            </p>
          )}
          {errors.submit && (
            <p className="text-red-600 text-center font-semibold">
              {errors.submit}
            </p>
          )}
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </section>
    </div>
  );
}
