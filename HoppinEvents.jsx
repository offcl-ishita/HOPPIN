import React, { useMemo, useState } from "react";
import "./Events.css";

const events = [
  {
    id: 1,
    title: "Annual Cultural Fest",
    shortTitle: "Milan",
    date: "Oct 12, 2026",
    time: "10:00 AM – 10:00 PM",
    location: "TP Ganesan Auditorium",
    category: "Cultural",
    status: "Upcoming",
    attendees: 842,
    capacity: 1200,
    description:
      "The flagship annual cultural festival featuring mega-stage concerts, celebrity performances, student showcases and thousands of students.",
    color: "green",
    icon: "✦",
  },
  {
    id: 2,
    title: "Hackathon: ACM SIGAI",
    shortTitle: "SIGAI Hackathon",
    date: "Oct 15, 2026",
    time: "08:00 AM – 08:00 PM",
    location: "Tech Park, 4th Floor",
    category: "Tech",
    status: "Upcoming",
    attendees: 438,
    capacity: 500,
    description:
      "A 12-hour intensive coding marathon focused on spatial AI algorithms, automated routing and campus telemetry systems.",
    color: "blue",
    icon: "⌁",
  },
  {
    id: 3,
    title: "Club Workshop",
    shortTitle: "Robotics Club Recruitment",
    date: "Oct 18, 2026",
    time: "04:30 PM – 06:30 PM",
    location: "Tech Park",
    category: "Workshop",
    status: "Upcoming",
    attendees: 126,
    capacity: 250,
    description:
      "An introductory robotics workshop and recruitment session for students interested in hardware, automation and robotics.",
    color: "purple",
    icon: "◈",
  },
  {
    id: 4,
    title: "Startup Connect",
    shortTitle: "Founder Meetup",
    date: "Oct 21, 2026",
    time: "05:00 PM – 07:00 PM",
    location: "Innovation Centre",
    category: "Business",
    status: "Upcoming",
    attendees: 94,
    capacity: 150,
    description:
      "Meet student founders, startup mentors and entrepreneurs working on exciting ideas across campus.",
    color: "orange",
    icon: "↗",
  },
  {
    id: 5,
    title: "Open Mic Night",
    shortTitle: "Open Mic",
    date: "Oct 24, 2026",
    time: "06:00 PM – 09:00 PM",
    location: "Dr. T. P. Ganesan Auditorium",
    category: "Cultural",
    status: "Upcoming",
    attendees: 311,
    capacity: 700,
    description:
      "An evening of music, poetry, stand-up comedy and student performances.",
    color: "pink",
    icon: "♫",
  },
];

const categories = [
  "All",
  "Cultural",
  "Tech",
  "Workshop",
  "Business",
];

export default function Events() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvped, setRsvped] = useState([]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const categoryMatch =
        activeCategory === "All" || event.category === activeCategory;

      const statusMatch =
        statusFilter === "All" || event.status === statusFilter;

      const searchMatch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.shortTitle.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase());

      return categoryMatch && statusMatch && searchMatch;
    });
  }, [activeCategory, statusFilter, search]);

  const toggleRSVP = (id) => {
    setRsvped((current) =>
      current.includes(id)
        ? current.filter((eventId) => eventId !== id)
        : [...current, id]
    );
  };

  return (
    <div className="hoppin-page">

      {/* NAVBAR */}
      <nav className="hoppin-navbar">
        <div className="brand">
          <div className="brand-mark">
            <span>⌁</span>
          </div>
          <span className="brand-name">HOPPIN</span>
        </div>

        <div className="nav-links">
          <a href="#">Liveboard</a>
          <a href="#">Bypass Map</a>
          <a href="#">Time Reclaimed</a>
          <a href="#">7 Systems</a>
          <a href="#">Campus Feeds</a>
          <a className="active" href="#">FAQ</a>
        </div>

        <button className="wallet-button">
          Join Waitlist
          <span>↗</span>
        </button>
      </nav>

      {/* MAIN */}
      <main className="events-container">

        {/* HEADER */}
        <section className="events-header">

          <div>
            <div className="eyebrow">
              <span className="pulse-dot" />
              LIVE CAMPUS EVENT RADAR
            </div>

            <h1>
              Never miss an event
              <br />
              <span>at SRM KTR.</span>
            </h1>

            <p>
              Discover what's happening around campus,
              track event capacity and RSVP before spaces fill up.
            </p>
          </div>

          <div className="header-stats">

            <div className="mini-stat">
              <strong>{events.length}</strong>
              <span>Events this month</span>
            </div>

            <div className="mini-stat">
              <strong>1,811</strong>
              <span>Students attending</span>
            </div>

          </div>

        </section>


        {/* FEATURED EVENT */}
        <section className="featured-event">

          <div className="featured-glow" />

          <div className="featured-content">

            <div className="featured-top">
              <span className="live-badge">
                <span />
                FEATURED EVENT
              </span>

              <span className="featured-date">
                OCT 12 · 10:00 AM
              </span>
            </div>

            <h2>Annual Cultural Fest</h2>

            <p>
              Milan 2026 is taking over SRM KTR with music,
              performances, competitions and thousands of students.
            </p>

            <div className="featured-info">
              <span>⌖ TP Ganesan Auditorium</span>
              <span>◷ 10:00 AM – 10:00 PM</span>
              <span>◉ 842 attending</span>
            </div>

            <button
              className="primary-button"
              onClick={() => setSelectedEvent(events[0])}
            >
              View Event
              <span>→</span>
            </button>

          </div>

          <div className="featured-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="featured-number">
              <span>12</span>
              OCT
            </div>
          </div>

        </section>


        {/* CONTROLS */}
        <section className="events-controls">

          <div className="filter-tabs">

            {["All", "Upcoming"].map((filter) => (
              <button
                key={filter}
                className={
                  statusFilter === filter ? "filter active" : "filter"
                }
                onClick={() => setStatusFilter(filter)}
              >
                {filter}
              </button>
            ))}

          </div>

          <div className="search-wrapper">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

        </section>


        {/* CATEGORY FILTERS */}
        <div className="category-row">

          {categories.map((category) => (
            <button
              key={category}
              className={
                activeCategory === category
                  ? "category active"
                  : "category"
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}

        </div>


        {/* EVENT GRID */}
        <section className="events-section">

          <div className="section-heading">

            <div>
              <span className="section-label">CAMPUS CALENDAR</span>

              <h2>
                What's happening
                <span> next.</span>
              </h2>
            </div>

            <span className="event-count">
              {filteredEvents.length} EVENTS
            </span>

          </div>


          <div className="event-grid">

            {filteredEvents.map((event) => {

              const percentage = Math.round(
                (event.attendees / event.capacity) * 100
              );

              const isRSVPed = rsvped.includes(event.id);

              return (
                <article
                  className="event-card"
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                >

                  <div className={`event-icon ${event.color}`}>
                    {event.icon}
                  </div>

                  <div className="event-card-top">

                    <span className="event-category">
                      {event.category}
                    </span>

                    <button
                      className="arrow-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    >
                      ↗
                    </button>

                  </div>


                  <div className="event-date">
                    <strong>
                      {event.date.split(" ")[1].replace(",", "")}
                    </strong>

                    <span>
                      {event.date.split(" ")[0].toUpperCase()}
                    </span>
                  </div>


                  <h3>{event.shortTitle}</h3>

                  <p>{event.description}</p>


                  <div className="event-location">
                    <span>⌖</span>
                    {event.location}
                  </div>


                  <div className="capacity-section">

                    <div className="capacity-label">

                      <span>Campus capacity</span>

                      <strong>
                        {percentage}%
                      </strong>

                    </div>

                    <div className="capacity-bar">
                      <div
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <small>
                      {event.attendees.toLocaleString()} /{" "}
                      {event.capacity.toLocaleString()} attending
                    </small>

                  </div>


                  <button
                    className={
                      isRSVPed
                        ? "rsvp-button joined"
                        : "rsvp-button"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRSVP(event.id);
                    }}
                  >
                    {isRSVPed ? "✓ You're going" : "RSVP"}
                  </button>

                </article>
              );
            })}

          </div>


          {filteredEvents.length === 0 && (
            <div className="empty-state">
              <div>⌕</div>
              <h3>No events found</h3>
              <p>
                Try another category or search term.
              </p>
            </div>
          )}

        </section>

      </main>


      {/* MODAL */}
      {selectedEvent && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >

          <div
            className="event-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="modal-close"
              onClick={() => setSelectedEvent(null)}
            >
              ×
            </button>

            <div
              className={`modal-icon ${selectedEvent.color}`}
            >
              {selectedEvent.icon}
            </div>

            <span className="event-category">
              {selectedEvent.category}
            </span>

            <h2>{selectedEvent.title}</h2>

            <p className="modal-description">
              {selectedEvent.description}
            </p>

            <div className="modal-details">

              <div>
                <span>DATE</span>
                <strong>{selectedEvent.date}</strong>
              </div>

              <div>
                <span>TIME</span>
                <strong>{selectedEvent.time}</strong>
              </div>

              <div>
                <span>LOCATION</span>
                <strong>{selectedEvent.location}</strong>
              </div>

              <div>
                <span>ATTENDING</span>
                <strong>
                  {selectedEvent.attendees.toLocaleString()} students
                </strong>
              </div>

            </div>

            <button
              className={
                rsvped.includes(selectedEvent.id)
                  ? "modal-rsvp joined"
                  : "modal-rsvp"
              }
              onClick={() => toggleRSVP(selectedEvent.id)}
            >
              {rsvped.includes(selectedEvent.id)
                ? "✓ RSVP Confirmed"
                : "Reserve My Spot"}
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
