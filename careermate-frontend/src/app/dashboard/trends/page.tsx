import MarketTrends from "@/components/market-trends/MarketTrends"

export default function MarketTrendsPage() {
  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Portfolio & Market Trends</h1>
        <p className="text-gray-500">
          Get real-time insights into job market demand, trending skills, and top employers.
        </p>
      </div>
      
      <MarketTrends />
    </div>
  )
}
