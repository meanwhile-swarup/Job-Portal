import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../supabase.js";
import ApplyModal from "./ApplyModal";

const Trends = ({ title, location }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .not("company_id", "is", null)
          .order("posted_at", { ascending: false });

        if (error) throw error;
        setJobs(data || []);
      } catch (err) {
        addToast(err.message || "Error fetching jobs.", "error");
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchApplications = async () => {
        const { data, error } = await supabase
          .from("applications")
          .select("job_id")
          .eq("user_id", user.id);

        if (data) {
          setAppliedJobIds(new Set(data.map((app) => app.job_id)));
        }
      };
      fetchApplications();
    } else {
      setAppliedJobIds(new Set());
    }
  }, [user]);

  const handleApplyClick = (job) => {
    if (!user) {
      addToast("Please login to apply for this job.", "warning");
      navigate("/auth");
      return;
    }
    setSelectedJob(job);
    setIsApplyModalOpen(true);
  };

  const handleApplySuccess = (jobId) => {
    setAppliedJobIds((prev) => {
      const updated = new Set(prev);
      updated.add(jobId);
      return updated;
    });
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const filteredJobs = jobs.filter((job) => {
    const titleMatch = (job.title || "").toLowerCase().includes(title.toLowerCase());
    const locationMatch = (job.location || "").toLowerCase().includes(location.toLowerCase());
    return titleMatch && locationMatch;
  });

  return (
    <section id="trending-jobs" className="px-6 lg:px-20 py-16 bg-slate-50/60 dark:bg-slate-900/40 transition-colors duration-300">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-violet-100/80 dark:bg-violet-900/40 border border-violet-200/80 dark:border-violet-700/50 rounded-full px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600 dark:bg-violet-400"></span>
            </span>
            Hot Opportunities
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Trending Jobs Right Now
          </h2>
          <p className="mt-2 text-sm lg:text-base text-slate-600 dark:text-slate-400 font-normal max-w-xl">
            Discover top-tier career opportunities curated from actively hiring tech & modern companies.
          </p>
        </div>
      </div>

      {loadingJobs ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-violet-600 dark:border-violet-400 border-t-transparent" />
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Fetching latest jobs...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
          <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          No matching jobs found. Try adjusting your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredJobs.map((job) => {
            const isApplied = appliedJobIds.has(job.id);
            return (
              <div
                key={job.id}
                className="relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-500/5 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden"
              >
                {/* Top Accent Line on Hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Card Header: Logo & Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:border-violet-200 dark:group-hover:border-violet-700 transition-colors">
                        {job.logo_url ? (
                          <img
                            src={job.logo_url}
                            alt={job.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-black text-violet-700 dark:text-violet-300 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950 dark:to-indigo-950 w-full h-full flex items-center justify-center">
                            {job.company?.[0]?.toUpperCase() || "J"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] font-semibold tracking-wide text-violet-600 dark:text-violet-400 uppercase block truncate">
                          {job.company}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-snug line-clamp-1 mt-0.5">
                          {job.title}
                        </h3>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  </div>

                  {/* Job Description */}
                  <p className="mt-3.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 font-normal">
                    {job.description || "No description provided."}
                  </p>
                </div>

                {/* Footer section: Tags & Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  {/* Info Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.location && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                        <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                    )}

                    {job.salary && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                        <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.salary}
                      </span>
                    )}

                    {job.posted_at && (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-violet-50/70 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-lg border border-violet-100 dark:border-violet-800/60">
                        <svg className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTimeAgo(job.posted_at)}
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2.5 items-center w-full">
                    {user?.user_metadata?.role !== "company" && (
                      <button
                        onClick={() => handleApplyClick(job)}
                        disabled={isApplied}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                          isApplied
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/60 cursor-not-allowed"
                            : "bg-slate-900 dark:bg-violet-600 hover:bg-violet-600 dark:hover:bg-violet-500 text-white shadow-sm hover:shadow-md hover:shadow-violet-500/20 active:scale-[0.98]"
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            Applied
                          </>
                        ) : (
                          "Apply Now"
                        )}
                      </button>
                    )}

                    <button
                      className={`py-2.5 px-3 border border-slate-200/80 dark:border-slate-700/80 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer text-center text-xs font-semibold flex items-center justify-center gap-1 group/btn ${
                        user?.user_metadata?.role === "company" ? "w-full" : ""
                      }`}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      Details
                      <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedJob && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => {
            setIsApplyModalOpen(false);
            setSelectedJob(null);
          }}
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          companyName={selectedJob.company}
          onSuccess={() => handleApplySuccess(selectedJob.id)}
        />
      )}
    </section>
  );
};

export default Trends;