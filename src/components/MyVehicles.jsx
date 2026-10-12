import React, { useState } from "react";
import {
  CarFront,
  Bike,
  Plus,
  Trash2,
  X,
  Check,
} from "lucide-react";

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

  // Handle adding a new vehicle
  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanNumber = number.trim().toUpperCase();

    // Validate registration number
    if (!cleanNumber) {
      setError("Enter a vehicle registration number.");
      return;
    }

    // Check for duplicate vehicle registration numbers
    const isDuplicate = vehicles.some(
      (vehicle) =>
        vehicle.number?.trim().toUpperCase() === cleanNumber
    );

    if (isDuplicate) {
      setError("That vehicle is already in your garage.");
      return;
    }

    // Check whether the parent provides the add handler
    if (typeof onAdd !== "function") {
      setError("Unable to add the vehicle. Please try again.");
      return;
    }

    // Send vehicle details to the parent component
    onAdd({
      number: cleanNumber,
      type,
      label: label.trim() || type,
    });

    // Reset the form
    setNumber("");
    setLabel("");
    setType("Car");
    setError("");
    setShowForm(false);
  };

  // Toggle the vehicle form
  const toggleForm = () => {
    setShowForm((current) => !current);
    setError("");
  };

  // Handle vehicle deletion
  const handleDelete = (vehicleId) => {
    if (typeof onDelete === "function") {
      onDelete(vehicleId);
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

          <strong>{vehicles.length}</strong>

          registered{" "}
          {vehicles.length === 1 ? "vehicle" : "vehicles"}
        </span>

        <span>
          Manage the vehicles in your garage.
        </span>
      </div>

      {/* Vehicle cards */}
      <div className="vehicle-grid">
        {vehicles.map((vehicle, index) => {
          const vehicleType = vehicle.type || "Car";
          const isBike = vehicleType.toLowerCase() === "bike";

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

              <h3>{vehicle.number || "No registration number"}</h3>

              <p className="vehicle-type">
                {vehicleType} · Personal vehicle
              </p>

              <div className="vehicle-card-footer">
                <span>Ready for booking</span>

                <button
                  className="danger-icon-button"
                  type="button"
                  onClick={() => handleDelete(vehicle.id)}
                  aria-label={`Remove ${vehicle.number || "vehicle"}`}
                  title="Remove vehicle"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty garage state */}
      {vehicles.length === 0 && (
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