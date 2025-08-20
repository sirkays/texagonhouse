"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, BookOpen, Settings, Baby } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  const handleRoleSelection = (role: "student" | "teacher" | "admin" | "parent") => {
    router.push(`/${role}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <GraduationCap className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">TECHXAGON E-Learning Platform</h1>
          <p className="text-xl text-gray-600">Choose your role to continue</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => handleRoleSelection("admin")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                <Settings className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-xl">Admin Portal</CardTitle>
              <CardDescription className="text-sm">
                Manage schools, teachers, students, and system analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• School management</li>
                <li>• User administration</li>
                <li>• System analytics</li>
                <li>• Subscription control</li>
              </ul>
              <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">Enter as Admin</Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => handleRoleSelection("teacher")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Teacher Portal</CardTitle>
              <CardDescription className="text-sm">
                Create content, manage courses, and track student progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• Create CBT tests</li>
                <li>• Upload materials</li>
                <li>• Student analytics</li>
                <li>• Content library</li>
              </ul>
              <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">Enter as Teacher</Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => handleRoleSelection("student")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Student Portal</CardTitle>
              <CardDescription className="text-sm">
                Access courses, take tests, and track your learning progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• Interactive learning</li>
                <li>• CBT test taking</li>
                <li>• Progress tracking</li>
                <li>• Gamification</li>
              </ul>
              <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Enter as Student</Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
            onClick={() => handleRoleSelection("parent")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                <Baby className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Parent Portal</CardTitle>
              <CardDescription className="text-sm">
                Monitor children's progress and manage their learning journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-xs text-gray-600">
                <li>• Child progress tracking</li>
                <li>• Payment management</li>
                <li>• Tutoring booking</li>
                <li>• Rewards monitoring</li>
              </ul>
              <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">Enter as Parent</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
