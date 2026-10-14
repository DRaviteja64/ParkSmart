import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  CarFront,
  Bike,
  Zap,
  CheckCircle2,
  RefreshCw,
  Clock3,
  CalendarDays,
  Phone,
  IndianRupee,
  AlertCircle,
  ParkingCircle,
} from "lucide-react";
import "./FindParking.css";

const API_BASE_URL = "http://localhost:8080";
const PARKING_SLOTS_URL = `${API_BASE_URL}/api/parking-slots`;
const MY_VEHICLES_URL = `${API_BASE_URL}/api/vehicles/by-mobile`;
const BOOKING_URL = `${API_BASE_URL}/BookingSlotData`;

function getLoggedInUser() {
  try {
    const storedUser = sessionStorage.getItem("loggedInUser");
    if (!storedUser) return {};

    const parsedUser = JSON.parse(storedUser);
    return parsedUser.user ?? parsedUser;
  } catch (error) {
    console.error("[ParkSmart] Could not read logged-in user:", error);
    return {};
  }
}

function normalizeVehicleNumber(value) {
  return String(value ?? "").trim().toUpperCase();
}

function normalizeSlot(slot) {
  const rawAvailability = slot.isAvailable ?? slot.is_available;
  const explicitStatus = String(slot.status ?? "").toLowerCase();

  let isAvailable;
  if (rawAvailability !== undefined && rawAvailability !== null) {
    isAvailable =
      rawAvailability === true ||
      rawAvailability === 1 ||
      rawAvailability === "1" ||
      String(rawAvailability).toLowerCase() === "true";
  } else {
    isAvailable = explicitStatus === "available";
  }

  const rawRate = Number(
    slot.hourlyRate ?? slot.hourly_rate ?? slot.rate ?? 30
  );

  return {
    slotId: slot.slotId ?? slot.slot_id,
    // Prefer the human-facing slot number (for example 1001) over the
    // database primary key (for example slotId: 1).
    id: String(
      slot.slotNumber ??
        slot.slot_number ??
        slot.id ??
        slot.slotId ??
        slot.slot_id ??
        ""
    ),
    status: isAvailable ? "Available" : "Occupied",
    rate: Number.isFinite(rawRate) && rawRate >= 0 ? rawRate : 30,
    userId: slot.userId ?? slot.user_id ?? null,
    vehicleNumber: slot.vehicleNumber ?? slot.vehicle_number ?? null,
    type: slot.type ?? slot.vehicleType ?? slot.vehicle_type ?? "Car",
  };
}

export default function FindParking({
  slots: initialSlots = [],
  onBook,
}) {
  const loggedInUser = useMemo(() => getLoggedInUser(), []);

  // Load this account's vehicles from the backend, not only from login-session
  // data (which can be stale after adding another vehicle).
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

  const [parkSlots, setParkSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  // The mobile number is taken from the logged-in account, never from editable form input.
  const accountMobileNumber = String(
    loggedInUser.mobile ?? loggedInUser.mobileNumber ?? ""
  ).trim();

  const [vehicleNumber, setVehicleNumber] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMyVehicles() {
      setVehiclesLoading(true);

      if (!accountMobileNumber) {
        setVehicles([]);
        setVehiclesLoading(false);
        console.error("[ParkSmart] LOGGED_IN_USER_MOBILE_MISSING");
        return;
      }

      try {
        const url = new URL(MY_VEHICLES_URL);
        url.searchParams.set("mobileNumber", accountMobileNumber);

        console.log("[ParkSmart] FETCH_MY_VEHICLES_REQUEST", {
          endpoint: url.pathname,
          mobileNumber: accountMobileNumber,
        });

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        const responseText = await response.text();
        let data = [];
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch {
            throw new Error("The vehicles API returned invalid JSON.");
          }
        }

        if (!response.ok) {
          throw new Error(
            data?.message || `Unable to retrieve vehicles (HTTP ${response.status}).`
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("The vehicles API must return a JSON array.");
        }

        const normalizedVehicles = data
          .map((vehicle) => {
            const number = normalizeVehicleNumber(
              vehicle.vehicleNumber ??
              vehicle.vehicle_number ??
              vehicle.number
            );
            const type = String(
              vehicle.vehicleType ??
              vehicle.vehicle_type ??
              vehicle.type ??
              "CAR"
            ).trim().toUpperCase();

            return {
              vehicleId: vehicle.vehicleId ?? vehicle.vehicle_id ?? vehicle.id,
              vehicleNumber: number,
              vehicleType: type,
              // Aliases keep the existing booking UI compatible.
              vehicle_number: number,
              vehicle_type: type,
            };
          })
          .filter((vehicle) => vehicle.vehicleNumber);

        setVehicles(normalizedVehicles);
        setVehicleNumber((current) => {
          const stillRegistered = normalizedVehicles.some(
            (vehicle) => vehicle.vehicleNumber === current
          );
          return stillRegistered
            ? current
            : (normalizedVehicles[0]?.vehicleNumber ?? "");
        });

        console.log("[ParkSmart] FETCH_MY_VEHICLES_SUCCESS", {
          totalVehicles: normalizedVehicles.length,
          vehicles: normalizedVehicles,
        });
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          console.error("[ParkSmart] FETCH_MY_VEHICLES_FAILED:", fetchError);
          setError(fetchError.message || "Unable to retrieve your vehicles.");
          setVehicles([]);
        }
      } finally {
        if (!controller.signal.aborted) setVehiclesLoading(false);
      }
    }

    fetchMyVehicles();
    return () => controller.abort();
  }, [accountMobileNumber]);

  const [now, setNow] = useState(() => new Date());
  const [bookingMode, setBookingMode] = useState("CUSTOM");
  const [durationHours, setDurationHours] = useState(2);

  // Keep the current local time visible and refreshed every second.
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const currentTimeForApi = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);


  const fetchParkingSlots = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(PARKING_SLOTS_URL, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(
          `Unable to retrieve parking slots (HTTP ${response.status}).`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "The parking-slots API did not return a JSON array."
        );
      }

      const normalizedSlots = data.map(normalizeSlot);
      setParkSlots(normalizedSlots);

      console.log("[ParkSmart] ALL_PARKING_SLOTS", {
        total: normalizedSlots.length,
        available: normalizedSlots.filter(
          (slot) => slot.status === "Available"
        ).length,
        occupied: normalizedSlots.filter(
          (slot) => slot.status === "Occupied"
        ).length,
        slots: normalizedSlots,
      });
    } catch (fetchError) {
      console.error(
        "[ParkSmart] FETCH_PARKING_SLOTS_FAILED:",
        fetchError
      );
      setError(
        `${fetchError.message} Check that Spring Boot is running and inspect its console for server errors.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParkingSlots();
  }, [fetchParkingSlots]);

  // Use backend data whenever it exists; initialSlots is a compatibility fallback.
  const displayedSlots =
    parkSlots.length > 0
      ? parkSlots
      : !loading && initialSlots.length > 0
        ? initialSlots.map(normalizeSlot)
        : parkSlots;

  const filteredSlots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return displayedSlots.filter((slot) => {
      const matchesQuery = String(slot.id)
        .toLowerCase()
        .includes(normalizedQuery);

      const matchesFilter =
        filter === "All" ||
        (filter === "Available" && slot.status === "Available") ||
        (filter === "Occupied" && slot.status === "Occupied");

      return matchesQuery && matchesFilter;
    });
  }, [displayedSlots, query, filter]);

  const selectedSlot = displayedSlots.find(
    (slot) => String(slot.id) === String(selected)
  );

  const availableCount = displayedSlots.filter(
    (slot) => slot.status === "Available"
  ).length;

  const occupiedCount = displayedSlots.filter(
    (slot) => slot.status === "Occupied"
  ).length;

  const cleanVehicleNumber = normalizeVehicleNumber(vehicleNumber);

  const slotForSelectedVehicle = displayedSlots.find(
    (slot) =>
      slot.status === "Occupied" &&
      normalizeVehicleNumber(slot.vehicleNumber) === cleanVehicleNumber
  );

  const selectedVehicleAlreadyParked = Boolean(
    cleanVehicleNumber && slotForSelectedVehicle
  );

  const vehicleIsRegistered = vehicles.some(
    (vehicle) =>
      normalizeVehicleNumber(
        vehicle.vehicleNumber ?? vehicle.vehicle_number
      ) === cleanVehicleNumber
  );

  function getVehicleType(vehicle) {
    return String(
      vehicle?.vehicleType ?? vehicle?.vehicle_type ?? vehicle?.type ?? ""
    ).toUpperCase();
  }

  function SlotTypeIcon({ type }) {
    const normalizedType = String(type ?? "").toUpperCase();

    if (
      normalizedType.includes("BIKE") ||
      normalizedType.includes("TWO")
    ) {
      return <Bike size={19} aria-hidden="true" />;
    }

    if (normalizedType.includes("EV")) {
      return <Zap size={19} aria-hidden="true" />;
    }

    return <CarFront size={19} aria-hidden="true" />;
  }

  async function handleBooking() {
    setError("");
    setSuccess("");

    if (!selectedSlot) {
      setError("Please select an available parking slot.");
      return;
    }

    if (selectedSlot.status !== "Available") {
      setError("This slot is no longer available. Refresh the slot list.");
      await fetchParkingSlots();
      return;
    }

    const cleanMobile = accountMobileNumber;

    if (!/^[0-9]{10,15}$/.test(cleanMobile)) {
      setError("Your registered mobile number is missing or invalid. Please sign out and sign in again.");
      return;
    }

    if (vehicles.length === 0) {
      setError(
        "No registered vehicles were found. Register a vehicle before booking."
      );
      return;
    }

    if (!vehicleIsRegistered) {
      setError("Choose a vehicle registered to your account.");
      return;
    }

    if (selectedVehicleAlreadyParked) {
      setError(
        `${cleanVehicleNumber} already has an occupied slot (${slotForSelectedVehicle.id}). Choose another registered vehicle or release the existing booking first.`
      );
      return;
    }

    if (bookingMode === "FIXED" && (
      !Number.isInteger(Number(durationHours)) ||
      Number(durationHours) < 1 ||
      Number(durationHours) > 24
    )) {
      setError("Parking duration must be between 1 and 24 hours.");
      return;
    }

    // Both options start now. CUSTOM means the final charge is calculated on exit.
    const bookingRequest = {
      slotId: selectedSlot.slotId,
      mobileNumber: cleanMobile,
      vehicleNumber: cleanVehicleNumber,
      billingMode: bookingMode === "FIXED" ? "FIXED_DURATION" : "PAY_ON_EXIT",
      bookingDate: currentDate,
      startTime: currentTimeForApi,
      // Keep the existing API's required integer field until its DTO is updated
      // to make durationHours optional for PAY_ON_EXIT.
      durationHours: Number(durationHours),
    };

    setBookingLoading(true);

    try {
      console.log("[ParkSmart] BOOKING_REQUEST", bookingRequest);

      const response = await fetch(BOOKING_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bookingRequest),
      });

      const responseText = await response.text();
      let responseData = {};

      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { message: responseText };
        }
      }

      if (!response.ok) {
        throw new Error(
          responseData.message ??
            `Booking failed with HTTP ${response.status}.`
        );
      }

      setSuccess(
        responseData.message ??
          `Booking request submitted for vehicle ${cleanVehicleNumber}.`
      );

      console.log("[ParkSmart] BOOKING_SUCCESS", {
        request: bookingRequest,
        response: responseData,
      });

      if (typeof onBook === "function") {
        onBook({
          ...selectedSlot,
          ...bookingRequest,
          status: "Occupied",
        });
      }

      setSelected(null);
      await fetchParkingSlots();
    } catch (bookingError) {
      console.error("[ParkSmart] BOOKING_REQUEST_FAILED", {
        message: bookingError.message,
        slotId: selectedSlot.slotId,
        vehicleNumber: cleanVehicleNumber,
      });

      setError(
        `${bookingError.message} Verify that your Spring Boot booking endpoint accepts these request fields and saves the booking.`
      );
    } finally {
      setBookingLoading(false);
    }
  }

  return (
    <main className="fp-page">
      <header className="fp-hero">
        <div className="fp-hero-copy">
          <div className="fp-kicker">
            <span className="fp-kicker-dot" />
            PARKSMART / PARKING EXPLORER
          </div>

          <h1>
            Find your <span>perfect spot.</span>
          </h1>

          <p>
            Choose an available slot and reserve it for one of your
            registered vehicles.
          </p>
        </div>

        <div className="fp-hero-badge">
          <ParkingCircle size={22} />
          <div>
            <strong>Smart Parking</strong>
            <small>Live slot directory</small>
          </div>
        </div>
      </header>

      <section className="fp-stats" aria-label="Parking summary">
        <article className="fp-stat fp-stat-available">
          <div className="fp-stat-icon">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <span>Available slots</span>
            <strong>{loading ? "—" : availableCount}</strong>
          </div>
        </article>

        <article className="fp-stat fp-stat-occupied">
          <div className="fp-stat-icon">
            <CarFront size={21} />
          </div>
          <div>
            <span>Occupied slots</span>
            <strong>{loading ? "—" : occupiedCount}</strong>
          </div>
        </article>

        <article className="fp-stat">
          <div className="fp-stat-icon">
            <CarFront size={21} />
          </div>
          <div>
            <span>Your vehicles</span>
            <strong>{vehicles.length}</strong>
          </div>
        </article>

        <button
          className="fp-refresh"
          type="button"
          onClick={fetchParkingSlots}
          disabled={loading || bookingLoading}
        >
          <RefreshCw
            size={17}
            className={loading ? "fp-spin" : ""}
          />
          Refresh
        </button>
      </section>

      {error && (
        <div className="fp-message fp-error" role="alert">
          <AlertCircle size={19} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="fp-message fp-success" role="status">
          <CheckCircle2 size={19} />
          <span>{success}</span>
        </div>
      )}

      <section className="fp-toolbar" aria-label="Search and filter slots">
        <label className="fp-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by slot number…"
            aria-label="Search by slot number"
          />
        </label>

        <label className="fp-filter">
          <SlidersHorizontal size={17} />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter slots"
          >
            <option value="All">All slots</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
          </select>
        </label>

        <div className="fp-legend" aria-label="Slot status legend">
          <span>
            <i className="fp-dot fp-dot-free" />
            Available
          </span>
          <span>
            <i className="fp-dot fp-dot-busy" />
            Occupied
          </span>
          <span>
            <i className="fp-dot fp-dot-selected" />
            Selected
          </span>
        </div>
      </section>

      <section className="fp-main-grid">
        <div className="fp-card fp-map-card">
          <div className="fp-card-heading">
            <div>
              <span className="fp-overline">SLOT DIRECTORY</span>
              <h2>Choose a parking slot</h2>
              <p>Choose an available slot to open its booking form.</p>
            </div>

            <span className="fp-live-pill">
              <i />
              LIVE DATABASE
            </span>
          </div>

          {loading ? (
            <div className="fp-loading">
              <RefreshCw size={25} className="fp-spin" />
              <p>Loading slots from ParkSmart…</p>
            </div>
          ) : (
            <div className="fp-slot-scroll">
              <div className="fp-slot-grid">
                {filteredSlots.map((slot) => {
                  const available = slot.status === "Available";
                  const isSelected = String(selected) === String(slot.id);

                  return (
                    <button
                      key={slot.slotId ?? slot.id}
                      type="button"
                      className={[
                        "fp-slot",
                        available ? "is-free" : "is-busy",
                        isSelected ? "is-selected" : "",
                      ].join(" ")}
                      onClick={() => {
                        if (!available) return;

                        setSelected(slot.id);
                        setError("");
                        setSuccess("");
                      }}
                      disabled={!available || bookingLoading}
                      aria-pressed={isSelected}
                      title={`Slot ${slot.id}: ${slot.status}`}
                    >
                      <SlotTypeIcon type={slot.type} />
                      <strong>{slot.id}</strong>
                      <span>
                        {available
                          ? `₹${slot.rate.toFixed(0)}/hr`
                          : "Occupied"}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!filteredSlots.length && (
                <div className="fp-empty">
                  <MapPin size={26} />
                  <strong>No slots found</strong>
                  <span>Try a different search or filter.</span>
                </div>
              )}
            </div>
          )}

          <div className="fp-entrance">
            <span />
            <b>PARKING ENTRANCE / EXIT</b>
            <span />
          </div>

          <div className="fp-map-foot">
            {filteredSlots.length} slots shown
            <span>•</span>
            {availableCount} available now
          </div>
        </div>

        <aside className="fp-card fp-booking-card">
          <div className="fp-card-heading">
            <div>
              <span className="fp-overline">RESERVATION</span>
              <h2>Booking details</h2>
              <p>One vehicle = one active slot.</p>
            </div>
            <div className="fp-booking-mark">
              <CalendarDays size={20} />
            </div>
          </div>

          {selectedSlot && selectedSlot.status === "Available" ? (
            <>
              <div className="fp-selected-summary">
                <div className="fp-selected-icon">
                  <ParkingCircle size={24} />
                </div>
                <div>
                  <span>Selected slot</span>
                  <strong>{selectedSlot.id}</strong>
                </div>
                <span className="fp-status-pill">Available</span>
              </div>

              <div className="fp-rate-row">
                <span>Hourly rate</span>
                <strong>
                  ₹{selectedSlot.rate.toFixed(2)} <small>/ hour</small>
                </strong>
              </div>

              <label className="fp-field">
                <span>
                  <Phone size={15} />
                  Mobile number
                </span>
                <input
                  type="tel"
                  value={accountMobileNumber}
                  readOnly
                  aria-readonly="true"
                  placeholder="Registered mobile from your account"
                  maxLength={15}
                  autoComplete="tel"
                  required
                />
              </label>

              <label className="fp-field">
                <span>
                  <CarFront size={15} />
                  Registered vehicle
                </span>
                <select
                  value={vehicleNumber}
                  onChange={(event) => {
                    setVehicleNumber(event.target.value);
                    setError("");
                  }}
                  disabled={!vehicles.length}
                  required
                >
                  {vehiclesLoading ? (
                    <option value="">Loading your vehicles…</option>
                  ) : vehicles.length ? (
                    vehicles.map((vehicle) => {
                      const number = normalizeVehicleNumber(
                        vehicle.vehicleNumber ?? vehicle.vehicle_number
                      );
                      const type = getVehicleType(vehicle);
                      const occupied = displayedSlots.some(
                        (slot) =>
                          slot.status === "Occupied" &&
                          normalizeVehicleNumber(slot.vehicleNumber) === number
                      );

                      return (
                        <option
                          key={
                            vehicle.vehicleId ??
                            vehicle.vehicle_id ??
                            number
                          }
                          value={number}
                        >
                          {number}
                          {type ? ` · ${type}` : ""}
                          {occupied ? " · already parked" : ""}
                        </option>
                      );
                    })
                  ) : (
                    <option value="">No registered vehicles</option>
                  )}
                </select>

                {selectedVehicleAlreadyParked && (
                  <small className="fp-field-warning">
                    {cleanVehicleNumber} is already assigned to slot{" "}
                    {slotForSelectedVehicle.id}.
                  </small>
                )}
              </label>

              <div className="fp-field">
                <span><Clock3 size={15} /> Billing option</span>
                <div className="fp-booking-mode-options">
                  <label className={`fp-mode-option ${bookingMode === "FIXED" ? "is-active" : ""}`}>
                    <input
                      type="radio"
                      name="bookingMode"
                      value="FIXED"
                      checked={bookingMode === "FIXED"}
                      onChange={() => {
                        setBookingMode("FIXED");
                        setError("");
                      }}
                    />
                    <span><strong>Fixed duration</strong><small>Choose hours and estimate total</small></span>
                  </label>
                  <label className={`fp-mode-option ${bookingMode === "CUSTOM" ? "is-active" : ""}`}>
                    <input
                      type="radio"
                      name="bookingMode"
                      value="CUSTOM"
                      checked={bookingMode === "CUSTOM"}
                      onChange={() => {
                        setBookingMode("CUSTOM");
                        setError("");
                      }}
                    />
                    <span><strong>Custom · pay on exit</strong><small>Final amount after vehicle removal</small></span>
                  </label>
                </div>
              </div>

              {bookingMode === "FIXED" && (
                <label className="fp-field">
                  <span><Clock3 size={15} /> Parking duration</span>
                  <select
                    value={durationHours}
                    onChange={(event) => setDurationHours(Number(event.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 12, 24].map((hours) => (
                      <option key={hours} value={hours}>
                        {hours} {hours === 1 ? "hour" : "hours"}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <div className="fp-total">
                <div>
                  <span>{bookingMode === "CUSTOM" ? "Final amount on exit" : "Estimated total"}</span>
                  <small>
                    {bookingMode === "CUSTOM"
                      ? `Billing is based on actual parking time for ${cleanVehicleNumber || "your vehicle"}.`
                      : `${durationHours} ${durationHours === 1 ? "hour" : "hours"} × ₹${selectedSlot.rate.toFixed(2)}`}
                  </small>
                </div>
                <strong>
                  <IndianRupee size={19} />
                  {bookingMode === "FIXED"
                    ? (selectedSlot.rate * Number(durationHours)).toFixed(2)
                    : "On exit"}
                </strong>
              </div>

              <button
                type="button"
                className="fp-confirm"
                onClick={handleBooking}
                disabled={
                  bookingLoading ||
                  vehiclesLoading ||
                  !vehicles.length ||
                  !vehicleIsRegistered ||
                  selectedVehicleAlreadyParked
                }
              >
                {bookingLoading ? (
                  <>
                    <RefreshCw size={17} className="fp-spin" />
                    Booking…
                  </>
                ) : (
                  <>
                    Confirm booking <span>→</span>
                  </>
                )}
              </button>

              <p className="fp-secure-note">
                Custom pay-on-exit billing requires the backend to save the entry timestamp and calculate the final amount when the vehicle is released.
              </p>
            </>
          ) : (
            <div className="fp-no-selection">
              <div className="fp-no-selection-icon">
                <ParkingCircle size={30} />
              </div>
              <h3>Select an available slot</h3>
              <p>
                Choose a blue-outlined available slot on the left. Then select
                the registered vehicle you want to park.
              </p>
              <div className="fp-rule-note">
                <CheckCircle2 size={17} />
                <span>
                  Each vehicle can have one active slot. Different registered
                  vehicles can each reserve their own slot.
                </span>
              </div>
            </div>
          )}
        </aside>
      </section>

      <p className="fp-bottom-note">
        Slot status is loaded from your Spring Boot API. Enforce the same
        duplicate-vehicle and slot-availability checks in the backend to
        prevent simultaneous duplicate bookings.
      </p>
    </main>
  );
}
