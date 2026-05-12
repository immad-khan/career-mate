"use client"

import { useState, useEffect } from "react"
import { FiTrendingUp, FiArrowRight, FiRefreshCw, FiAlertCircle, FiActivity, FiGlobe, FiBriefcase, FiZap, FiChevronDown, FiAlertTriangle } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { marketTrendsAPI } from "@/lib/api"
import Button from "@/components/ui/button"

interface MarketTrendData {
  field: string
  demand_level: string
  demand_trend: string
  top_skills: {
    name: string
    category: string
    popularity_score: number
    trend: "Rising" | "Stable" | "Emerging"
  }[]
  demand_over_time: { month: string; value: number }[]
  market_growth: {
    twelve_month_growth: string
    remote_percentage: string
  }
  skill_gaps: { name: string; gap_level: number }[]
  top_employers: { name: string; open_roles: string }[]
  summary: string
  data_source: string
}

const SUPPORTED_FIELDS = [
  "Software Development",
  "Data Science",
  "Product Design",
  "Cybersecurity",
  "Marketing",
  "Finance",
  "Healthcare",
  "Cloud Computing",
  "AI & Machine Learning"
]

export default function MarketTrends() {
  const [loading, setLoading] = useState(false)
  const [selectedField, setSelectedField] = useState("")
  const [trends, setTrends] = useState<MarketTrendData | null>(null)
  const [isFallback, setIsFallback] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  const handleFetchTrends = async (forceRefresh = false) => {
    if (!selectedField) {
      toast.error("Please select a field to view trends")
      return
    }

    setLoading(true)
    try {
      const apiCall = forceRefresh ? marketTrendsAPI.refreshTrends : marketTrendsAPI.fetchTrends
      const response = await apiCall(selectedField)
      
      if (response.success) {
        setTrends(response.data)
        setIsFallback(response.is_fallback || false)
        setUpdatedAt(response.updated_at)
        if (response.is_fallback) {
          toast(response.message || "Live update unavailable. Displaying last saved trends", {
            icon: '⚠️',
            style: { borderRadius: '10px', background: '#333', color: '#fff' }
          })
        } else {
          toast.success("Trends updated successfully")
        }
      } else {
        toast.error(response.message || "No trends available for the selected field")
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch market trends")
    } finally {
      setLoading(false)
    }
  }

  // Helper to render SVG Line Chart
  const LineChart = ({ data }: { data: { month: string; value: number }[] }) => {
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-400 text-sm">Data unavailable</div>
    
    const width = 600
    const height = 250
    const padding = 40
    const maxValue = Math.max(...data.map(d => d.value), 100)
    
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding
      const y = height - ((d.value / maxValue) * (height - padding * 2) + padding)
      return `${x},${y}`
    }).join(" ")

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill Area */}
        <path
          d={`M ${padding},${height} L ${points} L ${width - padding},${height} Z`}
          fill="url(#chartGradient)"
        />
        {/* Main Line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Nodes */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (width - padding * 2) + padding
          const y = height - ((d.value / maxValue) * (height - padding * 2) + padding)
          return (
            <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />
          )
        })}
        {/* Axis Labels */}
        {data.map((d, i) => {
          if (i % 2 !== 0) return null
          const x = (i / (data.length - 1)) * (width - padding * 2) + padding
          return (
            <text key={i} x={x} y={height + 20} textAnchor="middle" fontSize="12" fill="#9ca3af" fontWeight="500">{d.month}</text>
          )
        })}
      </svg>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <AnimatePresence mode="wait">
        {!trends ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <FiZap className="animate-pulse" /> Live job market signals
              </div>
              
              <div className="space-y-6">
                <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Explore Live Job <br /> <span className="text-emerald-500">Market Trends</span>
                </h1>
                <p className="text-gray-500 text-xl font-medium max-w-md leading-relaxed">
                  Stay updated with the most in-demand skills in your industry. Powered by real data.
                </p>
              </div>

              <div className="space-y-8 max-w-md">
                <div className="relative">
                  <span className="block text-sm font-bold text-slate-900 mb-3">Select your field</span>
                  <div className="relative group">
                    <select
                      value={selectedField}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="w-full appearance-none bg-white border-2 border-gray-100 rounded-2xl px-6 py-5 text-gray-700 font-bold text-lg focus:border-emerald-500 transition-all cursor-pointer outline-none shadow-sm group-hover:border-gray-200"
                    >
                      <option value="" disabled>Choose your industry...</option>
                      {SUPPORTED_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors pointer-events-none w-6 h-6" />
                  </div>
                  <p className="mt-3 text-xs text-gray-400 font-medium">
                    Examples: Software Development, Data Science, Product Design, Cybersecurity, Marketing
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <Button
                    onClick={() => handleFetchTrends()}
                    isLoading={loading}
                    className="h-16 px-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-500/20 group gap-3 whitespace-nowrap"
                  >
                    <FiGlobe className="w-6 h-6" />
                    Show Market Trends
                  </Button>
                  <p className="text-xs text-gray-400 font-medium max-w-[180px] leading-relaxed">
                    We scan recent job postings to surface skills that are gaining momentum.
                  </p>
                </div>

                <div className="pt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trending across roles</p>
                    <div className="flex flex-wrap gap-2">
                        {["AI", "Cloud", "UI/UX", "Python", "Cybersecurity"].map(tag => (
                            <span key={tag} className="px-4 py-2 bg-gray-50 text-gray-500 rounded-xl text-xs font-bold border border-gray-100 hover:bg-white hover:border-emerald-200 hover:text-emerald-500 transition-all cursor-default">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block pr-8">
                <div className="absolute -inset-10 bg-emerald-500/10 blur-[120px] rounded-full"></div>
                <div className="relative bg-[#f8fffb] border border-emerald-100/50 rounded-[40px] p-6 shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">Sample insights dashboard</span>
                        <div className="flex gap-2">
                             {["24h", "7d", "30d"].map(t => (
                                 <div key={t} className="px-2 py-1 text-[10px] font-bold text-gray-400 bg-white border border-gray-100 rounded-md">{t}</div>
                             ))}
                        </div>
                    </div>
                    <div className="bg-slate-900 rounded-[32px] p-6 aspect-[4/3] relative shadow-inner overflow-hidden">
                         <div className="grid grid-cols-2 gap-4 h-full">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="bg-white/5 rounded-2xl border border-white/10 p-4 flex flex-col justify-between">
                                     <div className="w-1/2 h-1.5 bg-white/20 rounded-full mb-4"></div>
                                     <div className="flex items-end gap-1 flex-1">
                                          {[40, 70, 50, 90, 60, 80, 40].map((h, j) => (
                                              <div key={j} className="flex-1 bg-emerald-500/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                          ))}
                                     </div>
                                </div>
                            ))}
                         </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center text-[10px] font-black text-emerald-800 uppercase tracking-wider">
                        <span>Most in-demand: Backend, AI, Cloud</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Updated in real time</span>
                    </div>
                </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/50 backdrop-blur-sm p-6 rounded-[32px] border border-gray-100">
               <div className="space-y-2">
                  <div className="flex items-center gap-x-3 mb-1">
                    <span className="text-sm font-bold text-gray-400">Field selected</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <h2 className="text-4xl font-black text-slate-900">{trends.field}</h2>
                    <span className="px-4 py-1.5 bg-[#0a4d29] text-white text-xs font-black uppercase rounded-full shadow-lg shadow-emerald-900/10">
                        {trends.demand_level} · {trends.demand_trend}
                    </span>
                    <button 
                        onClick={() => handleFetchTrends(true)} 
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-emerald-500 hover:border-emerald-200 transition-all shadow-sm"
                        title="Refresh Data"
                    >
                        <FiRefreshCw className={loading ? "animate-spin" : ""} />
                    </button>
                  </div>
               </div>
               <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last updated</p>
                    <p className="text-sm font-black text-gray-900">{updatedAt ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</p>
                  </div>
                  <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                     <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-0.5">Live Scan</p>
                     <p className="text-xs font-bold text-emerald-600">Scanning 12k+ recent postings</p>
                  </div>
               </div>
            </div>

            {/* Fallback Warning */}
            {isFallback && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-center gap-4 text-amber-800"
              >
                <div className="bg-amber-100 p-3 rounded-2xl">
                    <FiAlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                    <p className="text-sm font-black">Live update unavailable</p>
                    <p className="text-xs font-bold opacity-80">Displaying last saved trends from {updatedAt ? new Date(updatedAt).toLocaleString() : 'recently'}.</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Panel: Top Trending Skills */}
              <div className="lg:col-span-4 bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 p-8 space-y-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Top Trending Skills</h3>
                        <p className="text-xs font-medium text-gray-400 leading-relaxed max-w-[200px]">
                            Based on change in demand over the last 30 days
                        </p>
                    </div>
                    <div className="bg-[#0a4d29] px-3 py-1.5 rounded-lg text-white text-[10px] font-black uppercase text-center leading-tight">
                        {trends.field}<br/>Development
                    </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">
                        <span>Skill</span>
                        <span>Popularity score</span>
                        <span>Trend</span>
                   </div>
                   
                   {trends.top_skills.map((skill, index) => (
                      <div key={index} className="relative group">
                         <div className="bg-[#0a4d29] rounded-[24px] p-6 flex flex-col gap-4 shadow-xl shadow-emerald-950/20 hover:scale-[1.02] transition-transform cursor-default overflow-hidden">
                            {/* Skill Header */}
                            <div className="flex justify-between items-start z-10">
                                <div>
                                    <h4 className="text-white text-xl font-black mb-1">{skill.name}</h4>
                                    <div className="flex gap-1">
                                        <span className="px-2 py-0.5 bg-white/10 text-[9px] text-emerald-200 font-bold rounded-full uppercase border border-white/10">
                                            {skill.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[9px] font-black uppercase tracking-tighter">Popularity index</p>
                                    <p className="text-white text-lg font-black">{skill.popularity_score}/100</p>
                                </div>
                            </div>
                            
                            {/* Decorative background circle */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                            
                            <div className="flex justify-between items-center z-10">
                                <span className="px-3 py-1 bg-white text-[#0a4d29] text-[10px] font-black rounded-lg uppercase tracking-wider">
                                    {skill.trend}
                                </span>
                                <div className="flex gap-1">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= (skill.popularity_score / 20) ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                    ))}
                                </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              </div>

              {/* Middle Panel: Charts */}
              <div className="lg:col-span-5 space-y-8">
                 <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 p-8 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Demand Trend (Last 12 Months)</h3>
                            <p className="text-xs font-medium text-gray-400">Demand index across recent months for your selected field.</p>
                        </div>
                        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                            {["3m", "6m", "12m"].map(t => (
                                <button key={t} className={`px-4 py-2 text-[10px] font-black rounded-xl uppercase transition-all ${t === "12m" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                                    {t === "12m" ? "12 Months" : t.replace("m", " Months")}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Demand index</div>
                        <div className="relative flex-1 bg-emerald-50/20 rounded-[32px] border-2 border-dashed border-emerald-100 p-8 flex flex-col justify-center min-h-[300px]">
                            <LineChart data={trends.demand_over_time} />
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-900 rounded-[32px] text-white">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">12-month growth</p>
                           <div className="flex items-center gap-3">
                               <p className="text-3xl font-black">{trends.market_growth.twelve_month_growth}</p>
                               <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase">Rising</div>
                           </div>
                        </div>
                        <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100">
                           <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-2">Remote roles</p>
                           <p className="text-3xl font-black text-slate-900">{trends.market_growth.remote_percentage}</p>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Right Panel: Growth & Employers */}
              <div className="lg:col-span-3 space-y-8">
                 {/* Overall Growth */}
                 <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-2">Overall Market Growth</h3>
                    <p className="text-[10px] text-gray-400 font-medium mb-6 leading-relaxed">Year-over-year change in job postings for {trends.field} roles.</p>
                    
                    <div className="space-y-6 px-1">
                        <div>
                            <div className="flex justify-between text-[11px] font-black mb-2">
                                <span className="text-slate-500 uppercase">12-month growth</span>
                                <span className="text-emerald-500">{trends.market_growth.twelve_month_growth}</span>
                            </div>
                            <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: trends.market_growth.twelve_month_growth }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[11px] font-black mb-2">
                                <span className="text-slate-500 uppercase">Remote roles</span>
                                <span className="text-emerald-500">{trends.market_growth.remote_percentage}</span>
                            </div>
                            <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: trends.market_growth.remote_percentage }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Skill Gap */}
                 <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-2">Skill Gap Indicator</h3>
                    <p className="text-[10px] text-gray-400 font-medium mb-6 leading-relaxed">Skills with high demand but relatively low supply from candidates.</p>
                    
                    <div className="space-y-4 px-1">
                        {trends.skill_gaps.map((skill, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-[11px] font-black mb-2">
                                    <span className="text-slate-700">{skill.name}</span>
                                    <span className="text-emerald-500">{skill.gap_level}%</span>
                                </div>
                                <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.gap_level}%` }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* Top Employers */}
                 <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-black text-slate-900 mb-2">Top Employers Hiring</h3>
                    <p className="text-[10px] text-gray-400 font-medium mb-6 leading-relaxed">Companies currently posting the most roles in this field.</p>
                    
                    <div className="space-y-3">
                        {trends.top_employers.map((emp, i) => (
                            <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-transparent hover:border-emerald-200 transition-all cursor-default">
                                <span className="text-[13px] font-bold text-slate-900">{emp.name}</span>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg uppercase tracking-tight">
                                    {emp.open_roles}
                                </span>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
            </div>

            <div className="flex justify-center pt-10">
               <button 
                onClick={() => setTrends(null)}
                className="group flex items-center gap-3 text-sm font-black text-slate-400 hover:text-emerald-500 transition-all"
               >
                 <FiArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Industry Intelligence
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
