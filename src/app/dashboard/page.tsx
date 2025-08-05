import { auth } from "@/lib/auth"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8 text-white">Welcome back, {session?.user?.name || 'User'}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/builder" className="block">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow hover:shadow-lg transition-shadow hover:border-gray-600">
            <h2 className="text-xl font-semibold mb-2 text-white">Visual Builder</h2>
            <p className="text-gray-400 mb-4">Create prompts using drag-and-drop components</p>
            <span className="text-blue-400 font-medium">Start Building →</span>
          </div>
        </Link>

        <Link href="/dashboard/projects" className="block">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow hover:shadow-lg transition-shadow hover:border-gray-600">
            <h2 className="text-xl font-semibold mb-2 text-white">My Projects</h2>
            <p className="text-gray-400 mb-4">View and manage your saved projects</p>
            <span className="text-blue-400 font-medium">View Projects →</span>
          </div>
        </Link>

        <Link href="/dashboard/audio" className="block">
          <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow hover:shadow-lg transition-shadow hover:border-gray-600">
            <h2 className="text-xl font-semibold mb-2 text-white">Audio Recorder</h2>
            <p className="text-gray-400 mb-4">Record desktop audio for your projects</p>
            <span className="text-blue-400 font-medium">Start Recording →</span>
          </div>
        </Link>
      </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-white">Recent Projects</h2>
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow p-6">
            <p className="text-gray-400">No projects yet. Start by creating your first visual prompt!</p>
          </div>
        </div>
      </div>
    </div>
  )
}