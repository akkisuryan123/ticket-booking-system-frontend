
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

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  // const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [ticketCount, setTicketCount] = useState(1);
const [bookingLoading, setBookingLoading] = useState(false);
const [bookingError, setBookingError] = useState("");
const [bookingSuccess, setBookingSuccess] = useState(null);

  // Fetch real events from Spring Boot backend
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/events");

        if (!response.ok) {
          throw new Error(
            `API request failed: ${response.status}`
          );
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
          price: item.price ?? null,
          tag: "DATABASE EVENT",
          image: eventImages[index % eventImages.length],
        }));

        setEvents(mappedEvents);
      } catch (err) {
        console.error("Error loading events:", err);

        setError(
          "Events load nahi hue. Check karo ki Spring Boot aur Vite server running hain."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  // Search and category filter
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
// const handleBooking = async (e) => {
  
const handleBooking = async (e) => {
  e.preventDefault();

  if (!selectedEvent) return;

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
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        eventId: Number(selectedEvent.id),
        ticketCount: parsedTicketCount,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message || `Booking failed: ${response.status}`
      );
    }

    setBookingSuccess(result);
  } catch (err) {
    setBookingError(
      err.message || "Booking failed. Please try again."
    );
  } finally {
    setBookingLoading(false);
  }
};

  
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

        <button
          className="nav-button"
          onClick={exploreEvents}
        >
          Find Tickets <span>↗</span>
        </button>
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

          {/* Loading state */}
          {loading && (
            <div className="empty-state">
              <h3>Loading events...</h3>
              <p>Connecting to your Spring Boot backend.</p>
            </div>
          )}

          {/* Error state */}
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

          {/* Real event cards */}
          {!loading && !error && filteredEvents.length > 0 && (
            <div className="event-grid">
              {filteredEvents.map((event) => (
                <article className="event-card" key={event.id}>
                  <div className="event-image">
                    <img
                      src={event.image}
                      alt={event.title}
                    />

                    <span className="event-tag">
                      {event.tag}
                    </span>

                    <button
                      className="favorite-button"
                      aria-label={`View ${event.title}`}
                      onClick={() => setSelectedEvent(event)}
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
                        onClick={() => setSelectedEvent(event)}
                      >
                        View Details <span>↗</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* No search results */}
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

      {/* EVENT DETAILS MODAL */}
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

            <span className="section-label">EVENT DETAILS</span>
{bookingSuccess ? (
  <div className="booking-success">
    <span className="section-label">BOOKING CONFIRMED</span>
    <h2>You're all booked!</h2>

    <p>
      Booking Reference:
      <strong> {bookingSuccess.bookingReference}</strong>
    </p>

    <p>Status: {bookingSuccess.status}</p>
    <p>Check your email for your digital ticket and QR code.</p>

    <button
      className="primary-button modal-done"
      onClick={() => {
        setSelectedEvent(null);
        setBookingSuccess(null);
        setBookingError("");
        setUserId("");
        setTicketCount(1);
      }}
    >
      Done
    </button>
  </div>
) : (
  <>
    <span className="section-label">EVENT DETAILS</span>
    <h2 id="modal-title">{selectedEvent.title}</h2>
    <p>{selectedEvent.category} · {selectedEvent.location}</p>
    <p>Date: {selectedEvent.date}</p>

    <div className="preview-note">
      <strong>Ready to book?</strong>
      <p>
        Enter the ID of an existing user and select your ticket quantity.
      </p>
    </div>

    <form className="booking-form" onSubmit={handleBooking}>
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
    {bookingLoading ? "Booking..." : "Confirm Booking"}
  </button>
</form>
  </>
)}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
