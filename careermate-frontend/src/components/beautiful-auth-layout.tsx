"use client"

import type React from "react"
import { useEffect, useState } from "react"
import Logo from "@/components/shared/Logo"
import Image, { type StaticImageData } from "next/image"
import greenPic from "../greenpic.png"

interface BeautifulAuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  image?: StaticImageData
}

export default function BeautifulAuthLayout({ children, title, subtitle, image = greenPic }: BeautifulAuthLayoutProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-stretch justify-center lg:p-0">
      {/* Background mixture: Light and Green ambient glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Subtle background image for mobile to use full height */}
          <div className="lg:hidden absolute inset-0 opacity-10">
            <Image src={image} alt="" fill className="object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <div className="flex w-full min-h-screen relative z-10">
        {/* Left Side - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden h-screen sticky top-0 border-r border-white/5">
             <Image 
                src={image} 
                alt="CareerMate background" 
                fill 
                className="object-cover object-[center_33%] transition-transform duration-[40s] ease-linear hover:scale-105" 
                priority
             />
             {/* Strong right fade for transition */}
             <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black" />
             
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
             
             <div className="absolute bottom-12 left-12 right-12 space-y-4">
                 <div className="inline-block p-1 mb-4">
                     <Logo size="md" />
                 </div>
                 <h1 className="text-6xl font-bold uppercase tracking-tighter leading-[0.9] text-white italic">
                     Build Your <br />
                     <span className="text-primary font-bold">Professional</span> <br /> 
                     Future
                 </h1>
                 <p className="text-gray-400 max-w-md font-bold text-sm uppercase tracking-widest opacity-80 border-l-4 border-primary pl-4 mt-8">
                     Advanced AI-powered career companion for next-gen leaders.
                 </p>
             </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-16 relative">
          <div
            className="w-full max-w-md transform transition-all duration-1000"
            style={{
              opacity: isLoaded ? 1 : 0,
              transform: isLoaded ? "translateY(0)" : "translateY(40px)",
            }}
          >
            {/* Mobile/Tablet Logo */}
            <div className="lg:hidden mb-12 flex justify-center">
              <div className="inline-block p-1">
                <Logo size="lg" />
              </div>
            </div>

            {/* Header Data */}
            <div className="mb-10 text-center lg:text-left space-y-2">
                <h2 className="text-4xl font-bold uppercase tracking-tight text-white">{title}</h2>
                {subtitle && (
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-primary flex-1 hidden lg:block" />
                    <p className="text-primary font-bold text-[10px] uppercase tracking-widest">{subtitle}</p>
                  </div>
                )}
            </div>

            {/* Card Container */}
            <div className="relative group">
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-primary/20 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                {children}
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center">
                <div className="flex items-center gap-1 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm" />
                  <span className="text-gray-500 text-[8px] font-bold uppercase tracking-widest">Secure Authentication</span>
                </div>
                <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest text-center">
                    CareerMate Intelligence Framework
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
