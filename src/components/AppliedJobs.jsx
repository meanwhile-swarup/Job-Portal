import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase.js";

const AppliedJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const { data, error } = await supabase
          .from("applications")
          .select(`
            applied_at,
            status,
            jobs (
              id,
              title,
              company,
              location,
              salary,
              logo_url,
              company_id
            )
          `)
          .eq("user_id", user.id)
          .order("applied_at", { ascending: false });

        if (error) throw error;

        if (data) {
          const mapped = data
            .filter((app) => app.jobs && app.jobs.company_id !== null) // Filter out orphaned and seed applications
            .map((app) => ({
              id: app.jobs.id,
              title: app.jobs.title,
              company: app.jobs.company,
              location: app.jobs.location,
              salary: app.jobs.salary,
              logo_url: app.jobs.logo_url,
              appliedAt: new Date(app.applied_at).toLocaleDateString(),
              status: app.status || "Pending",
            }));

          setAppliedJobs(mapped);
        }
      } catch (err) {
        console.error("Error fetching applied jobs:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading applications...</p>
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-slate-50/30 dark:bg-slate-950 px-6 lg:px-24 py-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-8">Your Applications</h1>

        {appliedJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-10 text-center shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-base mb-6 font-medium">You haven't applied for any jobs yet.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
            >
              Browse Open Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appliedJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-50 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-violet-100/50 dark:border-slate-700">
                    {job.logo_url ? (
                      <img
                        src={job.logo_url}
                        alt={job.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-black text-violet-600 dark:text-violet-400">
                        {job.company?.[0]}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">{job.title}</h2>
                    <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold mt-0.5">{job.company}</p>
                    <div className="flex gap-3 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>Applied on {job.appliedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                      job.status === "Accepted"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/60"
                        : job.status === "Rejected"
                        ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-800/60"
                        : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/60"
                    }`}
                  >
                    {job.status}
                  </span>
                  <button
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="text-center px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer duration-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AppliedJobs;
