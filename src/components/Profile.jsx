import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../supabase.js";
import { 
  FaUser, 
  FaEnvelope, 
  FaGithub, 
  FaLinkedin, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaEdit, 
  FaSave, 
  FaTimes,
  FaFileAlt
} from "react-icons/fa";

const Profile = () => {
  const { user, loading } = useAuth();
  const { addToast } = useToast();

  const isCompany = user?.user_metadata?.role === "company";
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile fields state
  const [formData, setFormData] = useState({
    displayName: user?.user_metadata?.display_name || "",
    title: user?.user_metadata?.title || "",
    bio: user?.user_metadata?.bio || "",
    skills: user?.user_metadata?.skills || "",
    github: user?.user_metadata?.github || "",
    linkedin: user?.user_metadata?.linkedin || "",
    portfolio: user?.user_metadata?.portfolio || "",
    website: user?.user_metadata?.website || "",
    location: user?.user_metadata?.location || "",
    industry: user?.user_metadata?.industry || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          display_name: formData.displayName,
          title: formData.title,
          bio: formData.bio,
          skills: formData.skills,
          github: formData.github,
          linkedin: formData.linkedin,
          portfolio: formData.portfolio,
          website: formData.website,
          location: formData.location,
          industry: formData.industry,
        }
      });

      if (error) throw error;
      
      addToast("Profile updated successfully!", "success");
      setIsEditing(false);
    } catch (err) {
      addToast(err.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-600 border-t-transparent"></div>
      </div>
    );
  }

  // Get initials for Avatar
  const getInitials = () => {
    const name = formData.displayName || user?.email || "U";
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-slate-50/30 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Profile Header Banner */}
        <div className="h-36 bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        </div>
        
        {/* Profile Info Summary */}
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-6 gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <div className="w-28 h-28 rounded-2xl bg-violet-50 border-4 border-white flex items-center justify-center text-3xl font-extrabold text-violet-600 shadow-md">
                {getInitials()}
              </div>
              <div className="text-center sm:text-left mt-2">
                <h1 className="text-2xl font-extrabold text-slate-800">
                  {formData.displayName || "User Name"}
                </h1>
                <p className="text-slate-500 flex items-center justify-center sm:justify-start gap-2 mt-1.5 text-xs font-semibold">
                  <FaEnvelope className="text-slate-400" /> {user?.email}
                </p>
                <div className="mt-2.5 flex gap-2 justify-center sm:justify-start">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isCompany 
                      ? "bg-violet-50 text-violet-700 border border-violet-100" 
                      : "bg-violet-50 text-violet-700 border border-violet-100"
                  }`}>
                    {isCompany ? "Employer / Company" : "Job Seeker"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 flex justify-center">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition duration-200 cursor-pointer"
                >
                  <FaEdit size={14} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs transition duration-200 cursor-pointer"
                  >
                    <FaTimes size={12} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs shadow-sm hover:shadow-md transition duration-200 disabled:opacity-50 cursor-pointer animate-pulse-once"
                  >
                    <FaSave size={12} /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <hr className="border-slate-100 my-6" />

          {/* Form Content */}
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Display Name - Editable */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name / Company Name</label>
              {isEditing ? (
                <div className="relative group">
                  <FaUser className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                    className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>
              ) : (
                <p className="text-slate-800 bg-slate-50/50 rounded-xl px-4 py-3.5 border border-slate-100 text-sm font-semibold">
                  {formData.displayName || "Not specified"}
                </p>
              )}
            </div>

            {/* Candidate Specific Fields */}
            {!isCompany && (
              <>
                {/* Professional Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Professional Title</label>
                  {isEditing ? (
                    <div className="relative group">
                      <FaBriefcase className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                      />
                    </div>
                  ) : (
                    <p className="text-slate-800 bg-slate-50/50 rounded-xl px-4 py-3.5 border border-slate-100 text-sm font-semibold">
                      {formData.title || "Not specified"}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio / Professional Summary</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about yourself, your career path, and what you are looking for..."
                      className="w-full border border-slate-200 rounded-xl py-3.5 px-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                    />
                  ) : (
                    <p className="text-slate-800 bg-slate-50/50 rounded-xl px-4 py-3.5 border border-slate-100 text-sm font-medium leading-relaxed whitespace-pre-line min-h-[6rem]">
                      {formData.bio || "No summary provided."}
                    </p>
                  )}
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skills (comma separated)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g. React, Node.js, TailwindCSS, PostgreSQL"
                      className="w-full border border-slate-200 rounded-xl py-3.5 px-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2 py-1">
                      {formData.skills ? (
                        formData.skills.split(",").map((skill, index) => (
                          <span
                            key={index}
                            className="bg-violet-50/60 text-violet-700 border border-violet-100/50 px-3 py-1 rounded-xl text-xs font-bold"
                          >
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-400 italic text-xs">No skills listed yet.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Seeker Social Links */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* GitHub */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GitHub Profile URL</label>
                    {isEditing ? (
                      <div className="relative group">
                        <FaGithub className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <input
                          type="url"
                          name="github"
                          value={formData.github}
                          onChange={handleChange}
                          placeholder="https://github.com/..."
                          className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                        />
                      </div>
                    ) : (
                      formData.github ? (
                        <a
                          href={formData.github}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 text-slate-700 hover:text-violet-600 font-bold px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs transition duration-200"
                        >
                          <FaGithub size={14} /> View GitHub
                        </a>
                      ) : (
                        <p className="text-slate-400 bg-slate-50/30 rounded-xl px-4 py-3 border border-slate-100 text-xs italic">
                          Not linked
                        </p>
                      )
                    )}
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">LinkedIn Profile URL</label>
                    {isEditing ? (
                      <div className="relative group">
                        <FaLinkedin className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/..."
                          className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                        />
                      </div>
                    ) : (
                      formData.linkedin ? (
                        <a
                          href={formData.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 text-slate-700 hover:text-violet-600 font-bold px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs transition duration-200"
                        >
                          <FaLinkedin size={14} /> View LinkedIn
                        </a>
                      ) : (
                        <p className="text-slate-400 bg-slate-50/30 rounded-xl px-4 py-3 border border-slate-100 text-xs italic">
                          Not linked
                        </p>
                      )
                    )}
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Portfolio / Website</label>
                    {isEditing ? (
                      <div className="relative group">
                        <FaGlobe className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <input
                          type="url"
                          name="portfolio"
                          value={formData.portfolio}
                          onChange={handleChange}
                          placeholder="https://myportfolio.com"
                          className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                        />
                      </div>
                    ) : (
                      formData.portfolio ? (
                        <a
                          href={formData.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 text-slate-700 hover:text-violet-600 font-bold px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs transition duration-200"
                        >
                          <FaGlobe size={14} /> View Portfolio
                        </a>
                      ) : (
                        <p className="text-slate-400 bg-slate-50/30 rounded-xl px-4 py-3 border border-slate-100 text-xs italic">
                          Not linked
                        </p>
                      )
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Company Specific Fields */}
            {isCompany && (
              <>
                {/* Industry & Location Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Industry */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Industry</label>
                    {isEditing ? (
                      <div className="relative group">
                        <FaBriefcase className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <input
                          type="text"
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          placeholder="e.g. Technology, Finance, Healthcare"
                          className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                        />
                      </div>
                    ) : (
                      <p className="text-slate-800 bg-slate-50/50 rounded-xl px-4 py-3.5 border border-slate-100 text-sm font-semibold">
                        {formData.industry || "Not specified"}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                    {isEditing ? (
                      <div className="relative group">
                        <FaMapMarkerAlt className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="e.g. San Francisco, CA / Remote"
                          className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                        />
                      </div>
                    ) : (
                      <p className="text-slate-800 bg-slate-50/50 rounded-xl px-4 py-3.5 border border-slate-100 text-sm font-semibold">
                        {formData.location || "Not specified"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Company Bio */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About the Company / Description</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe what your company does, your culture, and your mission..."
                      className="w-full border border-slate-200 rounded-xl py-3.5 px-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                    />
                  ) : (
                    <p className="text-slate-800 bg-slate-50/50 rounded-xl px-4 py-3.5 border border-slate-100 text-sm font-medium leading-relaxed whitespace-pre-line min-h-[6rem]">
                      {formData.bio || "No description provided."}
                    </p>
                  )}
                </div>

                {/* Company Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Website */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Company Website</label>
                    {isEditing ? (
                      <div className="relative group">
                        <FaGlobe className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://company.com"
                          className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                        />
                      </div>
                    ) : (
                      formData.website ? (
                        <a
                          href={formData.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 text-slate-700 hover:text-violet-600 font-bold px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs transition duration-200"
                        >
                          <FaGlobe size={14} /> View Website
                        </a>
                      ) : (
                        <p className="text-slate-400 bg-slate-50/30 rounded-xl px-4 py-3 border border-slate-100 text-xs italic">
                          Not linked
                        </p>
                      )
                    )}
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">LinkedIn Page URL</label>
                    {isEditing ? (
                      <div className="relative group">
                        <FaLinkedin className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <input
                          type="url"
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/company/..."
                          className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                        />
                      </div>
                    ) : (
                      formData.linkedin ? (
                        <a
                          href={formData.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2.5 text-slate-700 hover:text-violet-600 font-bold px-4 py-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs transition duration-200"
                        >
                          <FaLinkedin size={14} /> View LinkedIn
                        </a>
                      ) : (
                        <p className="text-slate-400 bg-slate-50/30 rounded-xl px-4 py-3 border border-slate-100 text-xs italic">
                          Not linked
                        </p>
                      )
                    )}
                  </div>
                </div>
              </>
            )}

          </form>
        </div>
      </div>
    </section>
  );
};

export default Profile;
