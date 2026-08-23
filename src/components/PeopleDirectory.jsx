import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase.js";
import { FaUser, FaBriefcase, FaMapMarkerAlt, FaEnvelope, FaGlobe, FaChevronRight } from "react-icons/fa";
import { useToast } from "../context/ToastContext";

const PeopleDirectory = () => {
  const [activeTab, setActiveTab] = useState("candidates");
  const [candidates, setCandidates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch candidates (applications)
        const { data: appsData, error: appsError } = await supabase
          .from("applications")
          .select("*")
          .order("applied_at", { ascending: false });

        if (appsError) throw appsError;

        // Group by user_id to get unique candidates (keep latest application)
        const uniqueCandidates = [];
        const seenCandidateIds = new Set();
        (appsData || []).forEach((app) => {
          if (!seenCandidateIds.has(app.user_id)) {
            seenCandidateIds.add(app.user_id);
            uniqueCandidates.push(app);
          }
        });
        setCandidates(uniqueCandidates);

        // Fetch companies (jobs)
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .order("created_at", { ascending: false });

        if (jobsError) throw jobsError;

        // Group by company_id to get unique companies (keep latest job posting)
        const uniqueCompanies = [];
        const seenCompanyIds = new Set();
        (jobsData || []).forEach((job) => {
          if (job.company_id && !seenCompanyIds.has(job.company_id)) {
            seenCompanyIds.add(job.company_id);
            uniqueCompanies.push(job);
          }
        });
        setCompanies(uniqueCompanies);
      } catch (err) {
        addToast(err.message || "Failed to load directory data", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getInitials = (name) => {
    return (name || "U").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-slate-50/30 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight sm:text-4xl">
            SkillGig <span className="text-violet-600">Directory</span>
          </h1>
          <p className="mt-2.5 max-w-2xl mx-auto text-sm text-slate-500 leading-relaxed">
            Discover and connect with top talent and leading companies in the community.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200/50 flex shadow-sm w-full max-w-[320px]">
            <button
              onClick={() => setActiveTab("candidates")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                activeTab === "candidates"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FaUser size={10} /> Candidates
            </button>
            <button
              onClick={() => setActiveTab("companies")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition cursor-pointer text-xs ${
                activeTab === "companies"
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FaBriefcase size={10} /> Companies
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-600 border-t-transparent"></div>
          </div>
        ) : (
          <div>
            {activeTab === "candidates" ? (
              candidates.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                  <FaUser className="mx-auto text-3xl text-slate-300 mb-4" />
                  <p className="text-slate-500 text-sm font-medium">No candidates in the directory yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {candidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      onClick={() => navigate(`/profiles/seeker/${candidate.user_id}`)}
                      className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 flex items-start justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-violet-50 border border-violet-100/50 flex items-center justify-center text-lg font-bold text-violet-600 shadow-sm shrink-0">
                          {getInitials(candidate.applicant_name)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-violet-600 transition duration-200">
                            {candidate.applicant_name}
                          </h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-semibold">
                            <FaEnvelope className="text-slate-400 shrink-0" /> {candidate.applicant_email}
                          </p>
                          <span className="inline-block bg-violet-50/60 text-violet-700 text-[10px] px-2.5 py-1 rounded-md font-bold mt-3 border border-violet-100/30 uppercase tracking-wider">
                            Candidate
                          </span>
                        </div>
                      </div>
                      <div className="text-slate-400 group-hover:text-violet-600 transition duration-200 self-center">
                        <FaChevronRight size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              companies.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                  <FaBriefcase className="mx-auto text-3xl text-slate-300 mb-4" />
                  <p className="text-slate-500 text-sm font-medium">No companies in the directory yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      onClick={() => navigate(`/profiles/company/${company.company_id}`)}
                      className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-violet-500/5 hover:-translate-y-1 hover:border-violet-200 transition-all duration-300 flex items-start justify-between gap-4 cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-violet-50 border border-violet-100/50 flex items-center justify-center text-lg font-bold text-violet-600 shadow-sm shrink-0 overflow-hidden">
                          {company.logo_url ? (
                            <img
                              src={company.logo_url}
                              alt={company.company}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            getInitials(company.company)
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-800 group-hover:text-violet-600 transition duration-200">
                            {company.company}
                          </h3>
                          {company.location && (
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-semibold">
                              <FaMapMarkerAlt className="text-slate-400 shrink-0" /> {company.location}
                            </p>
                          )}
                          <span className="inline-block bg-violet-50/60 text-violet-700 text-[10px] px-2.5 py-1 rounded-md font-bold mt-3 border border-violet-100/30 uppercase tracking-wider">
                            Employer
                          </span>
                        </div>
                      </div>
                      <div className="text-slate-400 group-hover:text-violet-600 transition duration-200 self-center">
                        <FaChevronRight size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default PeopleDirectory;
