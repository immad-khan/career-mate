"use client"

import { useState, useEffect } from "react"
import { FiEdit2, FiRefreshCw, FiBookOpen, FiCheckCircle, FiCircle, FiArrowRight, FiPieChart, FiTrendingUp, FiClock, FiSend, FiMessageSquare } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { roadmapAPI } from "@/lib/api"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"

interface Skill {
  id: string
  name: string
  description: string
  is_completed: boolean
  resources: { name: string; url: string }[]
}

interface Section {
  id: string
  title: string
  description: string
  skills: Skill[]
}

interface Roadmap {
  id: string
  role: string
  level: string
  sections: Section[]
  completion_percentage: number
}

export default function SkillRoadmap({ initialView = "setup" }: { initialView?: "setup" | "roadmap" | "progress" }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [roleInput, setRoleInput] = useState("")
  const [levelInput, setLevelInput] = useState("")
  const [view, setView] = useState<"setup" | "roadmap" | "progress">(initialView)
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [chatHistory, setChatHistory] = useState<{message: string, response: string}[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    fetchActiveRoadmap()
  }, [])

  const fetchActiveRoadmap = async () => {
    setLoading(true)
    try {
      const response = await roadmapAPI.getRoadmaps()
      if (response.success && response.data.length > 0) {
        setRoadmap(response.data[0])
        if (initialView === "roadmap") setView("roadmap")
      } else {
        if (initialView === "roadmap") setView("setup")
      }
    } catch (error) {
      console.error("Failed to fetch roadmap", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!roleInput) {
      toast.error("Please enter a valid role to proceed")
      return
    }
    if (!levelInput) {
      toast.error("Please select a learning level to proceed")
      return
    }
    setGenerating(true)
    try {
      const response = await roadmapAPI.generateRoadmap({ role: roleInput, level: levelInput })
      if (response.success) {
        setRoadmap(response.data)
        toast.success("Roadmap generated successfully!")
        router.push("/dashboard/roadmap")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate roadmap")
    } finally {
      setGenerating(false)
    }
  }

  const toggleSkill = async (skillId: string, currentStatus: boolean) => {
    if (!roadmap) return
    try {
      const response = await roadmapAPI.updateSkillProgress(roadmap.id, {
        skill_id: skillId,
        is_completed: !currentStatus
      })
      if (response.success) {
        const updatedRoadmap = { ...roadmap }
        updatedRoadmap.sections = updatedRoadmap.sections.map(section => ({
          ...section,
          skills: section.skills.map(skill => 
            skill.id === skillId ? { ...skill, is_completed: !currentStatus } : skill
          )
        }))
        
        const allSkills = updatedRoadmap.sections.flatMap(s => s.skills)
        const completed = allSkills.filter(s => s.is_completed).length
        updatedRoadmap.completion_percentage = Math.round((completed / allSkills.length) * 100)
        
        setRoadmap(updatedRoadmap)
        toast.success(currentStatus ? "Marked as incomplete" : "Skill completed!")
      }
    } catch (error) {
      toast.error("Failed to update progress")
    }
  }

  const handleChat = async () => {
    if (!chatMessage.trim()) {
      toast.error("Please enter a valid question")
      return
    }
    setChatLoading(true)
    try {
      const response = await roadmapAPI.skillbotChat({ message: chatMessage })
      if (response.success) {
        setChatHistory([...chatHistory, response.data])
        setChatMessage("")
      }
    } catch (error) {
      toast.error("SkillBot is currently unavailable")
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {view === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center h-[70vh] text-center"
          >
            <div className="bg-primary/10 p-4 rounded-full mb-6">
              <FiTrendingUp className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Let's build your career path</h1>
            <p className="text-gray-600 mb-8 max-w-md">Enter your target role and SkillBot will generate a personalized learning roadmap just for you.</p>
            
            <div className="w-full max-w-md space-y-4">
              <Input
                placeholder="e.g. Frontend Developer"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                className="text-lg py-6"
              />
              <div className="flex gap-4">
                {["beginner", "intermediate", "advanced"].map(l => (
                  <button
                    key={l}
                    onClick={() => setLevelInput(l)}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 capitalize transition-all ${
                      levelInput === l ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500 hover:border-primary/50"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleGenerate}
                isLoading={generating}
                className="w-full py-6 text-lg"
              >
                Assemble path
              </Button>
            </div>
          </motion.div>
        )}

        {view === "roadmap" && roadmap && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role selected</span>
                <div className="mt-2 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <h3 className="font-bold text-gray-900">{roadmap.role}</h3>
                  <p className="text-xs text-primary font-medium">Personalized 6-month roadmap</p>
                </div>
                <div className="mt-4 space-y-2">
                  <Button variant="primary" className="w-full py-2 gap-2" onClick={() => router.push("/dashboard/skillbot")}>
                    <FiEdit2 className="w-4 h-4" /> Edit role
                  </Button>
                  <Button variant="outline" className="w-full py-2 gap-2" onClick={() => router.push("/dashboard/skillbot")}>
                    <FiRefreshCw className="w-4 h-4" /> Start over
                  </Button>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-50 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Skill level</span>
                    <span className="font-semibold capitalize text-gray-900">{roadmap.level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sections</span>
                    <span className="font-semibold text-gray-900">{roadmap.sections.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-semibold text-primary">{roadmap.completion_percentage}%</span>
                  </div>
                </div>
              </div>

              {/* SkillBot Chat Mini */}
              <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <FiMessageSquare className="text-primary w-5 h-5" />
                  <h4 className="font-bold">SkillBot Helper</h4>
                </div>
                <div className="h-40 overflow-y-auto mb-4 space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-700">
                  {chatHistory.length === 0 ? (
                    <p className="text-gray-400 text-xs italic">Ask me anything about your career path!</p>
                  ) : (
                    chatHistory.map((chat, i) => (
                      <div key={i} className="text-xs space-y-1">
                        <p className="text-primary font-medium">Q: {chat.message}</p>
                        <p className="text-gray-300">{chat.response}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full bg-gray-800 border-none rounded-lg py-2 pl-3 pr-10 text-xs focus:ring-1 focus:ring-primary text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  />
                  <button 
                    disabled={chatLoading}
                    onClick={handleChat}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors"
                  >
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Skill roadmap</h2>
                  <p className="text-gray-500 mt-1">Follow each section step-by-step to reach your target role.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  Auto-generated for your role
                </div>
              </div>

              <div className="grid gap-6">
                {roadmap.sections.map((section, idx) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                      <h4 className="font-bold text-gray-900 text-lg">{section.title}</h4>
                      <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">
                        {section.skills.length} skills
                      </span>
                    </div>
                    <div className="p-6 space-y-6">
                      {section.skills.map(skill => (
                        <div key={skill.id} className="space-y-4">
                          <div className="flex items-start justify-between group">
                            <div className="flex gap-4">
                              <button 
                                onClick={() => toggleSkill(skill.id, skill.is_completed)}
                                className={`mt-1 transition-colors ${skill.is_completed ? "text-primary" : "text-gray-300 hover:text-primary"}`}
                              >
                                {skill.is_completed ? <FiCheckCircle className="w-5 h-5" /> : <FiCircle className="w-5 h-5" />}
                              </button>
                              <div>
                                <h5 className={`font-semibold transition-all ${skill.is_completed ? "text-gray-400 line-through" : "text-gray-800"}`}>
                                  {skill.name}
                                </h5>
                                <p className="text-xs text-gray-500 mt-1 max-w-xl">{skill.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`px-2 py-1 rounded text-[10px] font-bold ${
                                skill.is_completed ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-400"
                              }`}>
                                {skill.is_completed ? "COMPLETED" : "0%"}
                              </div>
                              <button 
                                onClick={() => setSelectedSkillId(selectedSkillId === skill.id ? null : skill.id)}
                                className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20 transition-all"
                              >
                                {selectedSkillId === skill.id ? "Hide resources" : "View resources"}
                              </button>
                            </div>
                          </div>
                          
                          {selectedSkillId === skill.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="ml-9 p-4 bg-gray-50 rounded-xl space-y-3"
                            >
                               <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recommended Resources</p>
                               <div className="grid gap-2">
                                {skill.resources.map((res, i) => (
                                  <a 
                                    key={i} 
                                    href={res.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:border-primary/50 transition-all group"
                                  >
                                    <span className="text-sm text-gray-700 font-medium">{res.name}</span>
                                    <FiBookOpen className="text-gray-400 group-hover:text-primary" />
                                  </a>
                                ))}
                                {skill.resources.length === 0 && (
                                  <p className="text-xs text-gray-400 italic">No resources listed for this skill.</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <Button variant="outline" className="gap-2" onClick={() => setView("progress")}>
                  <FiPieChart className="w-4 h-4" /> View full learning progress
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {view === "progress" && roadmap && (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Your Learning Progress</h2>
                <p className="text-gray-500">We've saved your latest answers and updated your roadmap checkpoints.</p>
                <div className="flex gap-4 mt-2 text-xs">
                  <span className="text-gray-400">Role: <span className="text-gray-700 font-medium">{roadmap.role}</span></span>
                  <span className="text-gray-400">Level: <span className="text-gray-700 font-medium">{roadmap.level}</span></span>
                </div>
              </div>
              <div className="flex gap-3">
                 <Button onClick={() => setView("roadmap")}>Continue roadmap</Button>
                 <Button variant="outline">Export progress (PDF)</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Completion */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-2">
                <h4 className="font-bold text-gray-900 mb-6">Overall roadmap completion</h4>
                <div className="flex items-center gap-12">
                   <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * roadmap.completion_percentage / 100)} className="text-primary transition-all duration-1000" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center font-bold">
                        <span className="text-2xl text-gray-900">{roadmap.completion_percentage}%</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Complete</span>
                      </div>
                   </div>
                   <div className="flex-1 space-y-6">
                      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                        <p className="text-sm font-medium text-gray-700">
                          {roadmap.completion_percentage > 0 
                            ? "Great job! You're making steady progress toward your goal." 
                            : "Ready to start? Begin with the foundational skills below."}
                        </p>
                        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                           <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${roadmap.completion_percentage}%` }}></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                           <p className="text-xs text-gray-400">Completed skills</p>
                           <p className="text-xl font-bold text-gray-900">{roadmap.sections.flatMap(s => s.skills).filter(sk => sk.is_completed).length} skills</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                           <p className="text-xs text-gray-400">Current streak</p>
                           <p className="text-xl font-bold text-gray-900">{roadmap.completion_percentage > 0 ? "1 day" : "0 days"}</p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Completed Skills Summary */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm overflow-y-auto max-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-gray-900">Completed skills</h4>
                  <span className="text-xs font-bold text-gray-400">{roadmap.sections.flatMap(s => s.skills).filter(sk => sk.is_completed).length} skills</span>
                </div>
                <div className="space-y-4">
                  {roadmap.sections.flatMap(s => s.skills).filter(sk => sk.is_completed).slice(0, 5).map(skill => (
                    <div key={skill.id} className="flex items-center gap-3">
                      <FiCheckCircle className="text-primary w-4 h-4" />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 leading-none">{skill.name}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{skill.description.substring(0, 40)}...</p>
                      </div>
                    </div>
                  ))}
                  {roadmap.sections.flatMap(s => s.skills).filter(sk => sk.is_completed).length === 0 && (
                     <p className="text-center text-gray-400 text-sm py-4">No skills completed yet.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-bold text-gray-900">Pending skills</h4>
                    <span className="text-xs font-bold text-gray-400">Next focus</span>
                  </div>
                  <div className="space-y-4">
                    {roadmap.sections.flatMap(s => s.skills).filter(sk => !sk.is_completed).slice(0, 3).map((skill, i) => (
                      <div key={skill.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 hover:border-primary/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                              {i + 1}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-gray-800">{skill.name}</p>
                              <p className="text-[10px] text-gray-400">{skill.description.substring(0, 30)}...</p>
                           </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${i === 0 ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                           {i === 0 ? 'UP NEXT' : 'CORE'}
                        </span>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4">What happens next?</h4>
                  <p className="text-sm text-gray-500 mb-6">We've locked in this snapshot. You can keep learning or share your progress with potential employers.</p>
                  <div className="flex flex-col gap-3">
                     <button className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary/5 transition-all text-sm font-medium text-gray-700">
                        <span>Share public profile</span>
                        <FiArrowRight />
                     </button>
                     <button className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-primary/5 transition-all text-sm font-medium text-gray-700">
                        <span>Add to resume</span>
                        <FiArrowRight />
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
