import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../supabase";
import {
  FaBriefcase,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "seeker", // Default role
  });

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validation = () => {
    const errors = [];

    if (!isLogin && !isForgotPassword && !formData.name.trim()) {
      errors.push("Name is required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.push("Email is required");
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.push("Please enter a valid email address (e.g. name@domain.com)");
    }

    if (!isForgotPassword) {
      if (!formData.password) {
        errors.push("Password is required");
      } else if (formData.password.length < 6) {
        errors.push("Password must be at least 6 characters");
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validation();

    if (errors.length > 0) {
      errors.forEach((err) => addToast(err, "error"));
      return;
    }

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        setResetSent(true);
        addToast("Password reset link sent to your email!", "success");
      } else if (isLogin) {
        await login(formData.email, formData.password);
        addToast("Logged in successfully!", "success");
        navigate("/");
      } else {
        const data = await signup(formData.email, formData.password, formData.name, formData.role);
        if (data?.session) {
          addToast("Registration successful! Logged in successfully.", "success");
          navigate("/");
        } else {
          setVerificationRequired(true);
          addToast("Registration successful! Please check your email to verify.", "success");
        }
      }
    } catch (error) {
      addToast(error.message || "An authentication error occurred.", "error");
    }
  };

  const switchMode = (mode) => {
    setIsLogin(mode);
    setIsForgotPassword(false);
    setResetSent(false);
    setVerificationRequired(false);
    setFormData({ name: "", email: "", password: "", role: "seeker" });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50/50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-100 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden grid md:grid-cols-2 relative z-10">
        
        {/* BRAND SIDE */}
        <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 p-10 flex flex-col justify-between text-white relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3.5 mb-10">
              <div className="bg-white/10 backdrop-blur-md text-white p-3 rounded-2xl border border-white/10">
                <FaBriefcase size={22} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Skill<span className="text-emerald-300 font-black">Gig</span>
              </h1>
            </div>

            <h2 className="text-3xl font-extrabold leading-tight">
              Find your next opportunity.
            </h2>

            <p className="text-violet-100/80 mt-4 text-sm leading-relaxed max-w-sm">
              Connect with leading companies, showcase your skills, and take the next step in your career.
            </p>
          </div>

          <div className="mt-12 space-y-4 relative">
            <div className="flex items-center gap-3.5 text-sm font-semibold">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 border border-white/20 text-emerald-300">✓</span>
              Thousands of verified job listings
            </div>
            <div className="flex items-center gap-3.5 text-sm font-semibold">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 border border-white/20 text-emerald-300">✓</span>
              Seamless connection with employers
            </div>
          </div>
        </div>

        {/* FORM SIDE */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="flex justify-center mb-8">
            <div className="bg-slate-100 rounded-full p-1 flex gap-1 w-full max-w-[240px]">
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`flex-1 text-center py-2 rounded-full cursor-pointer text-xs font-bold transition-all duration-200 ${
                  isLogin && !isForgotPassword ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`flex-1 text-center py-2 rounded-full cursor-pointer text-xs font-bold transition-all duration-200 ${
                  !isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {verificationRequired ? (
            <div className="text-center py-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Verify your email</h2>
              <div className="bg-violet-50 border border-violet-100 text-violet-800 p-4 rounded-2xl text-xs leading-relaxed mb-6">
                We've sent a verification link to <strong className="font-semibold">{formData.email}</strong>. Please check your inbox and click the link to activate your account.
              </div>
              <button
                onClick={() => switchMode(true)}
                className="text-violet-600 hover:text-violet-700 font-bold text-xs cursor-pointer transition-colors duration-200"
              >
                ← Back to Login
              </button>
            </div>
          ) : isForgotPassword ? (
            <div>
              <h2 className="text-xl font-bold text-slate-800 text-center">Reset Password</h2>
              <p className="text-center text-slate-400 text-xs mt-1.5 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {resetSent ? (
                <div className="text-center py-4">
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-2xl text-xs mb-6">
                    A password reset link has been sent to your email address.
                  </div>
                  <button
                    onClick={() => switchMode(true)}
                    className="text-violet-600 hover:text-violet-700 font-bold text-xs cursor-pointer transition-colors duration-200"
                  >
                    ← Back to Login
                  </button>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="relative group">
                    <FaEnvelope className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors duration-200" />
                    <input
                      onChange={handleChange}
                      name="email"
                      value={formData.email}
                      placeholder="Email address"
                      type="email"
                      className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                    />
                  </div>

                  <button
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer"
                    type="submit"
                  >
                    Send Reset Link
                  </button>

                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={() => switchMode(true)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer transition-colors duration-200"
                    >
                      Cancel and Back to Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-slate-800 text-center">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>

              <p className="text-center text-slate-400 text-xs mt-1.5 mb-6">
                {isLogin ? "Login to continue to SkillGig" : "Join the professional network today"}
              </p>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <>
                    <div className="relative group">
                      <FaUser className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors duration-200" />
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Full name"
                        className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">I want to register as:</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full border border-slate-200 rounded-xl py-3.5 px-4 bg-white outline-none text-slate-700 text-sm font-semibold focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                      >
                        <option value="seeker">Job Seeker</option>
                        <option value="company">Employer / Company</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors duration-200" />
                  <input
                    onChange={handleChange}
                    name="email"
                    value={formData.email}
                    placeholder="Email address"
                    type="email"
                    className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />
                </div>

                <div className="relative group">
                  <FaLock className="absolute left-4 top-[17px] text-slate-400 group-focus-within:text-violet-600 transition-colors duration-200" />
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full border border-slate-200 rounded-xl py-3.5 pl-11 pr-11 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all duration-200"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[17px] text-slate-400 hover:text-slate-600 transition-colors duration-200"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs font-bold text-violet-600 hover:text-violet-700 cursor-pointer transition-colors duration-200"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer"
                  type="submit"
                >
                  {isLogin ? "Login" : "Create Account"}
                </button>

                {isLogin && (
                  <div className="mt-6 p-4.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 flex justify-center gap-6">
                    <div className="text-center flex-1">
                      <p className="font-bold text-slate-700 mb-0.5">Demo Seeker</p>
                      <p className="font-mono text-slate-400 select-all">seeker@demo.com</p>
                      <p className="font-mono text-slate-400 select-all">password123</p>
                    </div>
                    <div className="border-l border-slate-200"></div>
                    <div className="text-center flex-1">
                      <p className="font-bold text-slate-700 mb-0.5">Demo Company</p>
                      <p className="font-mono text-slate-400 select-all">company@demo.com</p>
                      <p className="font-mono text-slate-400 select-all">password123</p>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
