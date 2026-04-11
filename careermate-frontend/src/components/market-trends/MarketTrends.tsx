"use client"

import { useState, useEffect } from "react"
import { FiTrendingUp, FiArrowRight, FiRefreshCw, FiAlertCircle, FiActivity, FiGlobe, FiBriefcase, FiZap, FiChevronDown, FiAlertTriangle } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { marketTrendsAPI } from "@/lib/api"
import Button from "@/components/ui/Button"
import Image from "next/image"

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
  const [viewCharts, setViewCharts] = useState(true)

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
    if (!data || data.length === 0) return <div className="h-full flex items-center justify-center text-gray-400 text-sm">Data unavailable for visualization</div>
    
    const width = 400
    const height = 150
    const padding = 20
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
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <path
          d={`M ${points.split(" ")[0]} L ${points} L ${width - padding},${height} L ${padding},${height} Z`}
          fill="url(#chartGradient)"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (width - padding * 2) + padding
          const y = height - ((d.value / maxValue) * (height - padding * 2) + padding)
          return (
            <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />
          )
        })}
        {/* X Axis Labels */}
        {data.map((d, i) => {
          if (i % 2 !== 0) return null
          const x = (i / (data.length - 1)) * (width - padding * 2) + padding
          return (
            <text key={i} x={x} y={height + 15} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.month}</text>
          )
        })}
      </svg>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {!trends ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          >
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full text-emerald-600 font-bold text-sm">
                <FiActivity className="animate-pulse" /> Live job market signals
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  Explore Live Job <br /> <span className="text-emerald-500">Market Trends</span>
                </h1>
                <p className="text-gray-500 text-lg max-w-md">
                  Stay updated with the most in-demand skills in your industry. Powered by real Google Trends data.
                </p>
              </div>

              <div className="space-y-6 max-w-md">
                <div className="relative">
                  <span className="absolute left-0 -top-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Select your field</span>
                  <div className="relative group">
                    <select
                      value={selectedField}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="w-full appearance-none bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-gray-700 font-semibold focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all cursor-pointer outline-none"
                    >
                      <option value="" disabled>Choose your industry...</option>
                      {SUPPORTED_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    <FiChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors pointer-events-none" />
                  </div>
                  <p className="mt-3 text-xs text-gray-400 italic">
                    Examples: {SUPPORTED_FIELDS.slice(0, 5).join(", ")}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <Button
                    onClick={() => handleFetchTrends()}
                    isLoading={loading}
                    className="h-16 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 group gap-3"
                  >
                    <FiGlobe className="w-5 h-5" />
                    Show Market Trends
                  </Button>
                  <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                    We scan recent job postings & real search data to surface momentum.
                  </p>
                </div>

                <div className="pt-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Trending across roles</p>
                    <div className="flex flex-wrap gap-2">
                        {["AI", "Cloud", "UI/UX", "Python", "Cybersecurity"].map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-bold border border-gray-100 hover:border-emerald-200 hover:text-emerald-500 transition-all cursor-default">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] rounded-full"></div>
              <div className="relative bg-white border border-gray-100 rounded-3xl p-4 shadow-2xl overflow-hidden">
                 <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Sample insights dashboard</span>
                    <div className="flex gap-1">
                        <span className="w-6 h-1.5 bg-gray-100 rounded-full"></span>
                        <span className="w-6 h-1.5 bg-emerald-500 rounded-full"></span>
                    </div>
                 </div>
                 <div className="relative h-[300px] bg-slate-900 rounded-2xl flex items-center justify-center">
                    {/* Mock dashboard visual */}
                    <div className="grid grid-cols-2 gap-2 w-full p-4">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-28 bg-white/5 rounded-lg border border-white/10 p-2 overflow-hidden">
                                <div className="h-1 w-1/2 bg-white/20 rounded mb-2"></div>
                                <div className="flex items-end gap-1 h-20 pt-4">
                                     {[20, 60, 40, 80, 50, 90, 30].map((h, j) => (
                                         <div key={j} className="flex-1 bg-emerald-500/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                     ))}
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
                 <div className="mt-4 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
                    <span>Most in-demand: Backend, AI, Cloud</span>
                    <span className="flex items-center gap-1"><span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span> Updated in real time</span>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <button 
                        onClick={() => setTrends(null)}
                        className="text-gray-400 hover:text-gray-600 text-sm font-bold flex items-center gap-1"
                    >
                        Field selected
                    </button>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                    <h2 className="text-3xl font-bold text-gray-900">{trends.field}</h2>
                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg">
                        {trends.demand_level} · {trends.demand_trend}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">Real-time data analyzing over 12k+ recent job postings and global searches.</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last updated</p>
                    <p className="text-sm font-bold text-gray-900">{updatedAt ? new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2 mins ago'}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => handleFetchTrends(true)} 
                    isLoading={loading}
                    className="h-12 px-6 rounded-xl border-gray-200 font-bold gap-2 text-sm"
                  >
                    <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
                  </Button>
               </div>
            </div>

            {/* Fallback Warning */}
            {isFallback && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 text-amber-800"
              >
                <div className="bg-amber-100 p-2 rounded-lg">
                    <FiAlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <p className="text-sm font-bold">Live update unavailable</p>
                    <p className="text-xs opacity-80">Displaying last saved trends from {updatedAt ? new Date(updatedAt).toLocaleString() : 'recently'}.</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Panel: Top Trending Skills */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-8">
                <div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">Top Trending Skills</h3>
                   <p className="text-xs text-gray-400">Based on change in demand over the last 30 days in <span className="text-emerald-500 font-bold">{trends.field}</span>.</p>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                        <span>Skill</span>
                        <span>Popularity score</span>
                   </div>
                   {trends.top_skills.map((skill, index) => (
                      <div key={index} className="group cursor-default">
                         <div className="flex justify-between items-end mb-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">{skill.name}</span>
                                <span className="px-2 py-0.5 bg-gray-100 text-[9px] text-gray-500 font-bold rounded-md uppercase">{skill.category}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-gray-400">Popularity index:</span>
                                <span className={index === 0 ? "text-sm font-bold text-emerald-500" : "text-sm font-bold text-gray-700" }>
                                    {skill.popularity_score}/100
                                </span>
                            </div>
                         </div>
                         <div className="relative h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group-hover:border-emerald-200 transition-all">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.popularity_score}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                                className="h-full bg-emerald-500/20 border-r-4 border-emerald-500"
                            />
                            <div className="absolute inset-0 flex items-center justify-between px-4">
                                <span className="text-[10px] font-black text-emerald-700 uppercase">{skill.trend}</span>
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className={`w-1 h-3 rounded-full ${i <= (skill.popularity_score / 20) ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              </div>

              {/* Middle Panel: Charts & Stats */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                 {/* Demand Trend Chart */}
                 <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Demand Trend</h3>
                            <p className="text-xs text-gray-400">Demand index across recent months for your selected field.</p>
                        </div>
                        <div className="flex bg-gray-50 p-1 rounded-xl">
                            {["3m", "6m", "12m"].map(t => (
                                <button key={t} className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase ${t === "12m" ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400"}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative flex-1 min-h-[150px] bg-emerald-50/30 rounded-2xl border border-emerald-100/50 p-6">
                        {viewCharts ? (
                            <LineChart data={trends.demand_over_time} />
                        ) : (
                            <div className="space-y-4 pt-4">
                                <p className="text-sm font-bold text-emerald-800">Visual data summary:</p>
                                <p className="text-xs text-emerald-600 leading-relaxed italic border-l-2 border-emerald-200 pl-4">
                                    {trends.summary}
                                </p>
                            </div>
                        )}
                        <button 
                            onClick={() => setViewCharts(!viewCharts)}
                            className="absolute bottom-4 right-4 text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase underline"
                        >
                            {viewCharts ? 'View text summary' : 'View Graphs'}
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">12-month growth</p>
                           <p className="text-2xl font-black text-emerald-500">{trends.market_growth.twelve_month_growth}</p>
                           <div className="flex items-center gap-1 mt-1">
                               <FiTrendingUp className="text-emerald-500 w-3 h-3" />
                               <span className="text-[10px] font-bold text-emerald-600">Strong Momentum</span>
                           </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Remote roles</p>
                           <p className="text-2xl font-black text-gray-900">{trends.market_growth.remote_percentage}</p>
                           <p className="text-[10px] text-gray-400 mt-1">Global average index</p>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Right Panel: Growth & Employers */}
              <div className="lg:col-span-4 space-y-8">
                 {/* Market Growth Bars */}
                 <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Overall Market Growth</h3>
                    <p className="text-xs text-gray-400 mb-6">Year-over-year change in job postings for <span className="font-bold text-gray-600">{trends.field}</span>.</p>
                    
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-gray-600">12-month growth</span>
                                <span className="text-emerald-500">{trends.market_growth.twelve_month_growth}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: trends.market_growth.twelve_month_growth }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-gray-600">Remote availability</span>
                                <span className="text-emerald-500">{trends.market_growth.remote_percentage}</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: trends.market_growth.remote_percentage }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Skill Gap Indicator */}
                 <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Skill Gap Indicator</h3>
                    <p className="text-xs text-gray-400 mb-6">Skills with high demand but relatively low supply from candidates.</p>
                    
                    <div className="space-y-4">
                        {trends.skill_gaps.map((skill, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-gray-700">{skill.name}</span>
                                    <span className="text-emerald-500 text-[10px]">{skill.gap_level}% gap</span>
                                </div>
                                <div className="h-2 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
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
                 <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Top Employers Hiring</h3>
                    <p className="text-xs text-gray-400 mb-6">Companies currently posting the most roles in this field.</p>
                    
                    <div className="space-y-3">
                        {trends.top_employers.map((emp, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:border-emerald-200 transition-all cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-gray-100 text-emerald-500 font-bold text-xs shadow-sm">
                                        {emp.name[0]}
                                    </div>
                                    <span className="text-xs font-bold text-gray-900">{emp.name}</span>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg">
                                    {emp.open_roles}
                                </span>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
            </div>

            <div className="flex justify-center pt-8">
               <button 
                onClick={() => setTrends(null)}
                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-emerald-500 transition-colors"
               >
                 Change field or industry <FiArrowRight />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
