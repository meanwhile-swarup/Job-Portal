import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabase.js";
import { 
  FaUser, 
  FaEnvelope, 
  FaGithub, 
  FaLinkedin, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaFileAlt,
  FaChevronRight,
  FaArrowLeft
} from "react-icons/fa";
import { useToast } from "../context/ToastContext";

const PublicProfile = ({ type }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [seekerData, setSeekerData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);

  const isCompany = type === "company";

  const parseProfileData = (coverMessage) => {
    if (!coverMessage) return { title: "", bio: "", skills: "", actualCover: "" };
    const match = coverMessage.match(/__PROFILE_DATA__:(.*?)__END_PROFILE_DATA__/s);
    if (match) {
      try {
        const data = JSON.parse(match[1]);
        const actualCover = coverMessage.replace(/__PROFILE_DATA__:.*?__END_PROFILE_DATA__\s*/s, "");
        return {
          title: data.title || "Candidate",
          bio: data.bio || "",
          skills: data.skills || "",
          actualCover
        };
      } catch (e) {
        // Fallback
      }
    }
    return { title: "Candidate", bio: "", skills: "", actualCover: coverMessage };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (isCompany) {
          // Fetch company details by querying jobs table for jobs posted by this company
          const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("company_id", id)
            .order("created_at", { ascending: false });

          if (error) throw error;

          if (data && data.length > 0) {
            setCompanyData(data[0]); // get company info from the latest job posting
            setCompanyJobs(data);
          } else {
            addToast("No company record found.", "warning");
          }
        } else {
          // Fetch seeker details by querying applications table
          const { data, error } = await supabase
            .from("applications")
            .select("*")
            .eq("user_id", id)
            .order("applied_at", { ascending: false });

          if (error) throw error;

          if (data && data.length > 0) {
            // Find latest application with profile metadata or just the latest one
            const latestApp = data[0];
            const parsed = parseProfileData(latestApp.cover_message);
            setSeekerData({
              name: latestApp.applicant_name,
              email: latestApp.applicant_email,
              github: latestApp.github_url,
              linkedin: latestApp.linkedin_url,
              resume: latestApp.resume_url,
              title: parsed.title,
              bio: parsed.bio,
              skills: parsed.skills,
            });
          } else {
            addToast("This candidate hasn't applied to any jobs yet, so no public profile is available.", "warning");
          }
        }
      } catch (err) {
        addToast(err.message || "Failed to load public profile details.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, isCompany]);

  const getInitials = (name) => {
    return (name || "U").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50/50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-600 border-t-transparent"></div>
      </div>
    );
  }

  // Seeker Public View
  if (!isCompany) {
    if (!seekerData) {
      return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50/30 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-slate-700 text-lg font-bold">No public profile available for this candidate.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
          >
            <FaArrowLeft /> Back
          </button>
        </div>
      );
    }

    return (
      <section className="min-h-[calc(100vh-80px)] bg-slate-50/30 py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 hover:text-slate-700 font-bold mb-6 flex items-center gap-1.5 cursor-pointer text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm"
          >
            <FaArrowLeft size={10} /> Back
          </button>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-36 bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800 relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
            </div>
            
            <div className="px-8 pb-8 relative">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 mb-6">
                <div className="w-28 h-28 rounded-2xl bg-violet-50 border-4 border-white flex items-center justify-center text-3xl font-extrabold text-violet-600 shadow-md shrink-0">
                  {getInitials(seekerData.name)}
                </div>
                <div className="text-center sm:text-left mt-2">
                  <h1 className="text-2xl font-extrabold text-slate-800">{seekerData.name}</h1>
                  <p className="text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1.5 text-xs font-semibold">
                    <FaEnvelope className="text-slate-400" /> {seekerData.email}
                  </p>
                  <span className="inline-block mt-3 bg-violet-50 text-violet-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-violet-100">
                    Job Seeker
                  </span>
                </div>
              </div>

              <hr className="border-slate-100 my-6" />

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Title</h3>
                  <p className="text-slate-800 font-extrabold mt-1 text-base">
                    {seekerData.title || "Job Seeker"}
                  </p>
                </div>

                {/* Bio */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bio</h3>
                  <p className="text-slate-500 mt-1.5 whitespace-pre-line leading-relaxed text-sm font-medium">
                    {seekerData.bio || "No bio summary provided."}
                  </p>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {seekerData.skills ? (
                      seekerData.skills.split(",").map((skill, index) => (
                        <span
                          key={index}
                          className="bg-violet-50/60 text-violet-700 border border-violet-100/50 px-3 py-1 rounded-xl text-xs font-bold"
                        >
                          {skill.trim()}
                        </span>
                      ))
                    ) : (
                      <p className="text-slate-400 italic text-xs">No skills listed.</p>
                    )}
                  </div>
                </div>

                {/* Portfolio and Social Links */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Links & Attachments</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {seekerData.resume ? (
                      <a
                        href={seekerData.resume.startsWith("http") ? seekerData.resume : `https://${seekerData.resume}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 text-blue-700 font-bold px-4 py-3 bg-blue-50/60 hover:bg-blue-100/80 rounded-xl border border-blue-100/30 transition text-xs duration-200"
                      >
                        <FaFileAlt size={12} /> Resume Link
                      </a>
                    ) : (
                      <div className="text-center text-slate-400 py-3 bg-slate-50/40 rounded-xl border border-slate-100 text-xs italic">
                        No Resume
                      </div>
                    )}

                    {seekerData.github ? (
                      <a
                        href={seekerData.github.startsWith("http") ? seekerData.github : `https://${seekerData.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 text-slate-800 font-bold px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/50 transition text-xs duration-200"
                      >
                        <FaGithub size={12} /> GitHub
                      </a>
                    ) : (
                      <div className="text-center text-slate-400 py-3 bg-slate-50/40 rounded-xl border border-slate-100 text-xs italic">
                        No GitHub
                      </div>
                    )}

                    {seekerData.linkedin ? (
                      <a
                        href={seekerData.linkedin.startsWith("http") ? seekerData.linkedin : `https://${seekerData.linkedin}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 text-sky-700 font-bold px-4 py-3 bg-sky-50/60 hover:bg-sky-100/80 rounded-xl border border-sky-100/30 transition text-xs duration-200"
                      >
                        <FaLinkedin size={12} /> LinkedIn
                      </a>
                    ) : (
                      <div className="text-center text-slate-400 py-3 bg-slate-50/40 rounded-xl border border-slate-100 text-xs italic">
                        No LinkedIn
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Company Public View
  if (!companyData) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50/30 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-700 text-lg font-bold">No profile available for this company.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
        >
          <FaArrowLeft /> Back
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-slate-50/30 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-700 font-bold mb-6 flex items-center gap-1.5 cursor-pointer text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200/50 shadow-sm"
        >
          <FaArrowLeft size={10} /> Back
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="h-36 bg-gradient-to-r from-violet-600 via-violet-700 to-violet-800 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
          </div>
          
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 mb-6">
              <div className="w-28 h-28 rounded-2xl bg-violet-50 border-4 border-white flex items-center justify-center text-3xl font-extrabold text-violet-700 shadow-md shrink-0 overflow-hidden">
                {companyData.logo_url ? (
                  <img
                    src={companyData.logo_url}
                    alt={companyData.company}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  getInitials(companyData.company)
                )}
              </div>
              <div className="text-center sm:text-left mt-2">
                <h1 className="text-2xl font-extrabold text-slate-800">{companyData.company}</h1>
                {companyData.location && (
                  <p className="text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1.5 text-xs font-semibold">
                    <FaMapMarkerAlt className="text-slate-400" /> {companyData.location}
                  </p>
                )}
                <span className="inline-block mt-3 bg-violet-50 text-violet-700 border border-violet-100 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Employer
                </span>
              </div>
            </div>

            <hr className="border-slate-100 my-6" />

            {/* Links and About */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About the Company</h3>
                <p className="text-slate-500 mt-1.5 whitespace-pre-line leading-relaxed text-sm font-medium">
                  {companyData.description || "Leading industry employer."}
                </p>
              </div>

              {companyData.logo_url && (
                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href={companyData.logo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline"
                  >
                    <FaGlobe size={12} /> Website / Link
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Company Jobs Directory */}
        <h2 className="text-lg font-bold text-slate-800 mb-4.5">Job Openings ({companyJobs.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companyJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 flex justify-between items-center cursor-pointer group"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-violet-600 transition duration-200">{job.title}</h3>
                <p className="text-xs text-slate-400 mt-1 font-semibold">{job.employment_type || "Full-time"} • {job.location || "Remote"}</p>
              </div>
              <div className="text-slate-400 group-hover:text-violet-600 transition duration-200">
                <FaChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PublicProfile;
