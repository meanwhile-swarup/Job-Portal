import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../supabase.js";
import ConfirmModal from "./ConfirmModal";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Confirm Modal state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const fetchJobsAndApplicants = async () => {
    try {
      // Fetch jobs posted by current company
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("company_id", user.id)
        .order("posted_at", { ascending: false });

      if (jobsError) throw jobsError;

      if (jobsData) {
        // Fetch application counts for these jobs
        const jobsWithApplicants = await Promise.all(
          jobsData.map(async (job) => {
            const { count, error: countError } = await supabase
              .from("applications")
              .select("*", { count: "exact", head: true })
              .eq("job_id", job.id);

            return {
              ...job,
              applicantCount: count || 0,
            };
          })
        );
        setPostedJobs(jobsWithApplicants);
      }
    } catch (err) {
      addToast(err.message || "Error fetching dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndApplicants();
  }, [user, navigate]);

  const handleDeleteClick = (jobId) => {
    setJobToDelete(jobId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!jobToDelete) return;
    
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", jobToDelete);
      if (error) throw error;
      setPostedJobs((prev) => prev.filter((j) => j.id !== jobToDelete));
      addToast("Job deleted successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to delete job.", "error");
    } finally {
      setIsConfirmOpen(false);
      setJobToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <p className="text-slate-600 dark:text-slate-400 text-lg">Loading company dashboard...</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 lg:px-20 py-16 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Employer Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your job openings and review candidates.</p>
          </div>
          <button
            onClick={() => navigate("/company/jobs/new")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition cursor-pointer shadow-sm shadow-emerald-500/20"
          >
            Post a New Job
          </button>
        </div>

        {postedJobs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-6">You haven't posted any jobs yet.</p>
            <button
              onClick={() => navigate("/company/jobs/new")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium transition cursor-pointer"
            >
              Post First Job
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Category / Type</th>
                    <th className="px-6 py-4">Applicants</th>
                    <th className="px-6 py-4">Salary</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {postedJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{job.title}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">{job.location}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-900 dark:text-slate-200">{job.category}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs">{job.employment_type}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          onClick={() => navigate(`/company/jobs/${job.id}/applicants`)}
                          className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60"
                        >
                          {job.applicantCount} Candidates
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{job.salary}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/company/jobs/${job.id}/applicants`)}
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium cursor-pointer"
                        >
                          Applicants
                        </button>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <button
                          onClick={() => navigate(`/company/jobs/${job.id}/edit`)}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <button
                          onClick={() => handleDeleteClick(job.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete Job Posting?"
        message="Are you sure you want to delete this job posting? All applications for this job will also be deleted. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmOpen(false);
          setJobToDelete(null);
        }}
      />
    </section>
  );
};

export default CompanyDashboard;
