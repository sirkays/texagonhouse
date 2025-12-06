// // components/TeacherBiodataForm.tsx
// "use client";

// import {useState} from "react";

// interface TeacherBiodataData {
//   firstName: string;
//   lastName: string;
//   phone: string;
//   // address: string;
//   qualifications: string;
//   subjects: string;
//   experienceYears: number;
// }

// export default function TeacherBiodataForm() {
//   const [formData, setFormData] = useState<TeacherBiodataData>({
//     firstName: "",
//     lastName: "",
//     phone: "",
//     // address: "",
//     qualifications: "",
//     subjects: "",
//     experienceYears: 0,
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Simulate API call
//     console.log("Teacher biodata:", formData);
//     alert("Biodata submitted successfully!");
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const value =
//       e.target.name === "experienceYears"
//         ? parseInt(e.target.value) || 0
//         : e.target.value;
//     setFormData({
//       ...formData,
//       [e.target.name]: value,
//     });
//   };

//   return (
//     <div className="mt-8 space-y-6">
//       <h3 className="text-lg font-medium text-gray-900">Teacher Biodata</h3>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label
//             htmlFor="qualifications"
//             className="block text-sm font-medium text-gray-700">
//             Qualifications
//           </label>
//           <input
//             id="qualifications"
//             name="qualifications"
//             type="text"
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
//             placeholder="e.g., B.Ed, M.Sc"
//             value={formData.qualifications}
//             onChange={handleChange}
//           />
//         </div>

//         {/* Should be multiple selection */}
//         <div>
//           <label
//             htmlFor="subjects"
//             className="block text-sm font-medium text-gray-700">
//             Subjects Taught
//           </label>
//           <input
//             id="subjects"
//             name="subjects"
//             type="text"
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
//             placeholder="e.g., Math, Science"
//             value={formData.subjects}
//             onChange={handleChange}
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="experienceYears"
//             className="block text-sm font-medium text-gray-700">
//             Years of Experience
//           </label>
//           <input
//             id="experienceYears"
//             name="experienceYears"
//             type="number"
//             min="0"
//             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
//             value={formData.experienceYears}
//             onChange={handleChange}
//           />
//         </div>
//         <button
//           type="submit"
//           className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#f79771] hover:bg-[#f79771]">
//           Submit Biodata
//         </button>
//       </form>
//     </div>
//   );
// }

"use client";

import {useState} from "react";
import {MultiSelect} from "@/components/ui/multi-select"; // We'll create this next

// Predefined options (you can move these to a separate file or fetch from API)
const subjectOptions = [
  {value: "mathematics", label: "Mathematics"},
  {value: "physics", label: "Physics"},
  {value: "chemistry", label: "Chemistry"},
  {value: "biology", label: "Biology"},
  {value: "english", label: "English"},
  {value: "history", label: "History"},
  {value: "geography", label: "Geography"},
  {value: "computer-science", label: "Computer Science"},
  {value: "economics", label: "Economics"},
  {value: "hindi", label: "Hindi"},
  {value: "sanskrit", label: "Sanskrit"},
  {value: "physical-education", label: "Physical Education"},
];

const qualificationOptions = [
  {value: "b.ed", label: "B.Ed"},
  {value: "m.ed", label: "M.Ed"},
  {value: "b.sc", label: "B.Sc"},
  {value: "m.sc", label: "M.Sc"},
  {value: "b.a", label: "B.A"},
  {value: "m.a", label: "M.A"},
  {value: "phd", label: "PhD"},
  {value: "b.tech", label: "B.Tech"},
  {value: "m.tech", label: "M.Tech"},
  {value: "diploma-in-education", label: "Diploma in Education"},
  {value: "tet", label: "TET Qualified"},
  {value: "ctet", label: "CTET Qualified"},
];

interface TeacherBiodataData {
  firstName: string;
  lastName: string;
  phone: string;
  qualifications: string[]; // Now array
  subjects: string[]; // Now array
  experienceYears: number;
}

export default function TeacherBiodataForm() {
  const [formData, setFormData] = useState<TeacherBiodataData>({
    firstName: "",
    lastName: "",
    phone: "",
    qualifications: [],
    subjects: [],
    experienceYears: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Teacher biodata submitted:", formData);
    alert("Biodata submitted successfully!");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experienceYears" ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <div className="mt-8 space-y-6 max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold text-gray-900">Teacher Biodata Form</h3>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-xl shadow-md">
        {/* Other fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Years of Experience
            </label>
            <input
              type="number"
              name="experienceYears"
              min="0"
              max="50"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              value={formData.experienceYears}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Multi-Select: Qualifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Qualifications <span className="text-red-500">*</span>
          </label>
          <MultiSelect
            options={qualificationOptions}
            selected={formData.qualifications}
            onChange={(values) =>
              setFormData({...formData, qualifications: values})
            }
            placeholder="Select your qualifications..."
          />
        </div>

        {/* Multi-Select: Subjects Taught */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjects You Teach <span className="text-red-500">*</span>
          </label>
          <MultiSelect
            options={subjectOptions}
            selected={formData.subjects}
            onChange={(values) => setFormData({...formData, subjects: values})}
            placeholder="Select subjects you can teach..."
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 px-6 w-full text-white font-semibold bg-[#f79771] hover:bg-[#e67e5b] rounded-lg transition transform hover:scale-105 shadow-lg">
          Submit Biodata
        </button>
      </form>
    </div>
  );
}
