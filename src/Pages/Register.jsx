import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Register.css";


function Register() {
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme !== null ? savedTheme === "dark" : true;
    });

    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transitionData, setTransitionData] = useState({
        fullName: "",
        email: "",
        mobile: "",
        vehicleNumber: "",
        vehicleType: "",
        Password: "",
        ConfirmPassword: "",
    });

    const timeoutRef = useRef(null);



useEffect(() => {
    return () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };
}, []);


    const toggleDarkMode = () => {
        setDarkMode((prev) => {
            const next = !prev;
            localStorage.setItem("theme", next ? "dark" : "light");
            return next;
        });
    };

    const fnChange = (e) => {
        let { name, value } = e.target;
        setServerError("");

        if (name === "vehicleNumber") {
            value = value.toUpperCase();
        }

        if (name === "mobile") {
            value = value.replace(/\D/g, "").slice(0, 10);
        }

        setTransitionData((prevData) => {
            const updated = {
                ...prevData,
                [name]: value
            };

            // Remove this field's error when edited
            setErrors((prevErrors) => {
                const nextErrors = { ...prevErrors };
                delete nextErrors[name];

                // If updating either password field, re-check or clear mismatch error
                if (name === "Password" || name === "ConfirmPassword") {
                    const pass = name === "Password" ? value : updated.Password;
                    const confirm = name === "ConfirmPassword" ? value : updated.ConfirmPassword;
                    if (confirm && pass === confirm) {
                        delete nextErrors.ConfirmPassword;
                    }
                }

                return nextErrors;
            });

            return updated;
        });
    };


    const validateForm = () => {

        const newErrors = {};

        const name = transitionData.fullName.trim();
        const email = transitionData.email.trim();
        const mobile = transitionData.mobile.trim();
        const cleanVehicleNumber = transitionData.vehicleNumber.replace(/[\s-]/g, "").toUpperCase();
        const password = transitionData.Password;
        const confirmPassword = transitionData.ConfirmPassword;
        const vehicleType = transitionData.vehicleType;

        // Name
        if (!name) {
            newErrors.fullName = "Full name is required";
        } else if (!/^[A-Za-z\s.'-]{2,50}$/.test(name)) {
            newErrors.fullName = "Name must contain 2-50 valid name characters";
        }

        // Email
        if (!email) {
            newErrors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            newErrors.email = "Enter a valid email address";
        }

        // Mobile
        if (!mobile) {
            newErrors.mobile = "Mobile number is required";
        } else if (!/^[6-9][0-9]{9}$/.test(mobile)) {
            newErrors.mobile = "Enter a valid 10-digit mobile number";
        }

        // Vehicle Number
        if (!cleanVehicleNumber) {
            newErrors.vehicleNumber = "Vehicle number is required";
        } else if (
            !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(cleanVehicleNumber)
        ) {
            newErrors.vehicleNumber = "Enter a valid vehicle number (e.g. AP39AB1234)";
        }

        // Password
        if (!password) {
            newErrors.Password = "Password is required";
        } else if (password.length < 8) {
            newErrors.Password = "Password must contain at least 8 characters";
        } else if (!/[A-Z]/.test(password)) {
            newErrors.Password = "Password must contain at least one uppercase letter";
        } else if (!/[a-z]/.test(password)) {
            newErrors.Password = "Password must contain at least one lowercase letter";
        } else if (!/[0-9]/.test(password)) {
            newErrors.Password = "Password must contain at least one number";
        } else if (!/[^A-Za-z0-9]/.test(password)) {
            newErrors.Password = "Password must contain at least one special character";
        }

        // Confirm Password
        if (!confirmPassword) {
            newErrors.ConfirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.ConfirmPassword = "Passwords do not match";
        }

        // Vehicle Type
        if (!vehicleType) {
            newErrors.vehicleType = "Please select a vehicle type";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

const DataFunction = async (e) => {
    e.preventDefault();

    if (isSubmitting || isTransitioning) return;
    setServerError("");

    // Validate all fields before sending anything to Spring Boot.
    if (!validateForm()) return;

    const userData = {
        fullName: transitionData.fullName.trim(),
        email: transitionData.email.trim(),
        mobile: transitionData.mobile.trim(),
        vehicleNumber: transitionData.vehicleNumber.replace(/[\s-]/g, "").toUpperCase(),
        vehicleType: transitionData.vehicleType,
        // React state is Password, but the JSON property must match Java's password field.
        password: transitionData.Password
    };

    setIsSubmitting(true);

    try {
        const response = await fetch("http://localhost:8080/RegisterFormData", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/plain, */*"
            },
            body: JSON.stringify(userData)
        });

       
        const responseText = await response.text();
        let responseData = null;
        let responseMessage = responseText.trim();

        try {
            responseData = responseText ? JSON.parse(responseText) : null;
        } catch {
          
        }

        if (responseData && typeof responseData === "object") {
            responseMessage =
                responseData.message ||
                responseData.detail ||
                responseData.error_description ||
                responseData.error ||
                responseData.title ||
                responseMessage;
        }

        if (!response.ok) {
            const usefulMessage = responseMessage || response.statusText || "No error details were returned by the server.";
            const diagnosticHint = response.status >= 500
                ? " Check the Spring Boot console for the full exception; HTTP 500 means the backend failed while processing the request."
                : "";
            const message = `Registration failed (HTTP ${response.status}): ${usefulMessage}.${diagnosticHint}`;

            // console.error("Registration request failed:", {
            //     endpoint: "http://localhost:8080/RegisterFormData",
            //     status: response.status,
            //     statusText: response.statusText,
            //     responseBody: responseText,
            //     submittedFields: Object.keys(userData)
            // });

            setServerError(message);
            return;
        }

        console.log("Registration successful:", responseMessage || responseText);
        localStorage.setItem("theme", darkMode ? "dark" : "light");

        // Start the truck animation only after Spring Boot confirms success.
        setIsTransitioning(true);
        timeoutRef.current = setTimeout(() => {
            navigate("/");
        }, 3000);
    } catch (error) {
        console.error("Registration request error:", error);
        setServerError(
            "Could not connect to Spring Boot at http://localhost:8080/RegisterFormData. " +
            "Check that the backend is running, the endpoint is correct, and CORS allows http://localhost:5173. " +
            `Technical detail: ${error instanceof Error ? error.message : String(error)}`
        );
    } finally {
        setIsSubmitting(false);
    }
};

    // const handleLoginClick = (e) => {
    //     e.preventDefault();
    //     navigate("/");
    // };
    

    return (

        <div
            className={`${darkMode ? "parking-page dark" : "parking-page light"} ${
                isTransitioning ? "register-transition-active" : ""
            }`}
        >

            {/* =====================================================
                REGISTER → LOGIN TRUCK TRANSITION
            ===================================================== */}

            {isTransitioning && (
                <div className="register-truck-transition" aria-hidden="true">

                    {/* Data packets visually travel from the register form into the truck. */}
                    <div className="register-data-packets">
                        <div className="data-packet packet-name">
                            <i className="bi bi-person-fill"></i>
                            <span>{transitionData.fullName}</span>
                        </div>
                        <div className="data-packet packet-email">
                            <i className="bi bi-envelope-fill"></i>
                            <span>{transitionData.email}</span>
                        </div>
                        <div className="data-packet packet-mobile">
                            <i className="bi bi-phone-fill"></i>
                            <span>{transitionData.mobile}</span>
                        </div>
                        <div className="data-packet packet-vehicle">
                            <i className="bi bi-car-front-fill"></i>
                            <span>{transitionData.vehicleNumber}</span>
                        </div>
                        <div className="data-packet packet-type">
                            <i className="bi bi-tag-fill"></i>
                            <span>{transitionData.vehicleType}</span>
                        </div>
                    </div>

                    <div className="transition-truck">

                        {/* Cargo body */}
                        <div className="truck-cargo">
                            <div className="truck-cargo-inside">
                                <div className="cargo-data-icon">
                                    <i className="bi bi-database-fill-check"></i>
                                </div>
                                <span>DATA SECURED</span>
                            </div>

                            <div className="truck-parking-sign">
                                <i className="bi bi-p-square-fill"></i>
                                <span>PARKING</span>
                            </div>

                            {/* Rear cargo door. It visibly closes after the data enters. */}
                            <div className="truck-rear-door">
                                <div className="rear-door-handle"></div>
                                <div className="rear-door-lock">
                                    <i className="bi bi-lock-fill"></i>
                                </div>
                            </div>
                        </div>

                        {/* Cabin */}
                        <div className="truck-cabin">
                            <div className="truck-window"></div>
                            <div className="truck-door-line"></div>
                            <div className="truck-headlight"></div>
                        </div>

                        <div className="truck-wheel truck-wheel-one"></div>
                        <div className="truck-wheel truck-wheel-two"></div>
                    </div>

                    <div className="truck-road-glow"></div>
                    <div className="truck-status">
                        <i className="bi bi-shield-check"></i>
                        <span>SECURING ACCOUNT...</span>
                    </div>

                    <div className="truck-smoke" aria-hidden="true">
                        <span className="smoke-puff smoke-1"></span>
                        <span className="smoke-puff smoke-2"></span>
                        <span className="smoke-puff smoke-3"></span>
                        <span className="smoke-puff smoke-4"></span>
                        <span className="smoke-puff smoke-5"></span>
                    </div>

                    <div className="login-white-wipe" aria-hidden="true"></div>
                </div>
            )}


            {/* =====================================================
                PARKING BACKGROUND
            ===================================================== */}

            <div className="parking-background">


                {/* Parking floor */}
                <div className="parking-floor"></div>


                {/* ================= PARKING SLOTS ================= */}

                <div className="parking-slot slot-1">

                    <span>01</span>

                    <div className="parked-car blue-car">
                        🚗
                    </div>

                </div>


                <div className="parking-slot slot-2">

                    <span>02</span>

                    <div className="parked-car white-car">
                        🚙
                    </div>

                </div>


                <div className="parking-slot slot-3">

                    <span>03</span>

                    <div className="parked-car green-car">
                        🚗
                    </div>

                </div>


                <div className="parking-slot slot-4">

                    <span>04</span>

                    <div className="parked-car red-car">
                        🚕
                    </div>

                </div>


                <div className="parking-slot slot-5">

                    <span>05</span>

                    <div className="parked-car purple-car">
                        🚙
                    </div>

                </div>


                {/* ================= MOVING VEHICLES ================= */}

                <div className="moving-car moving-car-1">
                    🚗
                </div>

                <div className="moving-car moving-car-2">
                    🚙
                </div>

                <div className="moving-car moving-car-3">
                    🏎️
                </div>

                <div className="moving-car moving-car-4">
                    🚕
                </div>
                 <div className="moving-car moving-car-5">
                    🚗
                </div>

                <div className="moving-car moving-car-6">
                    🚙
                </div>

                <div className="moving-car moving-car-7">
                    🏎️
                </div>

                <div className="moving-car moving-car-8">
                    🚕
                </div>


                {/* ================= FLOATING VEHICLES ================= */}

                <div className="floating-car floating-1">
                    🚗
                </div>

                <div className="floating-car floating-2">
                    🚙
                </div>

                <div className="floating-car floating-3">
                    🚕
                </div>


                {/* Background lights */}

                <div className="background-light light-one"></div>

                <div className="background-light light-two"></div>

                <div className="background-light light-three"></div>


            </div>


            {/* =====================================================
                NAVBAR
            ===================================================== */}

            <nav className="parking-navbar">


                {/* ================= LOGO ================= */}

                <div className="parking-logo">


                    {/* Parking logo */}

                    <div className="parking-logo-slot">

                        <div className="logo-parking-line"></div>

                        <div className="logo-car">
                            🚗
                        </div>

                    </div>


                    {/* Logo text */}

                    <div className="logo-text">

                        <h4>
                            Park<span>Smart</span>
                        </h4>

                        <small>
                            Smart Parking System
                        </small>

                    </div>


                </div>


                {/* ================= THEME BUTTON ================= */}

                <button
                    className="theme-button"
                    onClick={toggleDarkMode}
                    aria-label="Change theme"
                >

                    {darkMode ? (

                        <i className="bi bi-sun-fill"></i>

                    ) : (

                        <i className="bi bi-moon-fill"></i>

                    )}

                </button>


            </nav>


            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="register-container">


                {/* =================================================
                    REGISTER CARD
                ================================================= */}

                <div className="register-box">


                    {/* ================= HEADER ================= */}

                    <div className="register-header">


                        <div className="register-icon">

                            <i className="bi bi-person-plus-fill"></i>

                        </div>


                        <div>

                            <h2>
                                Create Account
                            </h2>

                            <p>
                                Register your vehicle and start parking smarter.
                            </p>

                        </div>


                    </div>



                    {/* =================================================
                        FORM
                    ================================================= */}

        <form onSubmit={DataFunction} noValidate>
            {serverError && (
                <div className="register-error-message" role="alert">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <div>
                        <strong>Registration failed</strong>
                        <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{serverError}</p>
                    </div>
                </div>
            )}

            {/* ================= NAME ================= */}

            <div className="input-container">

                <label htmlFor="fullName">
                    Full Name
                </label>

                <div className={`modern-input ${errors.fullName ? "input-error" : ""}`}>

                    <i className="bi bi-person"></i>

                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={transitionData.fullName}
                        onChange={fnChange}
                        autoComplete="name"
                    />

                </div>

                {errors.fullName && (
                    <div className="field-error-text">
                        <i className="bi bi-exclamation-circle-fill"></i>
                        <span>{errors.fullName}</span>
                    </div>
                )}

            </div>


            {/* ================= EMAIL ================= */}

            <div className="input-container">

                <label htmlFor="email">
                    Email Address
                </label>

                <div className={`modern-input ${errors.email ? "input-error" : ""}`}>

                    <i className="bi bi-envelope"></i>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={transitionData.email}
                        onChange={fnChange}
                        autoComplete="email"
                    />

                </div>

                {errors.email && (
                    <div className="field-error-text">
                        <i className="bi bi-exclamation-circle-fill"></i>
                        <span>{errors.email}</span>
                    </div>
                )}

            </div>


            {/* ================= MOBILE ================= */}

            <div className="input-container">

                <label htmlFor="mobile">
                    Mobile Number
                </label>

                <div className={`modern-input ${errors.mobile ? "input-error" : ""}`}>

                    <i className="bi bi-phone"></i>

                    <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        placeholder="Enter 10 digit mobile number"
                        maxLength="10"
                        value={transitionData.mobile}
                        onChange={fnChange}
                        autoComplete="tel"
                    />

                </div>

                {errors.mobile && (
                    <div className="field-error-text">
                        <i className="bi bi-exclamation-circle-fill"></i>
                        <span>{errors.mobile}</span>
                    </div>
                )}

            </div>


            {/* =================================================
                VEHICLE DETAILS
            ================================================= */}

            <div className="vehicle-section">

                <div className="section-title">

                    <i className="bi bi-car-front-fill"></i>

                    <span>
                        Vehicle Details
                    </span>

                </div>


                {/* ================= VEHICLE NUMBER ================= */}

                <div className="input-container">

                    <label htmlFor="vehicleNumber">
                        Vehicle Number
                    </label>

                    <div className={`modern-input ${errors.vehicleNumber ? "input-error" : ""}`}>

                        <i className="bi bi-credit-card"></i>

                        <input
                            id="vehicleNumber"
                            name="vehicleNumber"
                            type="text"
                            placeholder="AP39AB1234"
                            className="text-uppercase"
                            value={transitionData.vehicleNumber}
                            onChange={fnChange}
                            autoComplete="off"
                        />

                    </div>

                    {errors.vehicleNumber && (
                        <div className="field-error-text">
                            <i className="bi bi-exclamation-circle-fill"></i>
                            <span>{errors.vehicleNumber}</span>
                        </div>
                    )}

                </div>

                {/* ================= PASSWORD ================= */}

                <div className="input-container">

                    <label htmlFor="Password">
                        Password
                    </label>

                    <div className={`modern-input ${errors.Password ? "input-error" : ""}`}>

                        <i className="bi bi-lock"></i>

                        <input
                            id="Password"
                            name="Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={transitionData.Password}
                            onChange={fnChange}
                            autoComplete="new-password"
                        />

                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                        </button>

                    </div>

                    {errors.Password && (
                        <div className="field-error-text">
                            <i className="bi bi-exclamation-circle-fill"></i>
                            <span>{errors.Password}</span>
                        </div>
                    )}

                </div>

                
                {/* ================= CONFIRM PASSWORD ================= */}

                <div className="input-container">

                    <label htmlFor="ConfirmPassword">
                        Confirm Password
                    </label>

                    <div className={`modern-input ${errors.ConfirmPassword ? "input-error" : ""}`}>

                        <i className="bi bi-lock-fill"></i>

                        <input
                            id="ConfirmPassword"
                            name="ConfirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={transitionData.ConfirmPassword}
                            onChange={fnChange}
                            autoComplete="new-password"
                        />

                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            <i className={`bi ${showConfirmPassword ? "bi-eye-slash-fill" : "bi-eye-fill"}`}></i>
                        </button>

                    </div>

                    {errors.ConfirmPassword && (
                        <div className="field-error-text">
                            <i className="bi bi-exclamation-circle-fill"></i>
                            <span>{errors.ConfirmPassword}</span>
                        </div>
                    )}

                </div>
            

                {/* ================= VEHICLE TYPE ================= */}

                <div className="input-container">

                    <label htmlFor="vehicleType">
                        Vehicle Type
                    </label>

                    <div className={`modern-input ${errors.vehicleType ? "input-error" : ""}`}>

                        <i className="bi bi-car-front"></i>

                        <select
                            id="vehicleType"
                            name="vehicleType"
                            value={transitionData.vehicleType}
                            onChange={fnChange}
                        >

                            <option value="" disabled>
                                Select vehicle type
                            </option>

                            <option value="CAR">
                                Car
                            </option>

                            <option value="EV_CAR">
                                EV Car
                            </option>

                            <option value="BIKE">
                                Bike
                            </option>

                            <option value="EV_BIKE">
                                EV Bike
                            </option>

                        </select>

                    </div>

                    {errors.vehicleType && (
                        <div className="field-error-text">
                            <i className="bi bi-exclamation-circle-fill"></i>
                            <span>{errors.vehicleType}</span>
                        </div>
                    )}

                </div>

            </div>

            {/* =================================================
                REGISTER BUTTON
            ================================================= */}

            <button
                type="submit"
                className="register-button"
                disabled={isTransitioning || isSubmitting}
            >

                <span>
                    {isTransitioning ? "Processing..." : isSubmitting ? "Registering..." : "Create Account"}
                </span>

                <i className={`bi ${
                    isTransitioning ? "bi-truck" : isSubmitting ? "bi-hourglass-split" : "bi-arrow-right"
                }`}></i>

            </button>

            {/* ================= VALIDATION SUMMARY ================= */}
            {Object.keys(errors).length > 0 && (
                <div className="register-error-message" role="alert">
                    <i className="bi bi-exclamation-triangle-fill"></i>

                    <div>
                        <strong>Please fix the following errors:</strong>
                        <ul>
                            {Object.values(errors).map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

        </form>



        {/* =================================================
            LOGIN
        ================================================= */}

        <div className="login-text">

            <span>
                Already have an account?
            </span>

            <button
                type="button"
                className="login-link-btn"
                onClick={()=>navigate("/")}
            >
                Login
            </button>

        </div>


                </div>


            </main>


        </div>

    );

}


export default Register;