import SkillRoadmap from "@/components/roadmap/SkillRoadmap"

export default function SkillBotPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">SkillBot</h1>
        <p className="text-gray-500">
          Tell SkillBot your target role, and it will build your career path.
        </p>
      </div>
      
      {/* Force setup view for the generator page */}
      <SkillRoadmap initialView="setup" />
    </div>
  )
}
