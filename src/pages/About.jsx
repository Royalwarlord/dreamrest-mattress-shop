function About() {
  return (
    <div className="about-page">

      <section className="about-hero">
        <div className="about-hero-content">
          <span>ABOUT DREAMREST</span>

          <h1>
            Better Sleep.
            <br />
            Better Living.
          </h1>

          <p>
            At DreamRest, we believe that quality sleep is the
            foundation of a healthier and happier life.
          </p>
        </div>
      </section>


      <section className="about-intro">

        <div className="about-intro-content">
          <span className="about-label">
            WHO WE ARE
          </span>

          <h2>
            Comfort You Can
            <span> Trust</span>
          </h2>

          <p>
            DreamRest is a mattress store dedicated to helping
            customers discover better sleep through quality,
            comfortable and reliable mattresses.
          </p>

          <p>
            We provide a range of mattresses designed to offer
            excellent comfort, support and value for your money.
          </p>

          <p>
            Whether you are replacing an old mattress or creating
            your perfect bedroom, DreamRest is here to help.
          </p>
        </div>

      </section>


      <section className="about-values">

        <div className="about-section-heading">
          <span className="about-label">
            WHY DREAMREST
          </span>

          <h2>
            Built Around Your
            <span> Comfort</span>
          </h2>

          <p>
            Everything we do is focused on helping you sleep better.
          </p>
        </div>


        <div className="about-value-grid">

          <div className="about-value-card">
            <div className="about-value-icon">
              ✓
            </div>

            <h3>Quality</h3>

            <p>
              Quality mattresses designed for comfort, support
              and durability.
            </p>
          </div>


          <div className="about-value-card">
            <div className="about-value-icon">
              ♥
            </div>

            <h3>Comfort</h3>

            <p>
              We help you find the right mattress for your sleeping
              needs.
            </p>
          </div>


          <div className="about-value-card">
            <div className="about-value-icon">
              ★
            </div>

            <h3>Great Value</h3>

            <p>
              Comfortable sleeping solutions at competitive prices.
            </p>
          </div>


          <div className="about-value-card">
            <div className="about-value-icon">
              ✓
            </div>

            <h3>Customer First</h3>

            <p>
              We are committed to providing a simple and enjoyable
              shopping experience.
            </p>
          </div>

        </div>

      </section>


      <section className="about-cta">

        <span>
          READY FOR BETTER SLEEP?
        </span>

        <h2>
          Find Your Perfect Mattress
        </h2>

        <p>
          Explore our collection and discover the comfort you deserve.
        </p>

        <a href="/products" className="about-cta-button">
          Explore Mattresses
        </a>

      </section>

    </div>
  );
}

export default About;