/**
 * =============================================================================
 * SIGNUP PAGE - TODO: NATALIA
 * =============================================================================
 * File: frontend/src/components/pages/Signup/Signup.jsx
 * Assigned to: NATALIA (API Logic) + PABLO (UI/Styling)
 * Status: TODO 🟡
 *
 * REFERENCE: See branch 'pablo-working-backup' for working implementation
 * =============================================================================
 *
 * WHAT THIS FILE DOES:
 * - Renders signup form with username, email, password, confirmPassword
 * - Validates form input before submission
 * - POSTs to /api/auth/signup/ endpoint
 * - Redirects to /login on success
 * - Shows error messages on failure
 *
 * =============================================================================
 * IMPLEMENTATION HINTS:
 * =============================================================================
 *
 * 1. STATE YOU NEED:
 *    - formData: { username: '', email: '', password: '', confirmPassword: '' }
 *    - errors: {} for validation errors
 *    - isLoading: boolean for submit button state
 *    - showPassword: boolean for password visibility toggle
 *    - showConfirmPassword: boolean for confirm password visibility
 *
 * 2. FORM VALIDATION:
 *    - Username: required, min 3 characters
 *    - Email: required, must match email pattern
 *    - Password: required, min 6 characters
 *    - ConfirmPassword: required, must match password
 *
 * 3. HANDLE SUBMIT:
 *    - Validate form
 *    - POST to http://localhost:8000/api/auth/signup/
 *    - Body: { username, email, password }
 *    - If success: navigate('/login')
 *    - If fail: show error message
 *
 * 4. ICONS AVAILABLE:
 *    - BackArrowGradientIcon - for back button
 *    - EyeIcon, EyeOffIcon - for password visibility toggle
 *
 * =============================================================================
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import "./Signup.scss";
import { BackArrowGradientIcon, EyeIcon, EyeOffIcon } from "@assets/icons";
import AuthLoader from "@components/ui/AuthLoader/AuthLoader";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  // TODO: Add form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update form state when user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    // update specific field in formData
    setFormData((prev) => ({ ...prev, [name]: value }));
    // clear specific field error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // HINT: Update formData[e.target.name] with e.target.value
    // HINT: Clear errors[e.target.name] when user types
  };

  // Validate all form fields
  const validateForm = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!formData.email || !emailPattern.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    // HINT: Return object of errors
    // Check: username required, min 3 chars
    // Check: email required, email format valid
    // Check: password required, min 6 chars
    // Check: confirmPassword required, must match password

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    //validate before calling API
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // stop submission if errors
    }

    setIsLoading(true);
    try {
      // Use AuthContext signup which also auto-logs in the user
      const result = await signup(formData.username, formData.email, formData.password);
      if (result.success) {
        if (result.autoLoginFailed) {
          // Signup worked but auto-login failed - redirect to login page
          navigate("/login", { state: { message: "Account created! Please log in." } });
        } else {
          // Signup + auto-login succeeded, navigate to welcome landing page
          navigate("/", { state: { welcome: true } });
        }
      } else {
        // Signup or login failed
        const errorMsg = typeof result.error === 'string' 
          ? result.error 
          : result.error?.detail || result.error?.email?.[0] || result.error?.username?.[0] || "Signup failed. Please try again.";
        setErrors({ submit: errorMsg });
      }
    } catch {
      setErrors({ submit: "Network error. Is the backend running?" });
    } finally {
      setIsLoading(false);
    }
    // HINT:
    // 1. Validate form
    // 2. If errors, setErrors and return
    // 3. setIsLoading(true)
    // 4. POST to 'http://localhost:8000/api/auth/signup/' with fetch()
    // 5. Body: { username, email, password } (NOT confirmPassword)
    // 6. If success: navigate('/login')
    // 7. If fail: setErrors({ submit: data.error })
    // 8. setIsLoading(false) in finally block
  };

  return (
    <div className="signup-container">
      <AuthLoader isVisible={isLoading} mode="signup" />
      <div className="signup-card">
        <button
          onClick={() => navigate("/")}
          className="back-button"
          title="Back to Home"
        >
          <BackArrowGradientIcon size={32} />
        </button>

        <div className="signup-header">
          <h1 className="signup-title">
            <span className="title-word-left" data-word="Join">
              Join
            </span>
            <span className="title-separator">•</span>
            <span className="title-word-right" data-word="NUMENEON">
              NUMENEON
            </span>
          </h1>
          <p className="signup-subtitle">Create your account to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* TODO: Username input field */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? "error" : ""}`}
              placeholder="Choose a username…"
              autoComplete="username"
            />
            {errors.username && (
              <span className="error-message">{errors.username}</span>
            )}
          </div>

          {/* TODO: Email input field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? "error" : ""}`}
              placeholder="Enter your email…"
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* TODO: Password input field with visibility toggle */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? "error" : ""}`}
                placeholder="Create a password…"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* TODO: Confirm Password input field with visibility toggle */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                placeholder="Confirm your password…"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon size={20} />
                ) : (
                  <EyeIcon size={20} />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* Submit error message */}
          {errors.submit && (
            <div className="error-message submit-error">{errors.submit}</div>
          )}

          {/* Submit button */}
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{" "}
            <button onClick={() => navigate("/login")} className="link-button">
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
