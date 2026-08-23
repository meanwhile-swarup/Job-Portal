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

  const filteredJobs = jobs.filter((job) => {
    const titleMatch = (job.title || "").toLowerCase().includes(title.toLowerCase());
    const locationMatch = (job.location || "").toLowerCase().includes(location.toLowerCase());
    return titleMatch && locationMatch;
  });

  return (
    <section id="trending-jobs" className="px-6 lg:px-20 py-16 bg-slate-50">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-200 rounded-full px-3 py-1 text-xs font-bold text-violet-700 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          Latest Listings
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900">
          Trending Jobs Right Now
        </h2>
        <p className="mt-2 text-base text-slate-500 font-medium max-w-2xl">
          Discover the latest opportunities from companies hiring this week.
        </p>
      </div>

      {loadingJobs ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-violet-600 border-t-transparent" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 text-slate-500 font-medium">No jobs found matching your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {filteredJobs.map((job) => {
            const isApplied = appliedJobIds.has(job.id);
            return (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        {job.logo_url ? (
                          <img
                            src={job.logo_url}
                            alt={job.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-base font-extrabold text-violet-600">
                            {job.company?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-800 group-hover:text-violet-700 transition-colors duration-200">
                          {job.title}
                        </h2>
                        <p className="text-xs text-violet-600 font-semibold mt-1">
                          {job.company}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-white font-bold bg-violet-500 px-2 py-0.5 rounded-full">
                      NEW
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-slate-500 leading-relaxed text-xs line-clamp-3">
                    {job.description}
                  </p>
                </div>

                <div>
                  {/* Job Info Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {job.location && (
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-lg">
                        📍 {job.location}
                      </span>
                    )}
                    {job.salary && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-lg">
                        💰 {job.salary}
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 mt-4 w-full">
                    {user?.user_metadata?.role !== "company" && (
                      <button
                        onClick={() => handleApplyClick(job)}
                        disabled={isApplied}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isApplied
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/30"
                        }`}
                      >
                        {isApplied ? "✓ Applied" : "Apply Now"}
                      </button>
                    )}

                    <button
                      className={`py-2 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-violet-300 transition cursor-pointer text-center text-xs font-bold text-slate-600 ${
                        user?.user_metadata?.role === "company" ? "w-full" : "px-4"
                      }`}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      Details
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