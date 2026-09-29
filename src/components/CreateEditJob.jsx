import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../supabase.js";

const CreateEditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: user?.user_metadata?.display_name || user?.email?.split("@")[0] || "",
    location: "",
    salary: "",
    description: "",
    requirements: "",
    logo_url: "",
    category: "Development",
    employment_type: "Full-time",
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchJobDetails = async () => {
        try {
          const { data, error } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", Number(id))
            .eq("company_id", user.id)
            .single();

          if (error) throw error;

          if (data) {
            setFormData({
              title: data.title || "",
              company: data.company || "",
              location: data.location || "",
              salary: data.salary || "",
              description: data.description || "",
              requirements: (data.requirements || []).join(", "),
              logo_url: data.logo_url || "",
              category: data.category || "Development",
              employment_type: data.employment_type || "Full-time",
            });
          }
        } catch (err) {
          addToast(err.message || "Failed to load job posting or unauthorized access.", "error");
          navigate("/company");
        } finally {
          setLoading(false);
        }
      };

      fetchJobDetails();
    }
  }, [id, isEditMode, user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
      addToast("Job Title, Company Name, and Description are required.", "warning");
      return;
    }

    // Split requirements by commas and clean spaces
    const requirementsArray = formData.requirements
      .split(",")
      .map((req) => req.trim())
      .filter((req) => req.length > 0);

    const payload = {
      title: formData.title,
      company: formData.company,
      location: formData.location,
      salary: formData.salary,
      description: formData.description,
      requirements: requirementsArray,
      logo_url: formData.logo_url,
      category: formData.category,
      employment_type: formData.employment_type,
      company_id: user.id,
    };

    setSaving(true);

    try {
      if (isEditMode) {
        const { error } = await supabase
          .from("jobs")
          .update(payload)
          .eq("id", Number(id))
          .eq("company_id", user.id);

        if (error) throw error;
        addToast("Job updated successfully!", "success");
      } else {
        const { error } = await supabase.from("jobs").insert([payload]);
        if (error) throw error;
        addToast("Job posted successfully!", "success");
      }
      navigate("/company");
    } catch (err) {
      addToast(err.message || "Failed to save job posting.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <p className="text-slate-600 dark:text-slate-400 text-lg">Loading details...</p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 lg:px-20 py-16 transition-colors duration-300">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {isEditMode ? "Edit Job Posting" : "Post a New Job"}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Fill in the details to publish a new job opening on SkillGig.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior React Developer"
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Company Name *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Yarsa Tech"
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Kathmandu or Remote"
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Salary Range</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. Rs. 80,000 - 120,000"
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Analytics">Analytics</option>
                <option value="Support">Support</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Management">Management</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Employment Type</label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Company Logo URL</label>
            <input
              type="text"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              placeholder="e.g. https://example.com/logo.png"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              placeholder="Detail the job roles and responsibilities..."
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Requirements (comma-separated)</label>
            <input
              type="text"
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="e.g. React experience, REST APIs, Git flow"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate("/company")}
              className="flex-1 border border-slate-300 dark:border-slate-700 rounded-xl py-3 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3 font-semibold transition cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              {saving ? "Saving..." : isEditMode ? "Save Changes" : "Publish Job"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateEditJob;
