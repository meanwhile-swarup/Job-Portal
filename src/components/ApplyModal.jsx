import { useState } from "react";
import { FaTimes, FaGithub, FaLinkedin, FaFileAlt } from "react-icons/fa";
import { supabase } from "../supabase.js";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const ApplyModal = ({ isOpen, onClose, jobId, jobTitle, companyName, onSuccess }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    coverMessage: "",
    resumeUrl: "",
    githubUrl: "",
    linkedinUrl: "",
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateUrls = () => {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
    
    if (formData.resumeUrl && !urlPattern.test(formData.resumeUrl)) {
      addToast("Please provide a valid resume link URL", "error");
      return false;
    }
    if (formData.githubUrl && !urlPattern.test(formData.githubUrl)) {
      addToast("Please provide a valid GitHub link URL", "error");
      return false;
    }
    if (formData.linkedinUrl && !urlPattern.test(formData.linkedinUrl)) {
      addToast("Please provide a valid LinkedIn link URL", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateUrls()) return;

    setSubmitting(true);
    try {
      const title = user.user_metadata?.title || "Candidate";
      const bio = user.user_metadata?.bio || "";
      const skills = user.user_metadata?.skills || "";
      const profileData = { title, bio, skills };
      const formattedCoverMessage = `__PROFILE_DATA__:${JSON.stringify(profileData)}__END_PROFILE_DATA__\n${formData.coverMessage}`;

      const { error } = await supabase
        .from("applications")
        .insert([{
          user_id: user.id,
          job_id: jobId,
          status: "Pending",
          applicant_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Anonymous",
          applicant_email: user.email,
          cover_message: formattedCoverMessage,
          resume_url: formData.resumeUrl,
          github_url: formData.githubUrl,
          linkedin_url: formData.linkedinUrl,
        }]);

      if (error) throw error;
      
      addToast("Application submitted successfully!", "success");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      addToast(err.message || "Failed to submit application.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      
      {/* Modal Dialog */}
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full p-6 md:p-8 z-10 border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
        >
          <FaTimes size={18} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Apply for Position</h2>
          <p className="text-sm text-violet-600 dark:text-violet-400 font-semibold mt-1">
            {jobTitle} • {companyName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Cover message */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Cover Message</label>
            <textarea
              name="coverMessage"
              value={formData.coverMessage}
              onChange={handleChange}
              rows={4}
              placeholder="Why are you a good fit for this position?"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>

          {/* Resume link */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <FaFileAlt className="text-slate-400 dark:text-slate-500" /> Resume Link URL
            </label>
            <input
              type="text"
              name="resumeUrl"
              value={formData.resumeUrl}
              onChange={handleChange}
              placeholder="e.g. Google Drive, Dropbox link"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>

          {/* GitHub link */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <FaGithub className="text-slate-400 dark:text-slate-500" /> GitHub Profile URL
            </label>
            <input
              type="text"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>

          {/* LinkedIn link */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <FaLinkedin className="text-slate-400 dark:text-slate-500" /> LinkedIn Profile URL
            </label>
            <input
              type="text"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-300 dark:border-slate-700 rounded-xl py-3 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-3 font-semibold transition cursor-pointer text-sm shadow-sm shadow-violet-500/30"
            >
              {submitting ? "Applying..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
