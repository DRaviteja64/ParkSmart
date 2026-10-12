import React, { useMemo, useState } from "react";

import {
  Bell,
  Menu,
  Moon,
  Sun,
  CarFront,
  LayoutDashboard,
  MapPin,
  CalendarCheck,
  History,
  UserRound,
  Bot,
  CheckCircle2,
  X,
} from "lucide-react";

import "./UserDashBoard.css";

import Sidebar from "../components/Sidebar";
import Overview from "../components/Overview";
import FindParking from "../components/FindParking";
import MyVehicles from "../components/MyVehicles";
import MyBookings from "../components/MyBooking";
import BookingHistory from "../components/BookingHistory";
import MyProfile from "../components/MyProfile";
import AIChatbot from "../components/AIChatbot";

// Read the user saved after a successful login.
function getLoggedInUser() {
  try {
    const storedUser = sessionStorage.getItem("loggedInUser");

    if (!storedUser) {
      return null;
    }

    const parsedUser = JSON.parse(storedUser);

    // Support either the complete login response or its user object.
    const responseUser = parsedUser.user ?? parsedUser;

    if (
      responseUser.userId === null ||
      responseUser.userId === undefined
    ) {
      return null;
    }

    return responseUser;
  } catch (error) {
    console.error("Unable to read logged-in user:", error);
    return null;
  }
}

// Demo vehicles used only when the logged-in user has no vehicles.
const initialVehicles = [
  {
    id: 1,
    number: "AP 05 BH 6531",
    type: "Car",
    label: "Daily ride",
    color: "#DCEBFF",
  },
  {
    id: 2,
    number: "TS 09 EX 2048",
    type: "Bike",
    label: "Two-wheeler",
    color: "#DDF7E8",
  },
];

// Demo parking slots.
const initialSlots = Array.from({ length: 24 }, (_, index) => ({
  id: 1001 + index,

  type:
    index % 5 === 0
      ? "EV"
      : index % 3 === 0
        ? "Bike"
        : "Car",

  status: [2, 5, 8, 13, 17, 20].includes(index)
    ? "Occupied"
    : "Available",

  rate:
    index % 5 === 0
      ? 50
      : index % 3 === 0
        ? 15
        : 30,
}));

// Demo booking.
const initialBookings = [
  {
    id: "PS-2408",
    slotId: 1004,
    vehicle: "AP 05 BH 6531",
    date: "Today",
    time: "10:00 AM – 12:00 PM",
    amount: 60,
    status: "Active",
  },
];

// Sidebar navigation.
const navItems = [
  {
    id: "Overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "Find Parking",
    label: "Find Parking",
    icon: MapPin,
  },
  {
    id: "My Vehicles",
    label: "My Vehicles",
    icon: CarFront,
  },
  {
    id: "My Bookings",
    label: "My Bookings",
    icon: CalendarCheck,
  },
  {
    id: "Booking History",
    label: "Booking History",
    icon: History,
  },
  {
    id: "My Profile",
    label: "My Profile",
    icon: UserRound,
  },
];

export default function UserDashBoard() {
  const loggedInUser = getLoggedInUser();

  // User details from the existing login session.
  const [user, setUser] = useState(() => loggedInUser ?? {});

  const [activePage, setActivePage] = useState("Overview");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Map backend vehicle fields to the format expected by MyVehicles.
  const [vehicles, setVehicles] = useState(() => {
    const userVehicles = loggedInUser?.vehicles;

    if (Array.isArray(userVehicles) && userVehicles.length > 0) {
      return userVehicles.map((vehicle, index) => ({
        id: vehicle.vehicleId ?? vehicle.id ?? index + 1,
        number:
          vehicle.vehicleNumber ?? vehicle.number ?? "",
        type:
          vehicle.vehicleType ?? vehicle.type ?? "Car",
        label:
          vehicle.label ??
          vehicle.vehicleType ??
          vehicle.type ??
          "Vehicle",
        color: "#DCEBFF",
      }));
    }

    // Demo fallback; this is not data retrieved from the backend.
    return initialVehicles;
  });

  const [slots, setSlots] = useState(initialSlots);
  const [bookings, setBookings] = useState(initialBookings);
  const [history, setHistory] = useState([]);

  const [profile, setProfile] = useState({
    fullName: loggedInUser?.fullName ?? "",
    email: loggedInUser?.email ?? "",
    mobile: loggedInUser?.mobile ?? "",
  });

  const [toast, setToast] = useState("");

  // Display a temporary notification.
  const notify = (message) => {
    setToast(message);

    window.setTimeout(() => {
      setToast("");
    }, 2600);
  };

  // Calculate available slots.
  const availableCount = useMemo(
    () =>
      slots.filter((slot) => slot.status === "Available").length,
    [slots]
  );

  // Create a demo booking.
  const createBooking = (slot) => {
    if (slot.status !== "Available") {
      notify("That slot is not available.");
      return;
    }

    const vehicle = vehicles[0];

    if (!vehicle) {
      notify("Add a vehicle before booking a slot.");
      setActivePage("My Vehicles");
      return;
    }

    const booking = {
      id: `PS-${Date.now().toString().slice(-6)}`,
      slotId: slot.id,
      vehicle: vehicle.number,
      date: "Today",
      time: "Next 2 hours",
      amount: Number(slot.rate || 0) * 2,
      status: "Active",
    };

    setBookings((current) => [booking, ...current]);

    setSlots((current) =>
      current.map((item) =>
        item.id === slot.id
          ? { ...item, status: "Occupied" }
          : item
      )
    );

    notify(`Slot ${slot.id} booked in this demo.`);
    setActivePage("My Bookings");
  };

  // Release a demo booking.
  const releaseBooking = (bookingId) => {
    const booking = bookings.find(
      (item) => item.id === bookingId
    );

    if (!booking) {
      return;
    }

    setHistory((current) => [
      { ...booking, status: "Completed" },
      ...current,
    ]);

    setBookings((current) =>
      current.filter((item) => item.id !== bookingId)
    );

    setSlots((current) =>
      current.map((slot) =>
        slot.id === booking.slotId
          ? { ...slot, status: "Available" }
          : slot
      )
    );

    notify(`Booking ${booking.id} released in this demo.`);
  };

  // Add a demo vehicle.
  const addVehicle = (vehicle) => {
    setVehicles((current) => [
      {
        ...vehicle,
        id: Date.now(),
        color: "#EDE9FE",
      },
      ...current,
    ]);

    notify("Vehicle added in this demo.");
  };

  // Delete a demo vehicle.
  const deleteVehicle = (id) => {
    setVehicles((current) =>
      current.filter((vehicle) => vehicle.id !== id)
    );

    notify("Vehicle removed in this demo.");
  };

  // Save profile changes to React state.
  const saveProfile = (updatedProfile) => {
    setProfile(updatedProfile);

    setUser((current) => ({
      ...current,
      ...updatedProfile,
    }));

    notify("Profile updated in this demo.");
  };

  // Handle logout.
  const handleLogout = () => {
    sessionStorage.removeItem("loggedInUser");

    window.location.href = "/login";
  };

  // Render the selected dashboard page.
  const renderPage = () => {
    switch (activePage) {
      case "Find Parking":
        return (
          <FindParking
            slots={slots}
            onBook={createBooking}
          />
        );

      case "My Vehicles":
        return (
          <MyVehicles
            vehicles={vehicles}
            onAdd={addVehicle}
            onDelete={deleteVehicle}
          />
        );

      case "My Bookings":
        return (
          <MyBookings
            bookings={bookings}
            onRelease={releaseBooking}
          />
        );

      case "Booking History":
        return <BookingHistory history={history} />;

      case "My Profile":
        return (
          <MyProfile
            profile={profile}
            onSave={saveProfile}
          />
        );

      case "AI Chatbot":
        return <AIChatbot />;

      case "Overview":
      default:
        return (
          <Overview
            profile={profile}
            availableCount={availableCount}
            totalSlots={slots.length}
            vehicles={vehicles}
            bookings={bookings}
            onNavigate={setActivePage}
            onRelease={releaseBooking}
          />
        );
    }
  };

  return (
    <div
      className={`parksmart-app ${
        darkMode ? "theme-dark" : "theme-light"
      }`}
    >
      {/* Sidebar */}
      <Sidebar
        items={navItems}
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onChat={() => {
          setActivePage("AI Chatbot");
          setSidebarOpen(false);
        }}
        profile={profile}
        onLogout={handleLogout}
      />

      {/* Main dashboard */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="eyebrow">
                YOUR PARKING, SIMPLIFIED
              </p>

              <h1>{activePage}</h1>
            </div>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              type="button"
              onClick={() => notify("You're all caught up.")}
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            <button
              className="icon-button"
              type="button"
              onClick={() =>
                setDarkMode((current) => !current)
              }
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            <div className="topbar-user">
              <div className="avatar">
                {profile.fullName
                  .trim()
                  .split(/\s+/)
                  .filter(Boolean)
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "PS"}
              </div>

              <div className="topbar-user-copy">
                <strong>
                  {profile.fullName || "ParkSmart User"}
                </strong>

                <span>
                  {user.role || "Member"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="page-content">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="dashboard-footer">
          <span>© 2026 ParkSmart</span>

          <span>
            <span className="online-dot" />
            Demo workspace · data stays in this page
          </span>
        </footer>
      </div>

      {/* Floating AI assistant */}
      <button
        className="floating-chat"
        type="button"
        onClick={() => setActivePage("AI Chatbot")}
        aria-label="Open AI assistant"
      >
        <Bot size={22} />
        <span>Ask ParkSmart</span>
      </button>

      {/* Toast notification */}
      {toast && (
        <div className="toast-message" role="status">
          <CheckCircle2 size={18} />

          {toast}

          <button
            type="button"
            onClick={() => setToast("")}
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}