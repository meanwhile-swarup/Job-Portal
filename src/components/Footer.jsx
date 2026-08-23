import React from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub, FaBriefcase } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-950/20 via-transparent to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 relative z-10">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          
          {/* Brand/About */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-violet-600 text-white p-2.5 rounded-xl border border-white/10">
                <FaBriefcase size={18} />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Skill<span className="text-accent-400">Gig</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The leading professional job portal in Nepal, helping career-driven individuals connect with high-growth companies. Explore endless opportunities and scale your career.
            </p>
          </div>

          {/* For Candidates */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-5">Quick Navigation</h3>
            <ul className="flex flex-col gap-3 text-xs font-semibold">
              <li><a href="/" className="hover:text-violet-400 transition duration-200">Browse Jobs</a></li>
              <li><a href="/applied" className="hover:text-violet-400 transition duration-200">Applied Jobs</a></li>
              <li><a href="/profile" className="hover:text-violet-400 transition duration-200">My Profile</a></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-5">Keep in Touch</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Subscribe to get updates on the latest open roles and career development tips.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex rounded-xl overflow-hidden bg-slate-800 p-1 border border-slate-700/60 focus-within:border-violet-500 transition duration-200">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-transparent px-3 py-2 text-xs text-white outline-none flex-1 placeholder-slate-500"
              />
              <button 
                type="submit" 
                className="bg-violet-600 hover:bg-violet-700 text-white text-xs px-4 py-2 rounded-lg font-bold transition duration-200 cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[11px] text-slate-500 font-semibold">
            &copy; {new Date().getFullYear()} SkillGig. All rights reserved. Empowering talent in Nepal.
          </p>

          {/* Social Icons */}
          <div className="flex gap-3">
            {[
              { icon: <FaFacebookF size={12} />, url: "#" },
              { icon: <FaTwitter size={12} />, url: "#" },
              { icon: <FaLinkedinIn size={12} />, url: "#" },
              { icon: <FaGithub size={12} />, url: "#" },
            ].map((social, index) => (
              <a 
                key={index} 
                href={social.url} 
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-violet-600 hover:text-white transition duration-200 border border-slate-700/30"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
