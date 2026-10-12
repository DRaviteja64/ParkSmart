import React from "react";

import {
  CalendarCheck,
  Clock3,
  MapPin,
  CarFront,
  XCircle,
} from "lucide-react";

export default function MyBookings({
  bookings = [],
  onRelease,
}) {
  // Handle releasing a parking booking
  const handleRelease = (bookingId) => {
    if (typeof onRelease === "function") {
      onRelease(bookingId);
    }
  };

  return (
    <div className="page-stack">

      {/* Page heading */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            YOUR RESERVATIONS
          </p>

          <h2>My Bookings</h2>

          <p>
            View and manage your active parking reservations
            in one place.
          </p>
        </div>

        <span className="count-chip">
          <CalendarCheck size={16} />

          {bookings.length}{" "}
          {bookings.length === 1 ? "booking" : "bookings"}
        </span>
      </div>

      {/* Display bookings or the empty state */}
      {bookings.length > 0 ? (

        <div className="booking-list">

          {bookings.map((booking) => (
            <article
              className="content-card booking-detail-card"
              key={booking.id}
            >

              {/* Parking slot icon */}
              <div className="booking-detail-icon">
                <MapPin size={25} />
              </div>

              {/* Booking information */}
              <div className="booking-detail-main">

                <div className="booking-title-line">
                  <h3>
                    Parking Slot {booking.slotId}
                  </h3>

                  <span
                    className={`status-pill ${
                      booking.status === "Active"
                        ? "pill-active"
                        : "pill-available"
                    }`}
                  >
                    {booking.status || "Unknown"}
                  </span>
                </div>

                <p className="booking-reference">
                  Booking Reference: {booking.id}
                </p>

                {/* Vehicle, date, and time */}
                <div className="booking-meta">

                  <span>
                    <CarFront size={15} />

                    {booking.vehicle || "No vehicle specified"}
                  </span>

                  <span>
                    <CalendarCheck size={15} />

                    {booking.date || "Date unavailable"}
                  </span>

                  <span>
                    <Clock3 size={15} />

                    {booking.time || "Time unavailable"}
                  </span>

                </div>
              </div>

              {/* Price and release action */}
              <div className="booking-detail-price">

                <span>Estimated Amount</span>

                <strong>
                  ₹
                  {Number(booking.amount || 0).toLocaleString(
                    "en-IN"
                  )}
                </strong>

                {booking.status === "Active" && (
                  <button
                    type="button"
                    className="button button-outline-danger"
                    onClick={() => handleRelease(booking.id)}
                  >
                    <XCircle size={16} />

                    Release Slot
                  </button>
                )}

              </div>

            </article>
          ))}

        </div>

      ) : (

        /* Empty state */
        <div className="content-card empty-state">

          <div className="empty-icon">
            <CalendarCheck size={26} />
          </div>

          <h3>No Active Bookings</h3>

          <p>
            When you reserve a parking slot, your booking
            will appear here.
          </p>

          <span className="demo-note">
            Open Find Parking to create a demo reservation.
          </span>

        </div>

      )}

    </div>
  );
}