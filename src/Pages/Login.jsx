
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Register.css";

function Login() {
    const navigate = useNavigate();

    // ==========================================
    // 1. THEME MANAGEMENT
    // ==========================================

    const [darkMode, setDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("theme");
        return savedTheme !== null
            ? savedTheme === "dark"
            : true;
    });

    const toggleDarkMode = () => {
        setDarkMode((previous) => {
            const next = !previous;

            localStorage.setItem(
                "theme",
                next ? "dark" : "light"
            );

            return next;
        });
    };

    // ==========================================
    // 2. LOGIN FORM STATE
    // ==========================================

    const [loginIdentifier, setLoginIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // ==========================================
    // 3. LOGIN HANDLER
    // ==========================================

    const handleLogin = async (e) => {
        e.preventDefault();

        // Prevent multiple submissions
        if (isLoading) {
            return;
        }

        const newErrors = {};
        const mobile = loginIdentifier.trim();

        // Validate mobile number
        if (!mobile) {
            newErrors.loginIdentifier =
                "Please enter your mobile number";
        } else if (!/^[0-9]{10}$/.test(mobile)) {
            newErrors.loginIdentifier =
                "Enter a valid 10-digit mobile number";
        }

        // Validate password
        if (!password) {
            newErrors.password =
                "Password is required";
        }

        // Stop if validation fails
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            // Send login credentials to Spring Boot
            const response = await fetch(
                "http://localhost:8080/LoginData",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },

                    body: JSON.stringify({
                        mobile: mobile,
                        password: password,
                    }),
                }
            );

            // Read the response safely
            const responseText = await response.text();

            let data = {};

            if (responseText) {
                try {
                    data = JSON.parse(responseText);
                } catch {
                    throw new Error(
                        "The server returned an invalid response."
                    );
                }
            }

            // Debugging information
            console.log(
                "Login HTTP Status:",
                response.status
            );

            console.log(
                "Login Response:",
                data
            );

            console.log(
                "Login Role:",
                data.role
            );

            // ==========================================
            // 4. HANDLE LOGIN RESPONSE
            // ==========================================

            if (
                response.ok &&
                data.message === "Login successful"
            ) {
                // Check the returned role
                if (data.role === "USER") {
                    // Store non-sensitive user details for
                    // navigation to the user dashboard.
                  const responseUser = data.user ?? data.data?.user ?? data;

        const user = {
            userId: responseUser.userId ?? responseUser.id ?? null,
            fullName: responseUser.fullName ?? "",
            email: responseUser.email ?? "",
            mobile: responseUser.mobile ?? "",
            vehicleNumber: responseUser.vehicleNumber ?? "",
            vehicleType: responseUser.vehicleType ?? "",
            role: responseUser.role ?? data.role ?? "",
            vehicles: Array.isArray(responseUser.vehicles)
                ? responseUser.vehicles
                : [],
        };

if (user.userId == null) {
    setErrors({
        auth: "User ID was not returned by the server.",
    });
    return;
}

if (user.role !== "USER") {
    setErrors({
        auth: "This account cannot access the user dashboard.",
    });
    return;
}

sessionStorage.setItem(
    "loggedInUser",
    JSON.stringify(user)
);

setErrors({});
setPassword("");

navigate("/user-dashboard", {
    replace: true,
    state: {
        user: user,
    },
});
                } else if (data.role === "ADMIN") {
                    // Admin dashboard is not configured yet.
                    setErrors({
                        auth:
                            "Administrator dashboard is not configured yet.",
                    });
                } else {
                    // Role missing or unexpected
                    setErrors({
                        auth:
                            "Login succeeded, but the account role was not returned correctly by the server.",
                    });
                }
            } else {
                // Invalid credentials or backend error
                setErrors({
                    auth:
                        data.message ||
                        `Login failed. Server returned HTTP ${response.status}.`,
                });
            }
        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            setErrors({
                auth:
                    error.message ===
                    "The server returned an invalid response."
                        ? error.message
                        : "Unable to connect to the server. Please check whether Spring Boot is running and try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // ==========================================
    // 5. LOGIN PAGE UI
    // ==========================================

    return (
        <div
            className={
                darkMode
                    ? "parking-page dark"
                    : "parking-page light"
            }
        >
            {/* Background */}
            <div
                className="parking-background"
                aria-hidden="true"
            >
                <div className="parking-floor"></div>

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

                <div className="moving-car moving-car-1">
                    🚗
                </div>

                <div className="moving-car moving-car-2">
                    🚙
                </div>

                <div className="moving-car moving-car-3">
                    🏎️
                </div>

                <div className="background-light light-one"></div>
                <div className="background-light light-two"></div>
            </div>

            {/* Navbar */}
            <nav className="parking-navbar">
                <div className="parking-logo">
                    <div className="parking-logo-slot">
                        <div className="logo-parking-line"></div>
                        <div className="logo-car">
                            🚗
                        </div>
                    </div>

                    <div className="logo-text">
                        <h4>
                            Park<span>Smart</span>
                        </h4>

                        <small>
                            Smart Parking System
                        </small>
                    </div>
                </div>

                {/* Theme Toggle */}
                <button
                    type="button"
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

            {/* Main Content */}
            <main className="register-container">
                <div className="register-box">

                    {/* Login Header */}
                    <div className="register-header">
                        <div className="register-icon">
                            <i className="bi bi-box-arrow-in-right"></i>
                        </div>

                        <div>
                            <h2>Welcome Back</h2>

                            <p>
                                Sign in to access your parked vehicle
                                and smart parking slot.
                            </p>
                        </div>
                    </div>

                    {/* Authentication Error */}
                    {errors.auth && (
                        <div
                            className="register-error-message"
                            role="alert"
                            style={{
                                marginBottom: "16px",
                            }}
                        >
                            <i className="bi bi-exclamation-triangle-fill"></i>

                            <div>
                                {errors.auth}
                            </div>
                        </div>
                    )}

                    {/* Login Form */}
                    <form
                        onSubmit={handleLogin}
                        noValidate
                    >
                        {/* Mobile Number */}
                        <div className="input-container">
                            <label htmlFor="loginIdentifier">
                                Mobile Number
                            </label>

                            <div
                                className={`modern-input ${
                                    errors.loginIdentifier
                                        ? "input-error"
                                        : ""
                                }`}
                            >
                                <i className="bi bi-phone"></i>

                                <input
                                    id="loginIdentifier"
                                    name="mobile"
                                    type="tel"
                                    placeholder="Enter your 10-digit mobile number"
                                    value={loginIdentifier}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value.replace(
                                                /[^0-9]/g,
                                                ""
                                            );

                                        setLoginIdentifier(
                                            value.slice(0, 10)
                                        );

                                        if (
                                            errors.loginIdentifier ||
                                            errors.auth
                                        ) {
                                            setErrors((previous) => ({
                                                ...previous,
                                                loginIdentifier: null,
                                                auth: null,
                                            }));
                                        }
                                    }}
                                    autoComplete="username"
                                    inputMode="numeric"
                                    maxLength={10}
                                    aria-invalid={
                                        Boolean(errors.loginIdentifier)
                                    }
                                    aria-describedby={
                                        errors.loginIdentifier
                                            ? "mobile-error"
                                            : undefined
                                    }
                                />
                            </div>

                            {errors.loginIdentifier && (
                                <div
                                    className="field-error-text"
                                    id="mobile-error"
                                    role="alert"
                                >
                                    <i className="bi bi-exclamation-circle-fill"></i>

                                    <span>
                                        {errors.loginIdentifier}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Password */}
                        <div className="input-container">
                            <label htmlFor="loginPassword">
                                Password
                            </label>

                            <div
                                className={`modern-input ${
                                    errors.password
                                        ? "input-error"
                                        : ""
                                }`}
                            >
                                <i className="bi bi-lock"></i>

                                <input
                                    id="loginPassword"
                                    name="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(
                                            e.target.value
                                        );

                                        if (
                                            errors.password ||
                                            errors.auth
                                        ) {
                                            setErrors((previous) => ({
                                                ...previous,
                                                password: null,
                                                auth: null,
                                            }));
                                        }
                                    }}
                                    autoComplete="current-password"
                                    aria-invalid={
                                        Boolean(errors.password)
                                    }
                                    aria-describedby={
                                        errors.password
                                            ? "password-error"
                                            : undefined
                                    }
                                />

                                {/* Show / Hide Password */}
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => {
                                        setShowPassword(
                                            (previous) => !previous
                                        );
                                    }}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <i
                                        className={`bi ${
                                            showPassword
                                                ? "bi-eye-slash-fill"
                                                : "bi-eye-fill"
                                        }`}
                                    ></i>
                                </button>
                            </div>

                            {errors.password && (
                                <div
                                    className="field-error-text"
                                    id="password-error"
                                    role="alert"
                                >
                                    <i className="bi bi-exclamation-circle-fill"></i>

                                    <span>
                                        {errors.password}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            className="register-button"
                            style={{
                                marginTop: "16px",
                            }}
                            disabled={isLoading}
                        >
                            <span>
                                {isLoading
                                    ? "Signing In..."
                                    : "Sign In"}
                            </span>

                            <i
                                className={`bi ${
                                    isLoading
                                        ? "bi-arrow-repeat"
                                        : "bi-arrow-right"
                                }`}
                            ></i>
                        </button>
                    </form>

                    {/* Register Navigation */}
                    <div className="login-text">
                        <span>
                            Don't have an account?
                        </span>

                        <button
                            type="button"
                            className="login-link-btn"
                            onClick={() => {
                                navigate("/register");
                            }}
                        >
                            Register
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Login;
