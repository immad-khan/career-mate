import SkillRoadmap from "@/components/roadmap/SkillRoadmap"

export default function SkillRoadmapPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Skill Roadmap</h1>
        <p className="text-gray-500">
          Track your learning progress and master your skills.
        </p>
      </div>
      <SkillRoadmap initialView="roadmap" />
    </div>
  )
}
