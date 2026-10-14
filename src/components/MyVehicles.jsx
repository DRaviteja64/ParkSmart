import React, { useState, useEffect, useCallback } from "react";
import {
  CarFront,
  Bike,
  Zap,
  Plus,
  Trash2,
  X,
  Check,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8080";

const VEHICLES_API_URL = `${API_BASE_URL}/api/vehicles/by-mobile`;
const ADD_VEHICLE_API_URL = `${API_BASE_URL}/api/vehicles/add`;

export default function MyVehicles({
  vehicles = [],
  onAdd,
  onDelete,
}) {
  const [showForm, setShowForm] = useState(false);
  const [number, setNumber] = useState("");
  const [type, setType] = useState("Car");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const [myVehicles, setMyVehicles] = useState(vehicles);
  const [loading, setLoading] = useState(true);

  // Read the logged-in user's mobile number. It is sent to the backend
  // so the controller can associate the new vehicle with the correct user.
  // The mobile number is never rendered in the UI.
  const getMobileNumber = () => {
    const storageKeys = ["loggedInUser", "user"];

    for (const storage of [sessionStorage, localStorage]) {
      for (const key of storageKeys) {
        try {
          const storedUser = storage.getItem(key);
          if (!storedUser) continue;

          const parsed = JSON.parse(storedUser);
          const user = parsed?.user ?? parsed;
          const mobile = user?.mobile ?? user?.mobileNumber ?? user?.phone;
          if (mobile != null && String(mobile).trim()) {
            return String(mobile).trim();
          }
        } catch (err) {
          console.warn(`[ParkSmart] Could not read ${key} from storage.`, err);
        }
      }

      const directMobile = storage.getItem("mobileNumber");
      if (directMobile && directMobile.trim()) return directMobile.trim();
    }

    return "";
  };

  // Fetch vehicles from UserVehicles_Controller.
  const fetchMyVehicles = useCallback(async (signal) => {
    const mobileNumber = getMobileNumber();

    if (!mobileNumber) {
      setMyVehicles([]);

      setError(
        "Mobile number not found. Please sign in again."
      );

      setLoading(false);

      console.error(
        "[ParkSmart] LOGGED_IN_USER_MOBILE_MISSING"
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = new URL(VEHICLES_API_URL);

      // Matches @RequestParam String mobileNumber
      // in UserVehicles_Controller.
      url.searchParams.set("mobileNumber", mobileNumber);

      console.log(
        "[ParkSmart] FETCH_MY_VEHICLES_REQUEST",
        {
          endpoint: url.pathname,
          mobileNumber,
        }
      );

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal,
      });

      const responseText = await response.text();

      let responseData = [];

      if (responseText) {
        try {
          responseData = JSON.parse(responseText);
        } catch {
          throw new Error(
            "The vehicle controller returned invalid JSON."
          );
        }
      }

      if (!response.ok) {
        const message =
          responseData?.message ??
          `Failed to fetch vehicles. HTTP ${response.status}`;

        throw new Error(message);
      }

      // The controller returns List<UserVehicles_Entity>.
      // Jackson serializes it as a JSON array.
      if (!Array.isArray(responseData)) {
        throw new Error(
          "Invalid response. Expected a JSON array of vehicles."
        );
      }

      // Map backend properties to the fields used by
      // your original MyVehicles.jsx UI.
      const formattedVehicles = responseData.map((vehicle) => ({
        id:
          vehicle.id ??
          vehicle.vehicleId ??
          vehicle.vehicle_id,

        number: String(
          vehicle.vehicle_number ??
          vehicle.vehicleNumber ??
          vehicle.number ??
          ""
        )
          .trim()
          .toUpperCase(),

        type: String(
          vehicle.vehicle_type ??
          vehicle.vehicleType ??
          vehicle.type ??
          "CAR"
        ).trim(),

        label:
          vehicle.label ??
          vehicle.nickname ??
          vehicle.vehicle_type ??
          vehicle.vehicleType ??
          vehicle.type ??
          "Car",

        color: vehicle.color ?? "#DCEBFF",
      }));

      setMyVehicles(formattedVehicles);

      console.log(
        "[ParkSmart] FETCH_MY_VEHICLES_SUCCESS",
        {
          totalVehicles: formattedVehicles.length,
          vehicles: formattedVehicles,
        }
      );
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }

      console.error(
        "[ParkSmart] FETCH_MY_VEHICLES_FAILED:",
        err
      );

      setError(
        err.message ||
          "Unable to retrieve your registered vehicles."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Automatically fetch vehicles whenever this component opens.
  useEffect(() => {
    const controller = new AbortController();

    fetchMyVehicles(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchMyVehicles]);

  // Handle adding a new vehicle.
  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanNumber = number.trim().toUpperCase();

    setError("");

    if (!cleanNumber) {
      setError("Enter a vehicle registration number.");
      return;
    }

    // Check for duplicate vehicle registration numbers.
    const isDuplicate = myVehicles.some(
      (vehicle) =>
        vehicle.number?.trim().toUpperCase() === cleanNumber
    );

    if (isDuplicate) {
      setError("That vehicle is already in your garage.");
      return;
    }

    const mobileNumber = getMobileNumber();

    if (!mobileNumber) {
      setError("Mobile number not found. Please sign in again.");
      return;
    }

    try {
      console.log("[ParkSmart] ADD_VEHICLE_REQUEST", {
        vehicleNumber: cleanNumber,
        vehicleType: type,
        userMobilePresent: Boolean(mobileNumber),
      });

      const response = await fetch(ADD_VEHICLE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          mobileNumber: mobileNumber,
          vehicleNumber: cleanNumber,
          vehicleType: type.toUpperCase(),
        }),
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
          responseData.message ||
          `Unable to add vehicle. HTTP ${response.status}`
        );
      }

      console.log("[ParkSmart] ADD_VEHICLE_SUCCESS", {
        message: responseData.message,
        userId: responseData.userId,
        vehicleId: responseData.vehicleId,
        vehicleNumber: responseData.vehicleNumber,
        vehicleType: responseData.vehicleType,
        mobileMatched: Boolean(responseData.mobileNumber),
      });

      // Reset the form and load the saved database record.
      setNumber("");
      setLabel("");
      setType("Car");
      setError("");
      setShowForm(false);
      await fetchMyVehicles();
    } catch (err) {
      console.error("[ParkSmart] ADD_VEHICLE_FAILED:", err);
      setError(err.message || "Unable to add the vehicle.");
    }
  };

  // Toggle the vehicle form.
  const toggleForm = () => {
    setShowForm((current) => !current);
    setError("");
  };

  // Handle vehicle deletion.
  const handleDelete = async (vehicleId) => {
    if (typeof onDelete !== "function") {
      setError(
        "Unable to remove the vehicle. Please try again."
      );

      return;
    }

    try {
      const result = onDelete(vehicleId);

      if (result && typeof result.then === "function") {
        await result;
      }

      // Reload vehicles after deletion.
      await fetchMyVehicles();
    } catch (err) {
      console.error(
        "[ParkSmart] DELETE_VEHICLE_FAILED:",
        err
      );

      setError(
        err.message || "Unable to remove the vehicle."
      );
    }
  };

  return (
    <div className="page-stack">
      {/* Page heading */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">YOUR GARAGE</p>

          <h2>My Vehicles</h2>

          <p>
            Keep your vehicles ready for your next booking.
          </p>
        </div>

        <button
          className="button button-primary"
          type="button"
          onClick={toggleForm}
        >
          {showForm ? <X size={17} /> : <Plus size={17} />}

          {showForm ? "Cancel" : "Add Vehicle"}
        </button>
      </div>

      {/* Add vehicle form */}
      {showForm && (
        <form
          className="content-card vehicle-form"
          onSubmit={handleSubmit}
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">NEW VEHICLE</p>
              <h3>Add to Your Garage</h3>
            </div>
          </div>

          <div className="form-grid">
            {/* Registration number */}
            <label className="form-label">
              Registration Number

              <input
                type="text"
                value={number}
                onChange={(event) => {
                  setNumber(event.target.value);
                  setError("");
                }}
                placeholder="e.g. AP 05 AB 1234"
                maxLength={20}
                autoComplete="off"
                required
              />
            </label>

            {/* Vehicle type */}
            <label className="form-label">
              Vehicle Type

              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="EV">EV</option>
              </select>
            </label>

            {/* Vehicle nickname */}
            <label className="form-label">
              Nickname (Optional)

              <input
                type="text"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="e.g. Daily ride"
                maxLength={40}
              />
            </label>
          </div>

          {/* Validation error */}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="button button-primary"
            type="submit"
          >
            <Check size={17} />
            Save Vehicle
          </button>
        </form>
      )}

      {/* Vehicle summary */}
      <div className="vehicle-summary-strip">
        <span>
          <CarFront size={19} />

          <strong>{myVehicles.length}</strong>

          registered{" "}
          {myVehicles.length === 1 ? "vehicle" : "vehicles"}
        </span>

        <span>
          Manage the vehicles in your garage.
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="content-card">
          Loading your registered vehicles...
        </div>
      )}

      {/* API error */}
      {error && !showForm && (
        <div className="content-card form-error" role="alert">
          {error}
        </div>
      )}

      {/* Vehicle cards */}
      {!loading && (
        <div className="vehicle-grid">
          {myVehicles.map((vehicle, index) => {
            const vehicleType = vehicle.type || "CAR";

            const normalizedType = vehicleType
              .toUpperCase()
              .replace(/[\s_-]/g, "");

            const isBike =
              normalizedType.includes("BIKE") ||
              normalizedType.includes("TWO");

            const isEV =
              normalizedType === "EV" ||
              normalizedType.includes("ELECTRIC");

            return (
              <article
                className="content-card vehicle-card"
                key={vehicle.id ?? vehicle.number ?? index}
              >
                <div className="vehicle-card-top">
                  <div
                    className="vehicle-illustration"
                    style={{
                      background: vehicle.color || "#DCEBFF",
                    }}
                  >
                    {isBike ? (
                      <Bike size={34} />
                    ) : isEV ? (
                      <Zap size={34} />
                    ) : (
                      <CarFront size={36} />
                    )}
                  </div>

                  <span className="status-pill pill-available">
                    Registered
                  </span>
                </div>

                <p className="eyebrow">
                  {vehicle.label || vehicleType}
                </p>

                <h3>
                  {vehicle.number || "No registration number"}
                </h3>

                <p className="vehicle-type">
                  {vehicleType} · Personal vehicle
                </p>

                <div className="vehicle-card-footer">
                  <span>Ready for booking</span>

                  <button
                    className="danger-icon-button"
                    type="button"
                    onClick={() => handleDelete(vehicle.id)}
                    aria-label={`Remove ${
                      vehicle.number || "vehicle"
                    }`}
                    title="Remove vehicle"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Empty garage state */}
      {!loading &&
        myVehicles.length === 0 &&
        !error && (
          <div className="content-card empty-state">
            <div className="empty-icon">
              <CarFront size={26} />
            </div>

            <h4>Your Garage Is Empty</h4>

            <p>
              Add a vehicle before making a parking reservation.
            </p>

            <button
              className="button button-primary"
              type="button"
              onClick={() => {
                setShowForm(true);
                setError("");
              }}
            >
              <Plus size={17} />
              Add Your First Vehicle
            </button>
          </div>
        )}
    </div>
  );
}