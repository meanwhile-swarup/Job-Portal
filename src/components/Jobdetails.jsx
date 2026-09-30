import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../supabase.js";
import ApplyModal from "./ApplyModal";

const Jobdetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);
  const [applied, setApplied] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState(null);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("jobs")
          .select("*")
          .eq("id", Number(id))
          .single();

        if (error) throw error;
        setJob(data);
      } catch (err) {
        addToast(err.message || "Error fetching job details.", "error");
      } finally {
        setLoadingJob(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  useEffect(() => {
    if (user && id) {
      const checkApplication = async () => {
        const { data, error } = await supabase
          .from("applications")
          .select("id")
          .eq("user_id", user.id)
          .eq("job_id", Number(id))
          .maybeSingle();

        if (data) {
          setApplied(true);
        }
      };
      checkApplication();
    }
  }, [user, id]);

  useEffect(() => {
    if (!user || !id || user?.user_metadata?.role === "company") return;
    const checkSaved = async () => {
      const { data } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("user_id", user.id)
        .eq("job_id", Number(id))
        .maybeSingle();
      if (data) setSavedRecordId(data.id);
    };
    checkSaved();
  }, [user, id]);

  const handleApplyClick = () => {
    if (!user) {
      addToast("Please login to apply for this job.", "warning");
      navigate("/auth");
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleToggleSave = async () => {
    if (!user) {
      addToast("Please login to save jobs.", "warning");
      navigate("/auth");
      return;
    }
    setSavingBookmark(true);
    try {
      if (savedRecordId) {
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("id", savedRecordId)
          .eq("user_id", user.id);
        if (error) throw error;
        setSavedRecordId(null);
        addToast(`Removed "${job?.title}" from saved jobs.`, "success");
      } else {
        const { data, error } = await supabase
          .from("saved_jobs")
          .insert({ user_id: user.id, job_id: Number(id) })
          .select("id")
          .single();
        if (error) throw error;
        setSavedRecordId(data.id);
        addToast(`"${job?.title}" saved! View in Saved Jobs.`, "success");
      }
    } catch (err) {
      addToast(err.message || "Error updating saved job.", "error");
    } finally {
      setSavingBookmark(false);
    }
  };

  if (loadingJob) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50/50 flex items-center justify-center">
        <p className="text-slate-500 font-medium animate-pulse">Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-700 text-lg font-bold">Job details could not be found.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition duration-200"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-slate-50/30 dark:bg-slate-950 px-6 lg:px-24 py-12 transition-colors duration-300">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
          {/* Header section */}
          <div className="flex items-start gap-5 pb-8 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-violet-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-violet-100/50 dark:border-slate-700">
              {job.logo_url ? (
                <img
                  src={job.logo_url}
                  alt={job.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black text-violet-600 dark:text-violet-400">
                  {job.company?.[0]}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
                {job.title}
              </h1>
              <p 
                onClick={() => {
                  if (job.company_id) {
                    navigate(`/profiles/company/${job.company_id}`);
                  }
                }}
                className="text-violet-600 dark:text-violet-400 font-bold mt-1.5 hover:underline cursor-pointer transition text-sm flex items-center gap-1.5"
                title="Click to view company profile"
              >
                <span>{job.company}</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-full no-underline hover:no-underline">Company</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Job Description</h2>
            <p className="text-slate-500 dark:text-slate-300 leading-relaxed mt-3 whitespace-pre-wrap text-sm">{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-8">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Requirements</h2>
              <ul className="text-slate-500 dark:text-slate-300 mt-4 space-y-3 text-sm">
                {job.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2.5">
                    <span className="text-emerald-500 dark:text-emerald-400 font-bold select-none mt-0.5">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* About Role */}
          <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-8">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">About This Role</h2>
            <p className="text-slate-500 dark:text-slate-300 leading-relaxed mt-3 text-sm">
              Join {job.company} and work on exciting projects using modern
              technologies. This role provides opportunities to learn, grow,
              and contribute to impactful industry solutions. We are looking for
              individuals passionate about innovation and high-quality standards.
            </p>
          </div>
        </div>

        {/* Sidebar Info Card */}
        <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm sticky top-24">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Job Overview</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100/50 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Salary Range</p>
              <p className="font-extrabold text-slate-800 dark:text-white mt-1 text-base">{job.salary || "Not Specified"}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100/50 dark:border-slate-800">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Location</p>
              <p className="font-extrabold text-slate-800 dark:text-white mt-1 text-sm">{job.location}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            {user?.user_metadata?.role === "company" ? (
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400">
                Viewing as Employer
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApplyClick}
                  disabled={applied}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer text-center ${
                    applied
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-100 dark:border-slate-800"
                      : "bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg hover:shadow-violet-500/10 active:scale-98"
                  }`}
                >
                  {applied ? "Already Applied" : "Apply For Job"}
                </button>
                {/* Bookmark / Save button */}
                <button
                  onClick={handleToggleSave}
                  disabled={savingBookmark}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border ${
                    savedRecordId
                      ? "border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400"
                  } disabled:opacity-50`}
                >
                  <svg
                    className={`w-4 h-4 transition-all duration-200 ${savingBookmark ? "animate-pulse" : ""}`}
                    fill={savedRecordId ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
                  </svg>
                  {savedRecordId ? "Saved" : "Save Job"}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company}
        onSuccess={() => setApplied(true)}
      />
    </section>
  );
};

export default Jobdetails;
