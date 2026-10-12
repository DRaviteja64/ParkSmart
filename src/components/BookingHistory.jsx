import React from "react";

import {
  History,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";

export default function BookingHistory({ history = [] }) {
  return (
    <div className="page-stack">

      {/* Page heading */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">
            PAST RESERVATIONS
          </p>

          <h2>Booking History</h2>

          <p>
            View your previously completed parking bookings.
          </p>
        </div>

        <span className="count-chip">
          <History size={16} />

          {history.length}{" "}
          {history.length === 1 ? "record" : "records"}
        </span>
      </div>

      {/* Booking history card */}
      <section className="content-card history-card">

        {/* Card heading */}
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              ACTIVITY
            </p>

            <h3>Recent Parking Activity</h3>
          </div>
        </div>

        {/* Display history or empty state */}
        {history.length > 0 ? (

          <div className="table-scroll">
            <table className="data-table">

              {/* Table headings */}
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Parking Slot</th>
                  <th>Vehicle</th>
                  <th>Date / Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              {/* Booking records */}
              <tbody>
                {history.map((booking) => (
                  <tr key={booking.id}>

                    <td>
                      <strong>
                        {booking.id}
                      </strong>
                    </td>

                    <td>
                      #{booking.slotId}
                    </td>

                    <td>
                      {booking.vehicle || "—"}
                    </td>

                    <td>
                      {booking.date || "—"}
                      {" · "}
                      {booking.time || "—"}
                    </td>

                    <td>
                      ₹
                      {Number(booking.amount || 0).toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      <span className="status-pill pill-complete">
                        <CheckCircle2 size={13} />

                        {booking.status === "Cancelled"
                          ? "Cancelled"
                          : "Completed"}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        ) : (

          /* Empty state */
          <div className="empty-state">

            <div className="empty-icon">
              <CalendarDays size={26} />
            </div>

            <h4>No Booking History Yet</h4>

            <p>
              Your completed or released parking bookings
              will appear here.
            </p>

          </div>

        )}

      </section>

      {/* Information notice */}
      <p className="demo-note">
        Booking history currently uses React state.
        Connect your backend API to retrieve persistent
        booking records from your database.
      </p>

    </div>
  );
}