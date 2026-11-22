import { useEffect, useState } from "react";
import "./App.css";

const categories = ["All", "Events"];

const eventImages = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=85",
];

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ADMIN EVENT MANAGEMENT
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [adminEventId, setAdminEventId] = useState(null);
  const [adminEventName, setAdminEventName] = useState("");
  const [adminEventDescription, setAdminEventDescription] = useState("");
  const [adminEventVenue, setAdminEventVenue] = useState("");
  const [adminTotalTickets, setAdminTotalTickets] = useState("");
  const [adminTicketPrice, setAdminTicketPrice] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ticketCount, setTicketCount] = useState(1);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(null);
  // Keep payment confirmation independent from the event booking modal.
  const [bookingConfirmation, setBookingConfirmation] = useState(null);

  // LOGIN AND JWT STATE
  const [token, setToken] = useState(() => sessionStorage.getItem("token") || "");
  const [userRole, setUserRole] = useState(
  () => sessionStorage.getItem("userRole") || ""
);

  const [loggedInEmail, setLoggedInEmail] = useState(
    () => sessionStorage.getItem("userEmail") || ""
  );

  // LOGGED-IN USER ID
  const [userId, setUserId] = useState(
    () => sessionStorage.getItem("userId") || ""
  );

  // MY BOOKINGS STATE
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
const [cancellingReference, setCancellingReference] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loginView, setLoginView] = useState("login");

  // REGISTRATION STATE
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  // LOGIN STATE
  const [loginType, setLoginType] = useState("USER");
  const [loginMethod, setLoginMethod] = useState("password");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  // FETCH EVENTS
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        // Public endpoint: events must load whether the visitor is logged in or not.
        const response = await fetch("/api/events", {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid events response from backend");
        }

        const mappedEvents = data.map((item, index) => ({
          id: item.id ?? index,
          title: item.name ?? "Untitled Event",
          category: item.category ?? "Events",
          date: item.date ?? item.eventDate ?? "Date TBA",
          location: item.venue || "Venue not announced",
         price: item.ticketPrice ?? null,
          // tag: "DATABASE EVENT",
          // image: eventImages[index % eventImages.length],
          image:
  item.name?.trim().toLowerCase() === "jibhi tour"
    ? "/images/jibhi.png"
    : eventImages[index % eventImages.length],
        }));

        setEvents(mappedEvents);
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Backend not working.");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  // SEARCH AND CATEGORY FILTER
  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      activeCategory === "All" ||
      event.category === activeCategory;

    const matchesSearch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const venueCount = new Set(
    events
      .map((event) => event.location)
      .filter((venue) => venue !== "Venue not announced")
  ).size;

  // COMPLETE LOGIN AND STORE JWT + USER ID + ROLE
  const completeLogin = (result, userEmail, expectedLoginType) => {
    if (!result.token) {
      throw new Error("Login response does not contain a token.");
    }

    if (result.userId == null) {
      throw new Error("Login response does not contain userId.");
    }

    if (!result.role) {
      throw new Error("Login response does not contain user role.");
    }

    // Extra frontend check. Backend role verification remains authoritative.
    if (result.role.toUpperCase() !== expectedLoginType) {
      throw new Error("You are not authorized for this login type.");
    }

    sessionStorage.setItem("token", result.token);
    sessionStorage.setItem("userEmail", userEmail);
    sessionStorage.setItem("userId", String(result.userId));
    sessionStorage.setItem("userRole", result.role.toUpperCase());

    setToken(result.token);
    setLoggedInEmail(userEmail);
    setUserId(String(result.userId));
    setUserRole(result.role.toUpperCase());
    setEmail(userEmail);

    setShowLogin(false);
    setLoginPassword("");
    setOtp("");
    setOtpSent(false);
    setLoginError("");
    setLoginMessage("");
  };

  // PASSWORD LOGIN
  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    setLoginLoading(true);
    setLoginError("");
    setLoginMessage("");

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
          loginType: loginType,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || `Login failed: ${response.status}`
        );
      }

      completeLogin(result, loginEmail.trim(), loginType);
    } catch (err) {
      setLoginError(err.message || "Password login failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  // SEND EMAIL OTP
  const handleSendOtp = async () => {
    if (!loginEmail.trim()) {
      setLoginError("Please enter your email address.");
      return;
    }

    setLoginLoading(true);
    setLoginError("");
    setLoginMessage("");

    try {
      const response = await fetch("/api/user/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || `OTP sending failed: ${response.status}`
        );
      }

      setOtpSent(true);
      setLoginMessage(
        result.message ||
          "OTP sent successfully. Please check your email."
      );
    } catch (err) {
      setLoginError(err.message || "Unable to send OTP.");
    } finally {
      setLoginLoading(false);
    }
  };

  // VERIFY EMAIL OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setLoginLoading(true);
    setLoginError("");
    setLoginMessage("");

    try {
      const response = await fetch("/api/user/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          otp: otp.trim(),
          loginType: loginType,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || `OTP verification failed: ${response.status}`
        );
      }

      completeLogin(result, loginEmail.trim(), loginType);
    } catch (err) {
      setLoginError(err.message || "OTP verification failed.");
    } finally {
      setLoginLoading(false);
    }
  };

  // CREATE NEW USER ACCOUNT
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError("");

    if (registerPassword.length < 8) {
      setRegisterError("Password must be at least 8 characters.");
      return;
    }

    if (registerPassword !== confirmPassword) {
      setRegisterError("Password and confirm password do not match.");
      return;
    }

    setRegisterLoading(true);

    try {
      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerName.trim(),
          email: registerEmail.trim(),
          phone: registerPhone.trim(),
          password: registerPassword,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Account creation failed: ${response.status}`
        );
      }

      setLoginEmail(registerEmail.trim());
      setLoginMethod("password");
      setLoginView("login");
      setLoginError("");
      setLoginMessage(
        result.message || "Account created successfully. Please login."
      );

      setRegisterName("");
      setRegisterEmail("");
      setRegisterPhone("");
      setRegisterPassword("");
      setConfirmPassword("");
    } catch (err) {
      setRegisterError(err.message || "Unable to create account.");
    } finally {
      setRegisterLoading(false);
    }
  };

  // LOGOUT
 const handleLogout = async () => {

  setLogoutLoading(true);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("userEmail");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("userRole");

  setToken("");
  setLoggedInEmail("");
  setUserId("");
  setUserRole("");
  setMyBookings([]);
  setShowMyBookings(false);
  setEmail("");

  setLogoutLoading(false);
};

  // FETCH BOOKINGS FOR LOGGED-IN USER
  const loadMyBookings = async () => {
    if (!token || !userId) {
      setBookingsError("Please login again to view your bookings.");
      return;
    }

    setBookingsLoading(true);
    setBookingsError("");

    try {
      const response = await fetch(
        `/api/bookings/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json().catch(() => []);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          handleLogout();
          throw new Error("Session expired. Please login again.");
        }

        throw new Error(
          result.message || `Unable to load bookings: ${response.status}`
        );
      }

      setMyBookings(Array.isArray(result) ? result : []);
    } catch (err) {
      setBookingsError(err.message || "Unable to load your bookings.");
    } finally {
      setBookingsLoading(false);
    }
  };
// CANCEL BOOKING
const handleCancelBooking = async (bookingReference) => {
  const confirmCancel = window.confirm(
    `Are you sure you want to cancel booking ${bookingReference}?`
  );

  if (!confirmCancel) return;

  try {
    setCancellingReference(bookingReference);

    const response = await fetch(
      `/api/bookings/reference/${encodeURIComponent(bookingReference)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || "Unable to cancel booking.");
    }

    alert("Booking cancelled successfully!");
    await loadMyBookings();

  } catch (error) {
    alert(error.message || "Booking cancellation failed.");
  } finally {
    setCancellingReference("");
  }
};



  
  const openMyBookings = async () => {
    setShowMyBookings(true);
    await loadMyBookings();
  };

 
const handleBooking = async (e) => {
  e.preventDefault();

  if (!selectedEvent) return;

  if (!token) {
    setBookingError("Please login before booking your ticket.");
    setShowLogin(true);
    return;
  }

  if (!name.trim() || !email.trim() || !phone.trim()) {
    setBookingError("Please fill in your name, email and phone number.");
    return;
  }

  const parsedTicketCount = Number(ticketCount);

  if (!Number.isInteger(parsedTicketCount) || parsedTicketCount < 1) {
    setBookingError("Ticket count must be at least 1.");
    return;
  }

  setBookingLoading(true);
  setBookingError("");

  try {
    // Step 1: Load Razorpay Checkout script
    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = resolve;
        script.onerror = () =>
          reject(new Error("Razorpay SDK could not be loaded."));
        document.body.appendChild(script);
      });
    }

    // Step 2: Create payment order from backend
    const response = await fetch("/api/bookings/create-payment-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        eventId: Number(selectedEvent.id),
        ticketCount: parsedTicketCount,
      }),
    });

    const order = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(order.message || `Order creation failed: ${response.status}`);
    }

    // Step 3: Open Razorpay Checkout
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: "STRIKE Events",
      description: selectedEvent.title,
      order_id: order.razorpayOrderId,

      prefill: {
        name: name.trim(),
        email: email.trim(),
        contact: phone.trim(),
      },

      handler: async function (paymentResponse) {
        try {
          // Step 4: Verify payment with backend
          const verifyResponse = await fetch("/api/bookings/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
            }),
          });

          const verifiedResult = await verifyResponse.json().catch(() => ({}));

          if (!verifyResponse.ok) {
            throw new Error(
              verifiedResult.message || "Payment verification failed."
            );
          }

          // Save a complete confirmation snapshot before closing the checkout modal.
          const confirmedBooking = {
            ...verifiedResult,
            bookingReference:
              verifiedResult.bookingReference ||
              verifiedResult.booking?.bookingReference ||
              verifiedResult.reference ||
              "Confirmed",
            bookingStatus:
              verifiedResult.bookingStatus ||
              verifiedResult.booking?.bookingStatus ||
              verifiedResult.status ||
              "CONFIRMED",
            eventName: selectedEvent?.title || "STRIKE Event",
            eventVenue: selectedEvent?.location || "Venue details unavailable",
            ticketCount: parsedTicketCount,
            amount: Number(order.amount || 0) / 100,
            paymentId: paymentResponse.razorpay_payment_id,
            orderId: paymentResponse.razorpay_order_id,
            confirmedAt: new Date().toLocaleString(),
          };
          setBookingConfirmation(confirmedBooking);
          setBookingSuccess(null);
          setBookingError("");
          setSelectedEvent(null);
        } catch (err) {
          setBookingError(err.message || "Payment verification failed.");
        }
      },

      modal: {
        ondismiss: function () {
          setBookingError("Payment window closed. Your booking is not confirmed.");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();

  } catch (err) {
    setBookingError(err.message || "Unable to start payment. Please try again.");
  } finally {
    setBookingLoading(false);
  }
};


  // REFRESH PUBLIC EVENTS AFTER ADMIN CHANGES
  const refreshEvents = async () => {
    try {
      const response = await fetch("/api/events", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`API request failed: ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid events response from backend");

      setEvents(data.map((item, index) => ({
        id: item.id ?? index,
        title: item.name ?? "Untitled Event",
        category: item.category ?? "Events",
        date: item.date ?? item.eventDate ?? "Date TBA",
        location: item.venue || "Venue not announced",
        price: item.ticketPrice ?? null,
        image: item.name?.trim().toLowerCase() === "jibhi tour"
          ? "/images/jibhi.png"
          : eventImages[index % eventImages.length],
      })));
      setError("");
    } catch (err) {
      setAdminError(err.message || "Could not refresh events.");
    }
  };

  const resetAdminEventForm = () => {
    setAdminEventId(null);
    setAdminEventName("");
    setAdminEventDescription("");
    setAdminEventVenue("");
    setAdminTotalTickets("");
    setAdminTicketPrice("");
    setAdminMessage("");
    setAdminError("");
  };

  const handleAdminEventSubmit = async (e) => {
    e.preventDefault();
    if (userRole !== "ADMIN" || !token) {
      setAdminError("Only an authenticated admin can manage events.");
      return;
    }

    const totalTickets = Number(adminTotalTickets);
    const ticketPrice = Number(adminTicketPrice);
    if (!Number.isInteger(totalTickets) || totalTickets < 1) {
      setAdminError("Total tickets must be a whole number greater than 0.");
      return;
    }
    if (!Number.isFinite(ticketPrice) || ticketPrice < 0) {
      setAdminError("Enter a valid ticket price.");
      return;
    }

    setAdminLoading(true);
    setAdminError("");
    setAdminMessage("");

    try {
      const payload = {
        name: adminEventName.trim(),
        description: adminEventDescription.trim(),
        venue: adminEventVenue.trim(),
        totalTickets,
        ticketPrice,
      };
      const isEditing = adminEventId !== null;
      const response = await fetch(
        isEditing ? `/api/events/${adminEventId}` : "/api/events",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || result.error || `Event save failed: ${response.status}`);
      }

      await refreshEvents();
      resetAdminEventForm();
      setAdminMessage(isEditing ? "Event updated successfully." : "Event created successfully.");
    } catch (err) {
      setAdminError(err.message || "Unable to save event.");
    } finally {
      setAdminLoading(false);
    }
  };

  const startEditEvent = async (event) => {
    if (userRole !== "ADMIN" || !token) return;
    setAdminError("");
    setAdminMessage("");
    setAdminEventId(event.id);
    setAdminEventName(event.title || "");
    setAdminEventVenue(event.location === "Venue not announced" ? "" : event.location);
    setAdminTicketPrice(event.price ?? "");
    // The public list DTO currently exposes only name, venue and ticketPrice.
    // Admin must enter description and total capacity before submitting an update.
    setAdminEventDescription("");
    setAdminTotalTickets("");
    setShowAdminDashboard(true);
    document.getElementById("admin-dashboard")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAdminDeleteEvent = async (event) => {
    if (userRole !== "ADMIN" || !token) {
      setAdminError("Only an authenticated admin can delete events.");
      return;
    }
    const confirmed = window.confirm(
      `Delete "${event.title}"? Events with existing bookings cannot be deleted.`
    );
    if (!confirmed) return;

    setAdminLoading(true);
    setAdminError("");
    setAdminMessage("");
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || result.error || `Delete failed: ${response.status}`);
      }
      await refreshEvents();
      if (Number(adminEventId) === Number(event.id)) resetAdminEventForm();
      setAdminMessage("Event deleted successfully.");
    } catch (err) {
      setAdminError(err.message || "Unable to delete event.");
    } finally {
      setAdminLoading(false);
    }
  };

  // EXPLORE EVENTS
  const exploreEvents = () => {
    document.getElementById("events")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">S</span>
          <span>
            STRIKE<span className="brand-highlight">.</span>
            <small>EVENTS & EXPERIENCES</small>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#events">Explore Events</a>
          <a href="#categories">Categories</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="nav-auth-actions">
  <div className="account-menu">
    <button
      type="button"
      className="hamburger-btn"
      onClick={() => setShowAccountMenu(!showAccountMenu)}
      aria-label="Open account menu"
    >
      ☰
    </button>

    {showAccountMenu && (
      <div className="account-dropdown">
        {token ? (
          <>
            <div className="account-email">
              {loggedInEmail}
            </div>

            {userRole === "ADMIN" && (
              <button
                type="button"
                onClick={() => {
                  setShowAccountMenu(false);
                  setShowAdminDashboard(true);
                  document.getElementById("admin-dashboard")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Admin Dashboard
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setShowAccountMenu(false);
                openMyBookings();
              }}
            >
              My Bookings
            </button>

            <button
              type="button"
            onClick={() => {
  handleLogout();
}}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setShowAccountMenu(false);
              setLoginError("");
              setLoginMessage("");
              setLoginView("login");
              setShowLogin(true);
            }}
          >
            Login
          </button>
        )}
      </div>
    )}
  </div>
</div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="live-dot"></span>
              YOUR NEXT EXPERIENCE STARTS HERE
            </div>

            <h1>
              Life happens
              <br />
              <span>outside</span> your
              <br />
              comfort zone.
            </h1>

            <p className="hero-description">
              Discover extraordinary events, meet incredible
              people, and create memories worth talking about.
              Your next great experience is just a ticket away.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={exploreEvents}
              >
                Explore Events <span>↗</span>
              </button>

              <a href="#how-it-works" className="text-button">
                How it works <span>→</span>
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <strong>{events.length}</strong>
                <span>Experiences</span>
              </div>

              <div>
                <strong>{venueCount}</strong>
                <span>Venues</span>
              </div>

              <div>
                <strong>100%</strong>
                <span>Digital tickets</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image">
              <img
                src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1100&q=90"
                alt="Live music event with a crowd"
              />

              <div className="image-overlay"></div>

              <div className="floating-label">
                <span className="floating-icon">✦</span>
                <div>
                  <strong>Make it memorable.</strong>
                  <small>Your next story starts here.</small>
                </div>
              </div>

              <div className="image-number">
                <span>01</span> / 06
              </div>
            </div>

            <div className="hero-orbit orbit-one"></div>
            <div className="hero-orbit orbit-two"></div>

            <span className="hero-spark spark-one">✳</span>
            <span className="hero-spark spark-two">✦</span>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="category-section" id="categories">
          <div className="section-heading">
            <div>
              <span className="section-label">FIND YOUR VIBE</span>
              <h2>What are you into?</h2>
            </div>

            <p>
              Different interests. One place to find them all.
            </p>
          </div>

          <div className="category-list">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-chip ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => {
                  setActiveCategory(category);
                  exploreEvents();
                }}
              >
                {category === "All" && "✦"}
                {category === "Events" && "▦"}
                <span>{category}</span>
              </button>
            ))}
          </div>
        </section>

       
      {/* MY BOOKINGS POPUP */}
      {token && showMyBookings && (
        <div
          className="booking-modal-overlay"
          onClick={() => setShowMyBookings(false)}
        >
          <div
            className="booking-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="my-bookings-title"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="booking-modal-header">
              <div>
                <span className="section-label">
                  YOUR STRIKE ACTIVITY
                </span>
                <h2 id="my-bookings-title">My Bookings</h2>
                <p>Your event bookings, all in one place.</p>
              </div>

              <button
                type="button"
                className="booking-close-btn"
                onClick={() => setShowMyBookings(false)}
                aria-label="Close bookings"
              >
                ×
              </button>
            </div>

            {/* BOOKING CONTENT */}
            <div className="booking-modal-body">

              {bookingsLoading && (
                <div className="no-bookings">
                  <h3>Loading your bookings...</h3>
                </div>
              )}

              {!bookingsLoading && bookingsError && (
                <div className="no-bookings">
                  <h3>Could not load bookings</h3>
                  <p>{bookingsError}</p>
                  <button
                    className="refresh-bookings-btn"
                    onClick={loadMyBookings}
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!bookingsLoading &&
                !bookingsError &&
                myBookings.length === 0 && (
                  <div className="no-bookings">
                    <h3>No bookings yet</h3>
                    <p>Your confirmed bookings will appear here.</p>
                  </div>
                )}

              {!bookingsLoading &&
                !bookingsError &&
                myBookings.length > 0 && (
                  <div className="booking-modal-grid">
                    {myBookings.map((booking) => {
                      const bookedEvent = events.find(
                        (event) =>
                          Number(event.id) === Number(booking.eventId)
                      );

                      return (
                        <div
                          className="booking-card"
                          key={booking.id}
                        >
                          <span className="booking-status">
                            {booking.status || "BOOKING"}
                          </span>

                          <h3>
                            {bookedEvent?.title ||
                              `Event #${booking.eventId}`}
                          </h3>

                          <p>
                            ⌖ {bookedEvent?.location ||
                              "Venue details unavailable"}
                          </p>

                          <p>
                            ▦ {bookedEvent?.date || "Date TBA"}
                          </p>

                          <p>
                            Tickets: {booking.ticketCount}
                          </p>

                          <p>
                            Booking date: {booking.bookingDate || "N/A"}
                          </p>

                          <div className="booking-reference">
                            Reference: {booking.bookingReference}
                          </div>
                          {booking.status?.toUpperCase() !== "CANCELLED" && (
  <button
    type="button"
    className="cancel-booking-btn"
    onClick={() =>
      handleCancelBooking(booking.bookingReference)
    }
    disabled={cancellingReference === booking.bookingReference}
  >
    {cancellingReference === booking.bookingReference
      ? "Cancelling..."
      : "Cancel Booking"}
  </button>
)}
                        </div>

                        
                      );
                    })}
                  </div>
                )}
            </div>

            {/* FOOTER */}
            <div className="booking-modal-footer">
              <button
                type="button"
                className="refresh-bookings-btn"
                onClick={loadMyBookings}
                disabled={bookingsLoading}
              >
                {bookingsLoading ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                className="close-bookings-btn"
                onClick={() => setShowMyBookings(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}


        {/* ADMIN DASHBOARD - ADMIN ONLY */}
        {token && userRole === "ADMIN" && showAdminDashboard && (
          <section className="events-section" id="admin-dashboard">
            <div className="section-heading events-heading">
              <div>
                <span className="section-label">ADMIN CONTROL CENTER</span>
                <h2>Manage <span className="heading-highlight">Events.</span></h2>
                <p>Create, update and remove events from STRIKE.</p>
              </div>
              <button
                type="button"
                className="text-button"
                onClick={() => setShowAdminDashboard(false)}
              >
                Hide Dashboard ×
              </button>
            </div>

            <form className="booking-form" onSubmit={handleAdminEventSubmit}
              style={{ maxWidth: "760px", margin: "24px auto", padding: "24px", border: "1px solid rgba(255,255,255,.14)", borderRadius: "16px" }}>
              <h3>{adminEventId === null ? "Create New Event" : `Update Event #${adminEventId}`}</h3>

              <label className="form-field">
                Event Name
                <input value={adminEventName} onChange={(e) => setAdminEventName(e.target.value)}
                  placeholder="Enter event name" required />
              </label>

              <label className="form-field">
                Description
                <textarea value={adminEventDescription} onChange={(e) => setAdminEventDescription(e.target.value)}
                  placeholder="Enter event description" required rows={3} />
              </label>

              <label className="form-field">
                Venue
                <input value={adminEventVenue} onChange={(e) => setAdminEventVenue(e.target.value)}
                  placeholder="Enter venue" required />
              </label>

              <label className="form-field">
                Total Tickets
                <input type="number" min="1" step="1" value={adminTotalTickets}
                  onChange={(e) => setAdminTotalTickets(e.target.value)}
                  placeholder="Enter total ticket capacity" required />
              </label>

              <label className="form-field">
                Ticket Price (₹)
                <input type="number" min="0" step="0.01" value={adminTicketPrice}
                  onChange={(e) => setAdminTicketPrice(e.target.value)}
                  placeholder="Enter ticket price" required />
              </label>

              {adminError && <p className="booking-error" role="alert">{adminError}</p>}
              {adminMessage && <p style={{ color: "#36c98f" }} role="status">{adminMessage}</p>}

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button className="primary-button" type="submit" disabled={adminLoading}>
                  {adminLoading ? "Saving..." : adminEventId === null ? "Create Event" : "Update Event"}
                </button>
                {adminEventId !== null && (
                  <button type="button" className="text-button" onClick={resetAdminEventForm}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div style={{ maxWidth: "1000px", margin: "30px auto" }}>
              <h3>Existing Events ({events.length})</h3>
              {events.length === 0 ? (
                <p>No events available to manage.</p>
              ) : (
                <div className="event-grid">
                  {events.map((event) => (
                    <article className="event-card" key={`admin-${event.id}`}>
                      <div className="event-card-body">
                        <span className="event-category">EVENT #{event.id}</span>
                        <h3>{event.title}</h3>
                        <p>Venue: {event.location}</p>
                        <p>Price: {event.price == null ? "TBA" : `₹${event.price}`}</p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
                          <button type="button" className="book-button" onClick={() => startEditEvent(event)}>
                            Edit Event
                          </button>
                          <button type="button" className="cancel-booking-btn"
                            onClick={() => handleAdminDeleteEvent(event)} disabled={adminLoading}>
                            Delete Event
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* EVENTS */}
        <section className="events-section" id="events">
          <div className="section-heading events-heading">
            <div>
              <span className="section-label">THE GOOD STUFF</span>
              <h2>
                Events worth
                <span className="heading-highlight">
                  {" "}showing up for.
                </span>
              </h2>
            </div>

            <div className="event-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search events or locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="event-results">
            <span>
              {loading
                ? "Loading events from database..."
                : error
                  ? "Unable to load events"
                  : `${filteredEvents.length} events from database`}
            </span>

            <span>Discover something different ↘</span>
          </div>

          {loading && (
            <div className="empty-state">
              <h3>Loading events...</h3>
              <p>Connecting to your Spring Boot backend.</p>
            </div>
          )}

          {!loading && error && (
            <div className="empty-state">
              <h3>Could not load events</h3>
              <p>{error}</p>

              <button
                className="primary-button"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && filteredEvents.length > 0 && (
            <div className="event-grid">
              {filteredEvents.map((event) => (
                <article className="event-card" key={event.id}>
                  <div className="event-image">
                    <img src={event.image} alt={event.title} />

                    <span className="event-tag">
                      {event.tag}
                    </span>

                    <button
                      className="favorite-button"
                      aria-label={`View ${event.title}`}
                      onClick={() => {
                        setBookingError("");
                        setBookingSuccess(null);
                        setBookingConfirmation(null);
                        setSelectedEvent(event);
                      }}
                    >
                      ↗
                    </button>
                  </div>

                  <div className="event-card-body">
                    <span className="event-category">
                      {event.category}
                    </span>

                    <h3>{event.title}</h3>

                    <div className="event-meta">
                      <span>▦ {event.date}</span>
                      <span>⌖ {event.location}</span>
                    </div>

                    <div className="event-card-footer">
                      <div className="event-price">
                        <small>
                          {event.price == null
                            ? "Ticket price"
                            : "Starting from"}
                        </small>

                        <strong>
                          {event.price == null
                            ? "TBA"
                            : `₹${event.price}`}
                        </strong>
                      </div>

                      <button
                        className="book-button"
                        onClick={() => {
                          setBookingError("");
                          setBookingSuccess(null);
                          setBookingConfirmation(null);
                          setSelectedEvent(event);
                        }}
                      >
                        View Details <span>↗</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading &&
            !error &&
            filteredEvents.length === 0 && (
              <div className="empty-state">
                <span>⌕</span>
                <h3>No events found</h3>

                <p>
                  Try another search or select a different category.
                </p>

                <button
                  className="primary-button"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("All");
                  }}
                >
                  Show All Events
                </button>
              </div>
            )}
        </section>
                {/* HOW IT WORKS */}
        <section className="how-section" id="how-it-works">
          <span className="section-label">SIMPLE AS IT GETS</span>
          <h2>Your next plan, in three steps.</h2>

          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>
              <div className="step-icon">⌕</div>
              <h3>Find your event</h3>
              <p>
                Explore experiences and find something you love.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">02</span>
              <div className="step-icon">↗</div>
              <h3>Book your tickets</h3>
              <p>
                Choose your event and reserve your spot.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">03</span>
              <div className="step-icon">✦</div>
              <h3>Show up & enjoy</h3>
              <p>
                Get your digital ticket and make memories.
              </p>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bottom-cta">
          <div>
            <span className="section-label">
              YOUR NEXT STORY AWAITS
            </span>

            <h2>Don't just hear about it. Be there.</h2>

            <p>
              Find your people. Find your next experience.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={exploreEvents}
          >
            Find Your Event <span>↗</span>
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer" id="footer">
        <a href="#home" className="brand">
          <span className="brand-icon">S</span>
          <span>
            STRIKE<span className="brand-highlight">.</span>
            <small>EVENTS & EXPERIENCES</small>
          </span>
        </a>

        <p>Made for moments that matter.</p>
        <span>© 2026 Strike Events</span>
      </footer>

      {/* EVENT DETAILS AND BOOKING MODAL */}
      {selectedEvent && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close"
            >
              ×
            </button>

            {bookingSuccess ? (
              <div className="booking-success">
                <span className="section-label">
                  BOOKING CONFIRMED
                </span>

                <h2>You're all booked!</h2>

                <p>
                  Booking Reference:
                  <strong>
                    {" "}{bookingSuccess.bookingReference}
                  </strong>
                </p>

               <p>Status: {bookingSuccess.bookingStatus || bookingSuccess.status}</p>

                <p>
                  Check your email for your digital ticket and QR code.
                </p>

                <button
                  className="primary-button modal-done"
                  onClick={() => {
                    setSelectedEvent(null);
                    setBookingSuccess(null);
                    setBookingError("");
                    setName("");
                    setEmail(loggedInEmail);
                    setPhone("");
                    setTicketCount(1);

                    if (showMyBookings) {
                      loadMyBookings();
                    }
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <span className="section-label">EVENT DETAILS</span>

                <h2 id="modal-title">{selectedEvent.title}</h2>

                <p>
                  {selectedEvent.category} · {selectedEvent.location}
                </p>

                <p>Date: {selectedEvent.date}</p>

                <div className="preview-note">
                  <strong>Ready to book?</strong>
                  <p>
                    Enter your details and select your ticket quantity.
                  </p>
                </div>

                {!token && (
                  <div className="preview-note">
                    <strong>Login required</strong>
                    <p>Please login first to confirm your booking.</p>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => {
                        setLoginError("");
                        setLoginView("login");
                        setShowLogin(true);
                      }}
                    >
                      Login to Continue
                    </button>
                  </div>
                )}

                <form
                  className="booking-form"
                  onSubmit={handleBooking}
                >
                  <label className="form-field">
                    Full Name
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </label>

                  <label className="form-field">
                    Email Address
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </label>

                  <label className="form-field">
                    Mobile Number
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your mobile number"
                      required
                    />
                  </label>

                  <label className="form-field">
                    Number of Tickets
                    <input
                      type="number"
                      min="1"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(e.target.value)}
                      required
                    />
                  </label>

                  {bookingError && (
                    <p className="booking-error" role="alert">
                      {bookingError}
                    </p>
                  )}

                  <button
                    className="primary-button modal-done"
                    type="submit"
                    disabled={bookingLoading}
                  >
                   {bookingLoading
        ? "Creating order..."
                : "Proceed to Payment"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* PAYMENT SUCCESS / BOOKING DETAILS */}
      {bookingConfirmation && (
        <div
          className="modal-backdrop"
          onClick={() => setBookingConfirmation(null)}
        >
          <div
            className="event-modal booking-confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-confirmation-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="booking-success">
              <span className="section-label">PAYMENT SUCCESSFUL</span>
              <h2 id="booking-confirmation-title">Your booking is confirmed!</h2>
              <p>Your payment was verified and your ticket booking is complete.</p>

              <div className="booking-confirmation-details" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px", margin: "22px 0", textAlign: "left" }}>
                <div style={{ padding: "12px", borderRadius: "10px", background: "#da1111bc" }}><span>Event</span><strong style={{ display: "block", overflowWrap: "anywhere" }}>{bookingConfirmation.eventName}</strong></div>
                <div style={{ padding: "12px", borderRadius: "10px", background: "#e615150f" }}><span>Venue</span><strong style={{ display: "block", overflowWrap: "anywhere" }}>{bookingConfirmation.eventVenue}</strong></div>
                <div style={{ padding: "12px", borderRadius: "10px", background: "#ef1b1b0f" }}><span>Booking Reference</span><strong style={{ display: "block", overflowWrap: "anywhere" }}>{bookingConfirmation.bookingReference}</strong></div>
                <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,.06)" }}><span>Booking Status</span><strong style={{ display: "block" }}>{bookingConfirmation.bookingStatus}</strong></div>
                <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,.06)" }}><span>Tickets</span><strong style={{ display: "block" }}>{bookingConfirmation.ticketCount}</strong></div>
                <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,.06)" }}><span>Amount Paid</span><strong style={{ display: "block" }}>₹{Number(bookingConfirmation.amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</strong></div>
                <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,.06)" }}><span>Payment ID</span><strong style={{ display: "block", overflowWrap: "anywhere" }}>{bookingConfirmation.paymentId || "Verified"}</strong></div>
                <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,.06)" }}><span>Confirmed At</span><strong style={{ display: "block" }}>{bookingConfirmation.confirmedAt}</strong></div>
              </div>

              <p className="booking-confirmation-note">
                Your booking is saved. You can find it anytime under My Bookings.
                Check your email for the digital ticket and QR code if email delivery is enabled.
              </p>

              <div className="booking-confirmation-actions">
                <button
                  type="button"
                  className="primary-button modal-done"
                  onClick={() => {
                    setBookingConfirmation(null);
                    openMyBookings();
                  }}
                >
                  View My Bookings
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setBookingConfirmation(null)}
                >
                  Continue Exploring Events
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN AND REGISTRATION MODAL */}
      {showLogin && (
        <div
          className="modal-backdrop"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="event-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowLogin(false)}
              aria-label="Close"
            >
              ×
            </button>

            {/* CREATE ACCOUNT SCREEN */}
            {loginView === "register" ? (
              <>
                <span className="section-label">JOIN STRIKE</span>
                <h2 id="login-title">Create Account</h2>
                <p>
                  Create your account to discover and book events.
                </p>

                <form
                  className="booking-form"
                  onSubmit={handleRegister}
                >
                  <label className="form-field">
                    Full Name
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </label>

                  <label className="form-field">
                    Email Address
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </label>

                  <label className="form-field">
                    Mobile Number
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="Enter your mobile number"
                      required
                    />
                  </label>

                  <label className="form-field">
                    Password
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      minLength="8"
                      required
                    />
                  </label>

                  <label className="form-field">
                    Confirm Password
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      minLength="8"
                      required
                    />
                  </label>

                  {registerError && (
                    <p className="booking-error" role="alert">
                      {registerError}
                    </p>
                  )}

                  <button
                    className="primary-button modal-done"
                    type="submit"
                    disabled={registerLoading}
                  >
                    {registerLoading
                      ? "Creating Account..."
                      : "Create Account"}
                  </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "18px" }}>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setLoginView("login");
                      setRegisterError("");
                    }}
                  >
                    Login
                  </button>
                </p>
              </>
            ) : (
              <>
                <span className="section-label">WELCOME BACK</span>

                <h2 id="login-title">Login to STRIKE</h2>

                <p>Choose your preferred login method.</p>

                {/* LOGIN TYPE SELECTOR */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    margin: "20px 0",
                  }}
                >
                  <button
                    type="button"
                    className="primary-button"
                    style={{
                      flex: 1,
                      opacity: loginType === "USER" ? 1 : 0.55,
                    }}
                    onClick={() => {
                      setLoginType("USER");
                      setLoginError("");
                      setLoginMessage("");
                    }}
                  >
                    User Login
                  </button>

                  <button
                    type="button"
                    className="primary-button"
                    style={{
                      flex: 1,
                      opacity: loginType === "ADMIN" ? 1 : 0.55,
                    }}
                    onClick={() => {
                      setLoginType("ADMIN");
                      setLoginMethod("password");
                      setOtpSent(false);
                      setOtp("");
                      setLoginError("");
                      setLoginMessage("");
                    }}
                  >
                    Admin Login
                  </button>
                </div>

                <p style={{ marginBottom: "16px" }}>
                  {loginType === "ADMIN"
                    ? "Sign in with your authorized administrator account."
                    : "Sign in or create an account to book events."}
                </p>

                {/* LOGIN METHOD SELECTOR */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    margin: "20px 0",
                  }}
                >
                  <button
                    type="button"
                    className="primary-button"
                    style={{
                      flex: 1,
                      opacity: loginMethod === "password" ? 1 : 0.55,
                    }}
                    onClick={() => {
                      setLoginMethod("password");
                      setOtpSent(false);
                      setOtp("");
                      setLoginError("");
                      setLoginMessage("");
                    }}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    className="primary-button"
                    style={{
                      flex: 1,
                      opacity: loginMethod === "otp" ? 1 : 0.55,
                    }}
                    onClick={() => {
                      setLoginMethod("otp");
                      setOtpSent(false);
                      setOtp("");
                      setLoginError("");
                      setLoginMessage("");
                    }}
                  >
                    Email OTP
                  </button>
                </div>

                {loginMethod === "password" ? (
                  <form
                    className="booking-form"
                    onSubmit={handlePasswordLogin}
                  >
                    <label className="form-field">
                      Email Address
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        required
                      />
                    </label>

                    <label className="form-field">
                      Password
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </label>

                    {loginError && (
                      <p className="booking-error" role="alert">
                        {loginError}
                      </p>
                    )}

                    <button
                      className="primary-button modal-done"
                      type="submit"
                      disabled={loginLoading}
                    >
                      {loginLoading
                        ? "Logging in..."
                        : loginType === "ADMIN"
                          ? "Login as Admin"
                          : "Login as User"}
                    </button>
                  </form>
                ) : (
                  <form
                    className="booking-form"
                    onSubmit={handleVerifyOtp}
                  >
                    <label className="form-field">
                      Email Address
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        required
                        disabled={otpSent || loginLoading}
                      />
                    </label>

                    {!otpSent ? (
                      <button
                        className="primary-button modal-done"
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loginLoading || !loginEmail.trim()}
                      >
                        {loginLoading ? "Sending OTP..." : "Send Email OTP"}
                      </button>
                    ) : (
                      <>
                        <label className="form-field">
                          Enter 6-digit OTP
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={otp}
                            onChange={(e) =>
                              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                            }
                            placeholder="Enter OTP sent to your email"
                            maxLength={6}
                            required
                          />
                        </label>

                        <button
                          className="primary-button modal-done"
                          type="submit"
                          disabled={loginLoading || otp.length !== 6}
                        >
                          {loginLoading
                            ? "Verifying..."
                            : loginType === "ADMIN"
                              ? "Verify & Login as Admin"
                              : "Verify & Login as User"}
                        </button>

                        <button
                          type="button"
                          className="text-button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtp("");
                            setLoginError("");
                            setLoginMessage("");
                          }}
                          disabled={loginLoading}
                        >
                          Change email / send another OTP
                        </button>
                      </>
                    )}
                  </form>
                )}

                {loginMessage && (
                  <p
                    style={{
                      color: "#36c98f",
                      marginTop: "12px",
                    }}
                  >
                    {loginMessage}
                  </p>
                )}

                {loginError && (
                  <p className="booking-error" role="alert">
                    {loginError}
                  </p>
                )}

                {/* CREATE ACCOUNT LINK - USER LOGIN ONLY */}
                {loginType === "USER" && (
                <p style={{ textAlign: "center", marginTop: "18px" }}>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setLoginView("register");
                      setRegisterError("");
                      setLoginError("");
                      setLoginMessage("");
                    }}
                  >
                    Create Account
                  </button>
                </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;