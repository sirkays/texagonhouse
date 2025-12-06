// app/register/page.tsx
import Link from "next/link";

export default function ChooseRole() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Texagon
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Register as a parent or teacher to get started
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Link href="/register/parent" className="group">
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-all border border-gray-200">
              <div className="text-6xl mb-6">Family</div>
              <h2 className="text-3xl font-bold text-gray-800">I'm a Parent</h2>
              <p className="text-gray-600 mt-3">
                Register yourself and add your children
              </p>
            </div>
          </Link>

          <Link href="/register/teacher" className="group">
            <div className="bg-white rounded-2xl shadow-xl p-10 hover:shadow-2xl transition-all border border-gray-200">
              <div className="text-6xl mb-6">Teacher</div>
              <h2 className="text-3xl font-bold text-gray-800">
                I'm a Teacher
              </h2>
              <p className="text-gray-600 mt-3">
                Join your school and manage classes
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
