import React from 'react'
import { FiZap, FiUsers, FiShield, FiClock } from 'react-icons/fi'

const stats = [
  { icon: FiZap, number: '100%', label: 'Responsive UI', sub: 'Every screen size' },
  { icon: FiShield, number: '1-Click', label: 'Fast Apply', sub: 'Simple application' },
  { icon: FiUsers, number: '100%', label: 'Free Access', sub: 'No hidden fees' },
  { icon: FiClock, number: '24/7', label: 'Always On', sub: 'Browse anytime' },
]

const Statistics = () => {
  return (
    <div className="w-full bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-700 py-14 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 text-white">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={i}
                className={`flex flex-col items-center lg:items-start text-center lg:text-left py-2 ${
                  i < 3 ? 'lg:border-r lg:border-white/20 lg:pr-12' : ''
                } ${i > 0 ? 'lg:pl-12' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                  <Icon className="text-white text-lg" />
                </div>
                <p className="text-3xl font-extrabold tracking-tight">{stat.number}</p>
                <p className="text-white font-bold mt-0.5 text-sm">{stat.label}</p>
                <p className="text-white/60 text-xs font-medium mt-0.5">{stat.sub}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Statistics