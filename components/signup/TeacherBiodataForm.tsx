// components/TeacherBiodataForm.tsx
"use client";

import {useState} from "react";

interface TeacherBiodataData {
  firstName: string;
  lastName: string;
  phone: string;
  // address: string;
  qualifications: string;
  subjects: string;
  experienceYears: number;
}

export default function TeacherBiodataForm() {
  const [formData, setFormData] = useState<TeacherBiodataData>({
    firstName: "",
    lastName: "",
    phone: "",
    // address: "",
    qualifications: "",
    subjects: "",
    experienceYears: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    console.log("Teacher biodata:", formData);
    alert("Biodata submitted successfully!");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.name === "experienceYears"
        ? parseInt(e.target.value) || 0
        : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Teacher Biodata</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* <div>
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700">
            Phone Number (Optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.phone}
            onChange={handleChange}
          />
        </div> */}
        {/* <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.address}
            onChange={handleChange}
          />
        </div> */}
        <div>
          <label
            htmlFor="qualifications"
            className="block text-sm font-medium text-gray-700">
            Qualifications
          </label>
          <input
            id="qualifications"
            name="qualifications"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., B.Ed, M.Sc"
            value={formData.qualifications}
            onChange={handleChange}
          />
        </div>

        {/* Should be multiple selection */}
        <div>
          <label
            htmlFor="subjects"
            className="block text-sm font-medium text-gray-700">
            Subjects Taught
          </label>
          <input
            id="subjects"
            name="subjects"
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="e.g., Math, Science"
            value={formData.subjects}
            onChange={handleChange}
          />
        </div>
        <div>
          <label
            htmlFor="experienceYears"
            className="block text-sm font-medium text-gray-700">
            Years of Experience
          </label>
          <input
            id="experienceYears"
            name="experienceYears"
            type="number"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            value={formData.experienceYears}
            onChange={handleChange}
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#f79771] hover:bg-[#f79771]">
          Submit Biodata
        </button>
      </form>
    </div>
  );
}
