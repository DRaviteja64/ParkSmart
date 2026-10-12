import React from "react";

import {
  CarFront,
  X,
  Bot,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function Sidebar({
  items = [],
  activePage,
  onNavigate,
  open = false,
  onClose,
  onChat,
  profile = {},
  onLogout,
}) {
  const handleNavigate = (pageId) => {
    if (typeof onNavigate === "function") {
      onNavigate(pageId);
    }

    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleChat = () => {
    if (typeof onChat === "function") {
      onChat();
    }
  };

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
    }
  };

  const initials =
    profile.fullName
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PS";

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          className="sidebar-backdrop"
          type="button"
          onClick={handleClose}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${open ? "sidebar-open" : ""}`}
        aria-label="Main sidebar"
      >
        {/* Brand */}
        <div className="brand-row">
          <div className="brand-mark">
            <CarFront size={25} strokeWidth={2.4} />
          </div>

          <div className="brand-copy">
            <strong>
              Park<span>Smart</span>
            </strong>

            <small>SMART PARKING</small>
          </div>

          <button
            className="icon-button sidebar-close"
            type="button"
            onClick={handleClose}
            aria-label="Close menu"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <div className="workspace-label">
          WORKSPACE
        </div>

        <nav
          className="sidebar-nav"
          aria-label="Main navigation"
        >
          {items.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;

            return (
              <button
                key={id}
                type="button"
                className={`nav-item ${
                  isActive ? "nav-item-active" : ""
                }`}
                onClick={() => handleNavigate(id)}
                aria-current={
                  isActive ? "page" : undefined
                }
              >
                {Icon && (
                  <Icon
                    size={19}
                    strokeWidth={1.9}
                  />
                )}

                <span>{label}</span>

                {isActive && (
                  <span className="nav-active-mark" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        {/* AI assistant */}
        <div className="assistant-promo">
          <div className="promo-icon">
            <Sparkles size={18} />
          </div>

          <strong>Need a hand?</strong>

          <p>
            Get quick answers about parking and bookings.
          </p>

          <button
            type="button"
            onClick={handleChat}
          >
            Chat with AI
            <Bot size={16} />
          </button>
        </div>

        {/* User profile */}
        <div className="sidebar-bottom">
          <div className="sidebar-profile-avatar">
            {initials}
          </div>

          <div className="sidebar-profile-copy">
            <strong>
              {profile.fullName || "ParkSmart User"}
            </strong>

            <span>Personal account</span>
          </div>

          <button
            className="icon-button"
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut
              size={17}
              className="logout-icon"
            />
          </button>
        </div>
      </aside>
    </>
  );
}