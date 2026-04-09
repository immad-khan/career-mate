import SkillRoadmap from "@/components/roadmap/SkillRoadmap"

export default function SkillBotPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">SkillBot & Roadmap</h1>
        <p className="text-gray-500">
          Personalized AI roadmap to help you master the skills needed for your dream role.
        </p>
      </div>
      
      <SkillRoadmap />
    </div>
  )
}
