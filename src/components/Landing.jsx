import { React } from 'react'
import jobguy from '../assets/jobguy.png'
import { FiMapPin, FiSearch, FiArrowRight } from 'react-icons/fi'
import { FaBriefcase, FaUsers } from 'react-icons/fa'

const Landing = ({ setLocation, setTitle, title, location }) => {

  const scrollToJobs = () => {
    const element = document.getElementById("trending-jobs");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-100 rounded-full blur-3xl opacity-40 -translate-y-32 translate-x-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100 rounded-full blur-3xl opacity-30 translate-y-20 -translate-x-20 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-16 pb-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-6">

        {/* Left Content */}
        <div className="flex-1 flex flex-col items-start text-left max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-4 py-1.5 text-sm font-semibold text-violet-700 mb-6">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            500+ Jobs Available Now
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
            Find Work That <br/>
            <span className="text-violet-600">Fits You.</span>
          </h1>

          <p className="mt-5 text-lg text-slate-500 leading-relaxed font-medium">
            Explore careers, build connections, and grow with companies hiring across Nepal.
          </p>

          {/* Search Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/60 overflow-hidden w-full p-2 gap-2">
            <div className="flex items-center gap-2.5 px-4 py-2.5 flex-1 w-full min-w-0 border-b sm:border-b-0 sm:border-r border-slate-100">
              <FiSearch className="text-slate-400 shrink-0 text-base" />
              <input
                className="w-full min-w-0 outline-none text-slate-800 placeholder:text-slate-400 font-medium text-sm bg-transparent"
                placeholder="Job title or keyword"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2.5 flex-1 w-full min-w-0">
              <FiMapPin className="text-slate-400 shrink-0 text-base" />
              <input
                className="w-full min-w-0 outline-none text-slate-800 placeholder:text-slate-400 font-medium text-sm bg-transparent"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <button
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-all duration-200 shadow-sm shadow-violet-500/30 flex items-center gap-2 justify-center cursor-pointer shrink-0 whitespace-nowrap"
              onClick={scrollToJobs}
            >
              Search <FiArrowRight />
            </button>
          </div>

          {/* Trust Row */}
          <div className="mt-6 flex items-center gap-6 text-sm text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <FaBriefcase className="text-violet-400" />
              <span>1-Click Apply</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <FaUsers className="text-violet-400" />
              <span>1000+ Candidates</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <span>100% Free</span>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative flex-1 flex items-center justify-center min-h-[380px] w-full">
          {/* Glow */}
          <div className="absolute w-72 h-72 bg-violet-200 rounded-full blur-3xl opacity-50" />

          {/* Floating Card 1 - Top Left */}
          <div className="hidden sm:block absolute left-0 top-10 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 px-4 py-3 z-10 min-w-[160px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Match</p>
            <p className="text-sm font-extrabold text-slate-800 mt-1">Frontend Developer</p>
            <div className="flex gap-1.5 mt-2">
              <span className="text-[10px] bg-violet-100 text-violet-700 px-2.5 py-0.5 rounded-full font-bold">React</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold">Remote</span>
            </div>
          </div>

          {/* Floating Card 2 - Bottom Right */}
          <div className="hidden sm:block absolute right-0 bottom-12 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 px-4 py-3 z-10">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hiring Now</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">500+</p>
            <p className="text-xs text-slate-400 font-semibold">Open Positions</p>
          </div>

          {/* Person Image */}
          <img
            src={jobguy}
            className="relative h-[360px] max-w-[85%] object-contain z-10 drop-shadow-2xl"
          />
        </div>

      </div>
    </div>
  )
}

export default Landing