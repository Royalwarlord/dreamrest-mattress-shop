import { Mail, Phone, MapPin, Clock } from "lucide-react";

function Contact() {
  return (
    <div className="contact-page">

      {/* HERO */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <span className="contact-label">
            GET IN TOUCH
          </span>

          <h1>
            We're Here to
            <span> Help You Sleep Better.</span>
          </h1>

          <p>
            Have a question about our mattresses, delivery,
            or your order? Our team is ready to help.
          </p>
        </div>
      </section>


      {/* CONTACT CONTENT */}
      <section className="contact-section">

        <div className="contact-container">

          {/* LEFT SIDE */}
          <div className="contact-info">

            <span className="contact-label">
              CONTACT DREAMREST
            </span>

            <h2>
              Let's talk about
              <br />
              your comfort.
            </h2>

            <p>
              Whether you're looking for the perfect mattress
              or need assistance with an existing order,
              feel free to reach out to us.
            </p>


            {/* PHONE */}
            <div className="contact-info-item">

              <div className="contact-icon">
                <Phone size={20} />
              </div>

              <div>
                <span>Phone</span>
                <strong>+254 700 000 000</strong>
              </div>

            </div>


            {/* EMAIL */}
            <div className="contact-info-item">

              <div className="contact-icon">
                <Mail size={20} />
              </div>

              <div>
                <span>Email</span>
                <strong>info@dreamrest.com</strong>
              </div>

            </div>


            {/* LOCATION */}
            <div className="contact-info-item">

              <div className="contact-icon">
                <MapPin size={20} />
              </div>

              <div>
                <span>Location</span>
                <strong>Kenya</strong>
              </div>

            </div>


            {/* HOURS */}
            <div className="contact-info-item">

              <div className="contact-icon">
                <Clock size={20} />
              </div>

              <div>
                <span>Business Hours</span>
                <strong>Monday – Saturday</strong>
                <small>8:00 AM – 6:00 PM</small>
              </div>

            </div>

          </div>


          {/* CONTACT FORM */}
          <div className="contact-form-card">

            <h3>Send us a message</h3>

            <p>
              Fill in the form and we'll get back to you.
            </p>

            <form>

              <div className="contact-form-row">

                <div className="contact-form-group">

                  <label htmlFor="contact-name">
                    Full Name
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                  />

                </div>


                <div className="contact-form-group">

                  <label htmlFor="contact-email">
                    Email Address
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                  />

                </div>

              </div>


              <div className="contact-form-group">

                <label htmlFor="contact-phone">
                  Phone Number
                </label>

                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                />

              </div>


              <div className="contact-form-group">

                <label htmlFor="contact-subject">
                  Subject
                </label>

                <input
                  id="contact-subject"
                  type="text"
                  placeholder="How can we help?"
                />

              </div>


              <div className="contact-form-group">

                <label htmlFor="contact-message">
                  Message
                </label>

                <textarea
                  id="contact-message"
                  rows="5"
                  placeholder="Write your message here..."
                />

              </div>


              <button
                type="submit"
                className="contact-submit-button"
              >
                Send Message
              </button>

            </form>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Contact;