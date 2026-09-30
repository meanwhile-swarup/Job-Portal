import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../supabase.js";
import ApplyModal from "./ApplyModal";

const SavedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("saved_jobs")
          .select(`
            id,
            saved_at,
            jobs (
              id,
              title,
              company,
              location,
              salary,
              logo_url,
              description,
              posted_at,
              company_id
            )
          `)
          .eq("user_id", user.id)
          .order("saved_at", { ascending: false });

        if (error) throw error;

        if (data) {
          const mapped = data
            .filter((item) => item.jobs && item.jobs.company_id !== null)
            .map((item) => ({
              savedRecordId: item.id,
              savedAt: item.saved_at,
              ...item.jobs,
            }));
          setSavedJobs(mapped);
        }
      } catch (err) {
        addToast(err.message || "Error fetching saved jobs.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedJobs();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchApplications = async () => {
      const { data } = await supabase
        .from("applications")
        .select("job_id")
        .eq("user_id", user.id);
      if (data) setAppliedJobIds(new Set(data.map((a) => a.job_id)));
    };
    fetchApplications();
  }, [user]);

  const handleUnsave = async (savedRecordId, jobTitle) => {
    setRemovingId(savedRecordId);
    try {
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("id", savedRecordId)
        .eq("user_id", user.id);

      if (error) throw error;

      setSavedJobs((prev) =>
        prev.filter((j) => j.savedRecordId !== savedRecordId)
      );
      addToast(`Removed "${jobTitle}" from saved jobs.`, "success");
    } catch (err) {
      addToast(err.message || "Error removing saved job.", "error");
    } finally {
      setRemovingId(null);
    }
  };

  const handleApplyClick = (job) => {
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-violet-600 dark:border-violet-400 border-t-transparent" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading saved jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-slate-50/30 dark:bg-slate-950 px-6 lg:px-24 py-16 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 dark:bg-amber-900/30 border border-amber-200/80 dark:border-amber-700/40 rounded-full px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
            Saved for Later
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Your Saved Jobs
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 font-normal">
            {savedJobs.length > 0
              ? `${savedJobs.length} job${savedJobs.length > 1 ? "s" : ""} bookmarked — ready when you are.`
              : "Jobs you bookmark will appear here."}
          </p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-14 text-center shadow-sm">
            <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-400 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-base font-bold mb-1">No saved jobs yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-7">
              Hit the bookmark icon on any job to save it here for later.
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-violet-600 hover:bg-violet-700 text-white px-7 py-3 rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:shadow-violet-500/20 transition cursor-pointer"
            >
              Browse Open Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedJobs.map((job) => {
              const isApplied = appliedJobIds.has(job.id);
              const isRemoving = removingId === job.savedRecordId;

              return (
                <div
                  key={job.savedRecordId}
                  className={`group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 overflow-hidden relative ${isRemoving ? "opacity-50 scale-[0.99]" : ""}`}
                >
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-violet-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Left: Logo + Info */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 bg-violet-50 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-violet-100/50 dark:border-slate-700 group-hover:border-violet-200 dark:group-hover:border-violet-700 transition-colors">
                      {job.logo_url ? (
                        <img src={job.logo_url} alt={job.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base font-black text-violet-600 dark:text-violet-400">
                          {job.company?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                        {job.title}
                      </h2>
                      <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold mt-0.5">{job.company}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                        {job.location && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                        )}
                        {job.salary && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {job.salary}
                          </span>
                        )}
                        {job.posted_at && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            Posted {formatTimeAgo(job.posted_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                    {/* Unsave Button */}
                    <button
                      onClick={() => handleUnsave(job.savedRecordId, job.title)}
                      disabled={isRemoving}
                      title="Remove from saved"
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-amber-500 dark:text-amber-400 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 dark:hover:text-red-400 transition-all duration-200 cursor-pointer disabled:opacity-40"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                      </svg>
                    </button>

                    {/* View Details */}
                    <button
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer duration-200"
                    >
                      Details
                    </button>

                    {/* Apply Button */}
                    <button
                      onClick={() => handleApplyClick(job)}
                      disabled={isApplied}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isApplied
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200/60 dark:border-slate-700/60 cursor-not-allowed"
                          : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md hover:shadow-violet-500/20 active:scale-[0.98]"
                      }`}
                    >
                      {isApplied ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          Applied
                        </span>
                      ) : (
                        "Apply Now"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

export default SavedJobs;
