import React, { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Save,
  ShieldCheck,
} from "lucide-react";

export default function MyProfile({ profile = {}, onSave }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    ...profile,
  });

  // Update the form whenever the profile prop changes
  useEffect(() => {
    setForm({
      fullName: "",
      email: "",
      mobile: "",
      ...profile,
    });
  }, [profile]);

  // Handle input changes
  const handleChange = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();

    if (typeof onSave === "function") {
      onSave({ ...form });
    }
  };

  // Generate profile initials safely
  const initials =
    form.fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PS";

  return (
    <div className="page-stack">
      {/* Page heading */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">ACCOUNT SETTINGS</p>
          <h2>My Profile</h2>
          <p>
            Manage the contact details shown in your workspace.
          </p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Profile preview */}
        <section className="content-card profile-card">
          <div className="profile-cover" />

          <div className="profile-avatar-large">
            {initials}
          </div>

          <h3>{form.fullName || "Your name"}</h3>

          <p>{form.email || "Your email address"}</p>

          <span className="status-pill pill-available">
            <ShieldCheck size={14} />
            Personal account
          </span>

          <div className="profile-side-note">
            <strong>Your ParkSmart account</strong>

            <span>
              Your profile information is used to personalize
              this dashboard.
            </span>
          </div>
        </section>

        {/* Profile edit form */}
        <form
          className="content-card profile-form"
          onSubmit={handleSubmit}
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">PERSONAL DETAILS</p>
              <h3>Profile Information</h3>
            </div>
          </div>

          {/* Full name */}
          <label className="form-label">
            <span>
              <UserRound size={15} />
              Full Name
            </span>

            <input
              type="text"
              value={form.fullName}
              onChange={(event) =>
                handleChange("fullName", event.target.value)
              }
              placeholder="Enter your full name"
              autoComplete="name"
              required
            />
          </label>

          {/* Email address */}
          <label className="form-label">
            <span>
              <Mail size={15} />
              Email Address
            </span>

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                handleChange("email", event.target.value)
              }
              placeholder="Enter your email address"
              autoComplete="email"
              required
            />
          </label>

          {/* Mobile number */}
          <label className="form-label">
            <span>
              <Phone size={15} />
              Mobile Number
            </span>

            <input
              type="tel"
              value={form.mobile}
              onChange={(event) =>
                handleChange("mobile", event.target.value)
              }
              placeholder="Enter your mobile number"
              autoComplete="tel"
              required
            />
          </label>

          {/* Submit button */}
          <div className="form-actions">
            <button
              className="button button-primary"
              type="submit"
            >
              <Save size={17} />
              Save Changes
            </button>
          </div>

          <p className="demo-note">
            Changes update this dashboard only. Connect a profile
            API to save changes permanently.
          </p>
        </form>
      </div>
    </div>
  );
}