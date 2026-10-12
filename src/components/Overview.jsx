import React from "react";
import {
  ArrowUpRight,
  MapPin,
  CarFront,
  CalendarCheck,
  Wallet,
  Clock3,
  ChevronRight,
  CircleParking,
  Sparkles,
} from "lucide-react";

const useEffect= async ()=>{
  const response= await fetch("",{})
}

export default function Overview({
  profile = {},
  availableCount = 0,
  totalSlots = 150,
  vehicles = [],
  bookings = [],
  onNavigate,
  onRelease,
}) {
  // Get active bookings
  const activeBookings = bookings.filter(
    (booking) => booking.status === "Active"
  );

  // Calculate total booking value
  const totalSpent = bookings.reduce(
    (sum, booking) => sum + Number(booking.amount || 0),
    0
  );

  // Get the user's first name safely
  const firstName =
    profile.fullName?.trim().split(/\s+/)[0] || "there";

  // Safely handle navigation
  const navigateTo = (page) => {
    if (typeof onNavigate === "function") {
      onNavigate(page);
    }
  };

  // Safely handle releasing a booking
  const releaseBooking = (bookingId) => {
    if (typeof onRelease === "function") {
      onRelease(bookingId);
    }
  };

  return (
    <div className="page-stack">
      {/* Welcome banner */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <span className="banner-kicker">
            <Sparkles size={14} />
            YOUR DAILY PARKING COMPANION
          </span>

          <h2>
            Good to see you, {firstName}{" "}
            <span className="wave">✦</span>
          </h2>

          <p>
            Find a spot, manage your vehicles, and keep every
            journey moving.
          </p>

          <button
            className="button button-light"
            type="button"
            onClick={() => navigateTo("Find Parking")}
          >
            Find a parking spot
            <ArrowUpRight size={17} />
          </button>
        </div>

        {/* Decorative illustration */}
        <div className="banner-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />

          <div className="art-car">
            <CarFront size={88} strokeWidth={1.2} />
          </div>

          <div className="art-pin">
            <MapPin size={27} />
          </div>

          <div className="art-spark spark-one">✦</div>
          <div className="art-spark spark-two">✧</div>
        </div>
      </section>

      {/* Dashboard statistics */}
      <section
        className="stats-grid"
        aria-label="Parking statistics"
      >
        {/* Available parking slots */}
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon stat-blue">
              <CircleParking size={20} />
            </span>

            <span className="stat-caption">
              LIVE AVAILABILITY
            </span>
          </div>

          <strong className="stat-value">
            {availableCount}
            <small> / {totalSlots}</small>
          </strong>

          <div className="stat-bottom">
            <span className="status-dot status-green" />
            Available slots

            <button
              type="button"
              onClick={() => navigateTo("Find Parking")}
              aria-label="Find parking"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </article>

        {/* Active bookings */}
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon stat-purple">
              <CalendarCheck size={20} />
            </span>

            <span className="stat-caption">
              YOUR RESERVATIONS
            </span>
          </div>

          <strong className="stat-value">
            {String(activeBookings.length).padStart(2, "0")}
          </strong>

          <div className="stat-bottom">
            <span className="stat-muted">
              Active bookings
            </span>

            <button
              type="button"
              onClick={() => navigateTo("My Bookings")}
              aria-label="View bookings"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </article>

        {/* Registered vehicles */}
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon stat-orange">
              <CarFront size={20} />
            </span>

            <span className="stat-caption">
              YOUR GARAGE
            </span>
          </div>

          <strong className="stat-value">
            {String(vehicles.length).padStart(2, "0")}
          </strong>

          <div className="stat-bottom">
            <span className="stat-muted">
              Registered vehicles
            </span>

            <button
              type="button"
              onClick={() => navigateTo("My Vehicles")}
              aria-label="View vehicles"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </article>

        {/* Booking value */}
        <article className="stat-card">
          <div className="stat-top">
            <span className="stat-icon stat-green">
              <Wallet size={20} />
            </span>

            <span className="stat-caption">
              BOOKING VALUE
            </span>
          </div>

          <strong className="stat-value">
            ₹
            {totalSpent.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </strong>

          <div className="stat-bottom">
            <span className="stat-muted">
              Total booking value
            </span>

            <button
              type="button"
              onClick={() => navigateTo("Booking History")}
              aria-label="View booking history"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </article>
      </section>

      {/* Booking and quick-action sections */}
      <div className="overview-grid">
        {/* Current bookings */}
        <section className="content-card booking-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">UP NEXT</p>
              <h3>Current Bookings</h3>
            </div>

            <button
              className="text-link"
              type="button"
              onClick={() => navigateTo("My Bookings")}
            >
              View all
              <ChevronRight size={16} />
            </button>
          </div>

          {activeBookings.length === 0 ? (
            <div className="empty-state compact-empty">
              <div className="empty-icon">
                <CalendarCheck size={24} />
              </div>

              <h4>No active bookings yet</h4>

              <p>
                Your upcoming parking reservations will appear
                here.
              </p>

              <button
                className="button button-primary"
                type="button"
                onClick={() => navigateTo("Find Parking")}
              >
                Find parking
              </button>
            </div>
          ) : (
            activeBookings.slice(0, 2).map((booking) => (
              <div className="booking-row" key={booking.id}>
                <div className="booking-slot-icon">
                  <MapPin size={22} />
                </div>

                <div className="booking-main">
                  <div className="booking-title-line">
                    <strong>Slot {booking.slotId}</strong>

                    <span className="status-pill pill-active">
                      {booking.status}
                    </span>
                  </div>

                  <p>{booking.vehicle || "Vehicle not specified"}</p>

                  <span className="booking-time">
                    <Clock3 size={14} />

                    {booking.date || "Date not specified"}
                    {" · "}
                    {booking.time || "Time not specified"}
                  </span>
                </div>

                <div className="booking-price">
                  <strong>
                    ₹
                    {Number(booking.amount || 0).toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                  <span>estimated</span>

                  <button
                    className="subtle-action"
                    type="button"
                    onClick={() => releaseBooking(booking.id)}
                  >
                    Release
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Quick actions */}
        <section className="content-card quick-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">GET MOVING</p>
              <h3>Quick Actions</h3>
            </div>
          </div>

          <button
            className="quick-action"
            type="button"
            onClick={() => navigateTo("Find Parking")}
          >
            <span className="quick-icon quick-blue">
              <MapPin size={20} />
            </span>

            <span>
              <strong>Find parking</strong>
              <small>Browse available parking slots</small>
            </span>

            <ArrowUpRight size={17} />
          </button>

          <button
            className="quick-action"
            type="button"
            onClick={() => navigateTo("My Vehicles")}
          >
            <span className="quick-icon quick-orange">
              <CarFront size={20} />
            </span>

            <span>
              <strong>Manage vehicles</strong>
              <small>Update your garage</small>
            </span>

            <ArrowUpRight size={17} />
          </button>

          <button
            className="quick-action"
            type="button"
            onClick={() => navigateTo("My Profile")}
          >
            <span className="quick-icon quick-purple">
              <Wallet size={20} />
            </span>

            <span>
              <strong>My account</strong>
              <small>Review your profile</small>
            </span>

            <ArrowUpRight size={17} />
          </button>
        </section>
      </div>

      {/* Helpful tip */}
      <section className="tip-banner">
        <div className="tip-icon">
          <Sparkles size={20} />
        </div>

        <div>
          <strong>A little tip for a smoother trip</strong>

          <p>
            Keep your vehicle details up to date to make booking
            faster next time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigateTo("My Vehicles")}
        >
          Manage vehicles
          <ChevronRight size={16} />
        </button>
      </section>
    </div>
  );
}