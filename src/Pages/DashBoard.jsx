
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./DashBoard.css";

const initialSlots = [
  { id: "A01", type: "Car", status: "Available", price: 50 },
  { id: "A02", type: "Car", status: "Occupied", price: 50 },
  { id: "A03", type: "EV Car", status: "Available", price: 70 },
  { id: "A04", type: "Bike", status: "Occupied", price: 20 },
  { id: "B01", type: "Car", status: "Available", price: 50 },
  { id: "B02", type: "EV Bike", status: "Maintenance", price: 30 },
  { id: "B03", type: "Car", status: "Occupied", price: 50 },
  { id: "B04", type: "EV Car", status: "Available", price: 70 },
  { id: "C01", type: "Bike", status: "Available", price: 20 },
  { id: "C02", type: "Car", status: "Occupied", price: 50 },
  { id: "C03", type: "EV Car", status: "Available", price: 70 },
  { id: "C04", type: "Car", status: "Available", price: 50 },
];

const initialBookings = [
  {
    id: "BK1001",
    customer: "Rahul Kumar",
    vehicle: "AP05XX6531",
    type: "Car",
    slot: "A02",
    time: "09:15 AM",
    status: "Active",
  },
  {
    id: "BK1002",
    customer: "Priya Sharma",
    vehicle: "TS09AB1234",
    type: "EV Car",
    slot: "A03",
    time: "09:30 AM",
    status: "Active",
  },
  {
    id: "BK1003",
    customer: "Arjun Reddy",
    vehicle: "AP16CD5678",
    type: "Bike",
    slot: "A04",
    time: "10:00 AM",
    status: "Completed",
  },
  {
    id: "BK1004",
    customer: "Sneha Rao",
    vehicle: "TS10EF9876",
    type: "Car",
    slot: "B03",
    time: "10:20 AM",
    status: "Active",
  },
];

function DashBoard() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme !== null ? savedTheme === "dark" : true;
  });

  const [activePage, setActivePage] = useState("Dashboard");
  const [slots, setSlots] = useState(initialSlots);
  const [bookings, setBookings] = useState(initialBookings);
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const stats = useMemo(() => {
    const total = slots.length;
    const occupied = slots.filter(
      (slot) => slot.status === "Occupied"
    ).length;
    const available = slots.filter(
      (slot) => slot.status === "Available"
    ).length;
    const maintenance = slots.filter(
      (slot) => slot.status === "Maintenance"
    ).length;

    return {
      total,
      occupied,
      available,
      maintenance,
      occupancy: total ? Math.round((occupied / total) * 100) : 0,
    };
  }, [slots]);

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesSearch =
        slot.id.toLowerCase().includes(search.toLowerCase()) ||
        slot.type.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        slotFilter === "All" || slot.status === slotFilter;

      return matchesSearch && matchesFilter;
    });
  }, [slots, search, slotFilter]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) =>
      [
        booking.id,
        booking.customer,
        booking.vehicle,
        booking.slot,
      ].some((value) =>
        value.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [bookings, search]);

  const revenue = bookings
    .filter((booking) => booking.status === "Completed")
    .reduce((total, booking) => {
      const slot = slots.find((item) => item.id === booking.slot);
      return total + (slot?.price || 0);
    }, 0);

  function toggleTheme() {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    localStorage.setItem("theme", nextTheme ? "dark" : "light");
  }

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function handleLogout() {
    // Add your backend logout request here when authentication is implemented.
    navigate("/");
  }

  function changeSlotStatus(slotId, newStatus) {
    setSlots((currentSlots) =>
      currentSlots.map((slot) =>
        slot.id === slotId
          ? { ...slot, status: newStatus }
          : slot
      )
    );

    showNotice(`Slot ${slotId} updated to ${newStatus}.`);
  }

  function releaseBooking(bookingId) {
    const booking = bookings.find((item) => item.id === bookingId);

    if (!booking || booking.status !== "Active") return;

    setBookings((currentBookings) =>
      currentBookings.map((item) =>
        item.id === bookingId
          ? { ...item, status: "Completed" }
          : item
      )
    );

    setSlots((currentSlots) =>
      currentSlots.map((slot) =>
        slot.id === booking.slot && slot.status === "Occupied"
          ? { ...slot, status: "Available" }
          : slot
      )
    );

    showNotice(`Booking ${bookingId} has been released.`);
  }

  const navigation = [
    { label: "Dashboard", icon: "bi-grid-1x2-fill" },
    { label: "Parking Slots", icon: "bi-p-square-fill" },
    { label: "Bookings", icon: "bi-calendar-check-fill" },
    { label: "Customers", icon: "bi-people-fill" },
    { label: "Reports", icon: "bi-bar-chart-fill" },
    { label: "Settings", icon: "bi-gear-fill" },
  ];

  function selectPage(page) {
    setActivePage(page);
    setSidebarOpen(false);

    if (page !== "Dashboard" &&
        page !== "Parking Slots" &&
        page !== "Bookings") {
      showNotice(`${page} section is ready to be connected.`);
    }
  }

  return (
    <div className={`ps-app ${darkMode ? "ps-dark" : "ps-light"}`}>
      {sidebarOpen && (
        <button
          className="ps-sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`ps-sidebar ${sidebarOpen ? "ps-sidebar-open" : ""}`}>
        <div className="ps-brand">
          <div className="ps-brand-icon">
            <i className="bi bi-p-circle-fill" />
          </div>
          <div>
            <h4>ParkSmart</h4>
            <span>PARKING MANAGEMENT</span>
          </div>
          <button
            className="ps-close-sidebar"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="ps-nav-label">WORKSPACE</div>

        <nav className="ps-navigation">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`ps-nav-item ${
                activePage === item.label ? "ps-nav-active" : ""
              }`}
              onClick={() => selectPage(item.label)}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>

              {item.label === "Bookings" && (
                <span className="ps-nav-count">
                  {bookings.filter((b) => b.status === "Active").length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="ps-sidebar-bottom">
          <div className="ps-help-card">
            <div className="ps-help-icon">
              <i className="bi bi-headset" />
            </div>
            <h6>Need assistance?</h6>
            <p>Manage your parking operations with confidence.</p>
            <button
              onClick={() => showNotice("Support section is coming soon.")}
            >
              Get Support <i className="bi bi-arrow-up-right" />
            </button>
          </div>

          <button className="ps-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="ps-main">
        <header className="ps-topbar">
          <div className="ps-topbar-left">
            <button
              className="ps-menu-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <i className="bi bi-list" />
            </button>

            <div>
              <div className="ps-breadcrumb">
                Workspace <i className="bi bi-chevron-right" /> {activePage}
              </div>
              <h2>{activePage}</h2>
            </div>
          </div>

          <div className="ps-topbar-right">
            <label className="ps-search">
              <i className="bi bi-search" />
              <input
                type="search"
                placeholder="Search slots, bookings..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search slots and bookings"
              />
              <kbd>⌘ K</kbd>
            </label>

            <button
              className="ps-icon-button"
              onClick={toggleTheme}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              <i className={`bi ${darkMode ? "bi-sun" : "bi-moon-stars"}`} />
            </button>

            <button
              className="ps-icon-button ps-notification"
              onClick={() => showNotice("You are all caught up!")}
              aria-label="Notifications"
            >
              <i className="bi bi-bell" />
              <span />
            </button>

            <div className="ps-profile">
              <div className="ps-avatar">PS</div>
              <div className="ps-profile-info">
                <strong>ParkSmart Admin</strong>
                <span>Administrator</span>
              </div>
              <i className="bi bi-chevron-down ps-profile-arrow" />
            </div>
          </div>
        </header>

        <div className="ps-content">
          {notice && (
            <div className="ps-toast" role="status">
              <i className="bi bi-check-circle-fill" />
              {notice}
              <button
                onClick={() => setNotice("")}
                aria-label="Dismiss notification"
              >
                <i className="bi bi-x" />
              </button>
            </div>
          )}

          {activePage === "Dashboard" && (
            <>
              <section className="ps-welcome">
                <div>
                  <div className="ps-eyebrow">
                    <span className="ps-live-dot" /> LIVE OVERVIEW
                  </div>
                  <h1>Good to see you, Admin <span>👋</span></h1>
                  <p>
                    Here&apos;s what&apos;s happening in your parking facility
                    today.
                  </p>
                </div>

                <button
                  className="ps-primary-button"
                  onClick={() => selectPage("Parking Slots")}
                >
                  <i className="bi bi-p-square" />
                  Manage Parking
                  <i className="bi bi-arrow-up-right" />
                </button>
              </section>

              <section className="ps-stats-grid">
                <article className="ps-stat-card">
                  <div className="ps-stat-top">
                    <div className="ps-stat-icon ps-icon-purple">
                      <i className="bi bi-p-square-fill" />
                    </div>
                    <span className="ps-stat-tag">TOTAL</span>
                  </div>
                  <p>Total Parking Slots</p>
                  <div className="ps-stat-value">{stats.total}</div>
                  <div className="ps-stat-footer">
                    <span> <i className="bi bi-grid" /> Facility capacity</span>
                  </div>
                </article>

                <article className="ps-stat-card">
                  <div className="ps-stat-top">
                    <div className="ps-stat-icon ps-icon-green">
                      <i className="bi bi-check-circle-fill" />
                    </div>
                    <span className="ps-stat-tag ps-tag-green">AVAILABLE</span>
                  </div>
                  <p>Available Slots</p>
                  <div className="ps-stat-value">{stats.available}</div>
                  <div className="ps-stat-footer">
                    <span className="ps-positive">
                      <i className="bi bi-arrow-up-right" /> Ready to park
                    </span>
                  </div>
                </article>

                <article className="ps-stat-card">
                  <div className="ps-stat-top">
                    <div className="ps-stat-icon ps-icon-orange">
                      <i className="bi bi-car-front-fill" />
                    </div>
                    <span className="ps-stat-tag ps-tag-orange">OCCUPIED</span>
                  </div>
                  <p>Occupied Slots</p>
                  <div className="ps-stat-value">{stats.occupied}</div>
                  <div className="ps-stat-footer">
                    <span>
                      <i className="bi bi-activity" /> {stats.occupancy}% occupancy
                    </span>
                  </div>
                </article>

                <article className="ps-stat-card">
                  <div className="ps-stat-top">
                    <div className="ps-stat-icon ps-icon-blue">
                      <i className="bi bi-currency-rupee" />
                    </div>
                    <span className="ps-stat-tag ps-tag-blue">SAMPLE</span>
                  </div>
                  <p>Recorded Revenue</p>
                  <div className="ps-stat-value">
                    ₹{revenue.toLocaleString("en-IN")}
                  </div>
                  <div className="ps-stat-footer">
                    <span> <i className="bi bi-info-circle" /> Demo calculation</span>
                  </div>
                </article>
              </section>

              <section className="ps-overview-grid">
                <article className="ps-panel ps-occupancy-panel">
                  <div className="ps-panel-heading">
                    <div>
                      <h3>Parking Occupancy</h3>
                      <p>Current facility utilization</p>
                    </div>
                    <span className="ps-period-label">
                      <i className="bi bi-clock" /> Current
                    </span>
                  </div>

                  <div className="ps-occupancy-body">
                    <div
                      className="ps-donut"
                      style={{
                        "--occupancy": `${stats.occupancy * 3.6}deg`,
                      }}
                    >
                      <div className="ps-donut-center">
                        <strong>{stats.occupancy}%</strong>
                        <span>Occupied</span>
                      </div>
                    </div>

                    <div className="ps-occupancy-legend">
                      <div>
                        <span className="ps-legend-dot ps-dot-purple" />
                        <span>Occupied</span>
                        <strong>{stats.occupied}</strong>
                      </div>
                      <div>
                        <span className="ps-legend-dot ps-dot-green" />
                        <span>Available</span>
                        <strong>{stats.available}</strong>
                      </div>
                      <div>
                        <span className="ps-legend-dot ps-dot-gray" />
                        <span>Maintenance</span>
                        <strong>{stats.maintenance}</strong>
                      </div>
                      <div className="ps-legend-total">
                        <span>Total capacity</span>
                        <strong>{stats.total} slots</strong>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="ps-panel ps-quick-panel">
                  <div className="ps-panel-heading">
                    <div>
                      <h3>Quick Actions</h3>
                      <p>Common parking operations</p>
                    </div>
                    <i className="bi bi-lightning-charge ps-heading-icon" />
                  </div>

                  <button
                    className="ps-quick-action"
                    onClick={() => selectPage("Parking Slots")}
                  >
                    <span className="ps-quick-icon ps-icon-purple">
                      <i className="bi bi-grid-3x3-gap-fill" />
                    </span>
                    <span className="ps-quick-text">
                      <strong>View Parking Slots</strong>
                      <small>Check availability and status</small>
                    </span>
                    <i className="bi bi-arrow-right" />
                  </button>

                  <button
                    className="ps-quick-action"
                    onClick={() => selectPage("Bookings")}
                  >
                    <span className="ps-quick-icon ps-icon-blue">
                      <i className="bi bi-calendar2-check-fill" />
                    </span>
                    <span className="ps-quick-text">
                      <strong>Manage Bookings</strong>
                      <small>View and release active bookings</small>
                    </span>
                    <i className="bi bi-arrow-right" />
                  </button>

                  <button
                    className="ps-quick-action"
                    onClick={() => showNotice("Reports are not connected yet.")}
                  >
                    <span className="ps-quick-icon ps-icon-orange">
                      <i className="bi bi-file-earmark-bar-graph-fill" />
                    </span>
                    <span className="ps-quick-text">
                      <strong>View Reports</strong>
                      <small>Explore facility performance</small>
                    </span>
                    <i className="bi bi-arrow-right" />
                  </button>
                </article>
              </section>

              <section className="ps-panel ps-slots-panel">
                <div className="ps-panel-heading ps-slots-heading">
                  <div>
                    <h3>Parking Slot Overview</h3>
                    <p>View and manage the current slot status</p>
                  </div>

                  <button
                    className="ps-text-button"
                    onClick={() => selectPage("Parking Slots")}
                  >
                    View all slots <i className="bi bi-arrow-right" />
                  </button>
                </div>

                <div className="ps-slot-grid">
                  {slots.slice(0, 8).map((slot) => (
                    <div className="ps-slot-card" key={slot.id}>
                      <div className="ps-slot-top">
                        <span className="ps-slot-id">{slot.id}</span>
                        <span
                          className={`ps-status ps-status-${slot.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {slot.status}
                        </span>
                      </div>
                      <div className="ps-slot-car">
                        <i className={`bi ${
                          slot.type.toLowerCase().includes("bike")
                            ? "bi-bicycle"
                            : "bi-car-front-fill"
                        }`} />
                      </div>
                      <div className="ps-slot-bottom">
                        <span>{slot.type}</span>
                        <strong>₹{slot.price}/hr</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="ps-panel ps-bookings-panel">
                <div className="ps-panel-heading ps-slots-heading">
                  <div>
                    <h3>Recent Bookings</h3>
                    <p>Latest activity in your facility</p>
                  </div>
                  <button
                    className="ps-text-button"
                    onClick={() => selectPage("Bookings")}
                  >
                    View all bookings <i className="bi bi-arrow-right" />
                  </button>
                </div>

                <BookingTable
                  bookings={bookings.slice(0, 4)}
                  onRelease={releaseBooking}
                />
              </section>
            </>
          )}

          {activePage === "Parking Slots" && (
            <section className="ps-panel ps-page-panel">
              <div className="ps-panel-heading">
                <div>
                  <h3>Parking Slot Management</h3>
                  <p>Update availability and manage individual parking spaces.</p>
                </div>
                <span className="ps-period-label">
                  {filteredSlots.length} slots
                </span>
              </div>

              <div className="ps-filter-row">
                <label>
                  Filter by status
                  <select
                    value={slotFilter}
                    onChange={(event) => setSlotFilter(event.target.value)}
                  >
                    <option>All</option>
                    <option>Available</option>
                    <option>Occupied</option>
                    <option>Maintenance</option>
                  </select>
                </label>
              </div>

              <div className="ps-slot-grid ps-slot-grid-full">
                {filteredSlots.map((slot) => (
                  <div className="ps-slot-card" key={slot.id}>
                    <div className="ps-slot-top">
                      <span className="ps-slot-id">{slot.id}</span>
                      <span
                        className={`ps-status ps-status-${slot.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {slot.status}
                      </span>
                    </div>
                    <div className="ps-slot-car">
                      <i className={`bi ${
                        slot.type.toLowerCase().includes("bike")
                          ? "bi-bicycle"
                          : "bi-car-front-fill"
                      }`} />
                    </div>
                    <div className="ps-slot-bottom">
                      <span>{slot.type}</span>
                      <strong>₹{slot.price}/hr</strong>
                    </div>
                    <label className="ps-slot-control">
                      Change status
                      <select
                        value={slot.status}
                        onChange={(event) =>
                          changeSlotStatus(slot.id, event.target.value)
                        }
                      >
                        <option>Available</option>
                        <option>Occupied</option>
                        <option>Maintenance</option>
                      </select>
                    </label>
                  </div>
                ))}
              </div>

              {filteredSlots.length === 0 && (
                <p className="ps-empty-state">No matching parking slots found.</p>
              )}
            </section>
          )}

          {activePage === "Bookings" && (
            <section className="ps-panel ps-page-panel">
              <div className="ps-panel-heading">
                <div>
                  <h3>Booking Management</h3>
                  <p>Review bookings and release occupied parking slots.</p>
                </div>
                <span className="ps-period-label">
                  {bookings.length} bookings
                </span>
              </div>

              <BookingTable
                bookings={filteredBookings}
                onRelease={releaseBooking}
              />

              {filteredBookings.length === 0 && (
                <p className="ps-empty-state">No matching bookings found.</p>
              )}
            </section>
          )}

          {["Customers", "Reports", "Settings"].includes(activePage) && (
            <section className="ps-panel ps-placeholder-panel">
              <div className="ps-placeholder-icon">
                <i className={`bi ${
                  navigation.find((item) => item.label === activePage)?.icon
                }`} />
              </div>
              <h3>{activePage}</h3>
              <p>
                This section is ready for integration with your Spring Boot
                APIs and MySQL database.
              </p>
              <button
                className="ps-primary-button"
                onClick={() => setActivePage("Dashboard")}
              >
                <i className="bi bi-arrow-left" /> Back to Dashboard
              </button>
            </section>
          )}

          <footer className="ps-footer">
            <span>© {new Date().getFullYear()} ParkSmart</span>
            <span>
              Smart parking. <strong>Simplified.</strong>
            </span>
            <span>
              <i className="bi bi-circle-fill ps-footer-dot" /> System interface
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

function BookingTable({ bookings, onRelease }) {
  return (
    <div className="ps-table-wrapper">
      <table className="ps-table">
        <thead>
          <tr>
            <th>BOOKING ID</th>
            <th>CUSTOMER</th>
            <th>VEHICLE NUMBER</th>
            <th>SLOT</th>
            <th>TIME</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td><strong>{booking.id}</strong></td>
              <td>{booking.customer}</td>
              <td><span className="ps-vehicle-number">{booking.vehicle}</span></td>
              <td><span className="ps-table-slot">{booking.slot}</span></td>
              <td>{booking.time}</td>
              <td>
                <span
                  className={`ps-status ps-status-${booking.status.toLowerCase()}`}
                >
                  {booking.status}
                </span>
              </td>
              <td>
                {booking.status === "Active" ? (
                  <button
                    className="ps-release-button"
                    onClick={() => onRelease(booking.id)}
                  >
                    Release
                  </button>
                ) : (
                  <span className="ps-completed-label">Completed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DashBoard;