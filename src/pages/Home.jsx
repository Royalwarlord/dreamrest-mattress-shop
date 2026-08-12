import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";
import {
  ShieldCheck,
  Truck,
  Heart,
  Star,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
     const response = await fetch(
  `${API_URL}/api/products`
);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load featured products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <main>

      {/* ========================================
          HERO
      ======================================== */}

      <section className="hero">

        <div className="hero-content">

          <p className="hero-tag">
            PREMIUM SLEEP • BETTER LIVING
          </p>

          <h1>
            Better Sleep
            <span> Starts Here.</span>
          </h1>

          <p className="hero-description">
            Discover quality mattresses designed for
            comfort, support and restful sleep every night.
          </p>

          <div className="hero-buttons">

            <Link
              to="/products"
              className="primary-btn"
            >
              Shop Mattresses
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/about"
              className="secondary-btn"
            >
              Learn More
            </Link>

          </div>

          <div className="hero-trust">

            <div>
              <CheckCircle size={16} />
              Quality Products
            </div>

            <div>
              <CheckCircle size={16} />
              Trusted Service
            </div>

          </div>

        </div>


        <div className="hero-image">

          <img
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80"
            alt="Comfortable bedroom with a mattress"
          />

          <div className="hero-image-badge">
            <Star size={16} fill="currentColor" />
            <div>
              <strong>Premium Comfort</strong>
              <span>Made for better sleep</span>
            </div>
          </div>

        </div>

      </section>


      {/* ========================================
          FEATURES
      ======================================== */}

      <section className="features">

        <div className="feature">

          <div className="feature-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h3>Quality Materials</h3>

            <p>
              Comfortable and durable mattresses
              made for long-lasting use.
            </p>
          </div>

        </div>


        <div className="feature">

          <div className="feature-icon">
            <Heart size={24} />
          </div>

          <div>
            <h3>Comfort First</h3>

            <p>
              Carefully selected mattresses designed
              around your comfort and support.
            </p>
          </div>

        </div>


        <div className="feature">

          <div className="feature-icon">
            <Truck size={24} />
          </div>

          <div>
            <h3>Fast Delivery</h3>

            <p>
              Convenient mattress delivery
              to your location.
            </p>
          </div>

        </div>

      </section>


      {/* ========================================
          INTRODUCTION
      ======================================== */}

      <section className="home-intro">

        <div className="home-intro-image">

          <img
            src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80"
            alt="Comfortable DreamRest bedroom"
          />

        </div>


        <div className="home-intro-content">

          <span className="home-section-label">
            WHY DREAMREST
          </span>

          <h2>
            Your comfort
            <span> matters to us.</span>
          </h2>

          <p>
            A good mattress is more than just a place
            to sleep. It supports your body, improves
            your comfort and helps you wake up ready
            for the day.
          </p>

          <p>
            At DreamRest, we make it easier to find
            quality mattresses that balance comfort,
            support and value.
          </p>

          <Link
            to="/about"
            className="home-text-link"
          >
            Discover DreamRest
            <ArrowRight size={17} />
          </Link>

        </div>

      </section>


      {/* ========================================
          FEATURED PRODUCTS
      ======================================== */}

      <section className="featured-products">

        <div className="home-section-heading">

          <div>

            <span className="home-section-label">
              OUR COLLECTION
            </span>

            <h2>
              Featured Mattresses
            </h2>

            <p>
              Explore some of our popular mattresses
              designed for comfortable nights.
            </p>

          </div>

          <Link
            to="/products"
            className="view-products-link"
          >
            View All
            <ArrowRight size={17} />
          </Link>

        </div>


        {loadingProducts ? (

          <div className="home-products-loading">
            Loading mattresses...
          </div>

        ) : products.length === 0 ? (

          <div className="home-products-empty">
            <p>
              Our mattresses will appear here soon.
            </p>

            <Link to="/products">
              Browse Products
            </Link>
          </div>

        ) : (

          <div className="home-product-grid">

            {products.map((product) => (

              <div
                className="home-product-card"
                key={product.id}
              >

                <div className="home-product-image">

                  {product.image_url ? (

                    <img
                      src={
                        product.image_url.startsWith("http")
                          ? product.image_url
                          : `${API_URL}${product.image_url}`
                      }
                      alt={product.name}
                    />

                  ) : (

                    <div className="home-product-placeholder">
                      No Image
                    </div>

                  )}

                </div>


                <div className="home-product-info">

                  <span>
                    {product.category || "Mattress"}
                  </span>

                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    {product.size || "Quality Mattress"}
                  </p>

                  <div className="home-product-bottom">

                    <strong>
                      KSh{" "}
                      {Number(product.price).toLocaleString()}
                    </strong>

                    <Link
                      to={`/products/${product.id}`}
                    >
                      View
                      <ArrowRight size={15} />
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* ========================================
          QUALITY SECTION
      ======================================== */}

      <section className="home-quality">

        <div className="home-quality-content">

          <span className="home-section-label">
            SLEEP BETTER
          </span>

          <h2>
            Designed for nights
            <span> you'll look forward to.</span>
          </h2>

          <p>
            From everyday comfort to premium support,
            our mattress collection is designed to help
            you create a better sleeping environment.
          </p>

          <div className="home-quality-list">

            <div>
              <CheckCircle size={19} />
              <span>Comfortable support</span>
            </div>

            <div>
              <CheckCircle size={19} />
              <span>Durable materials</span>
            </div>

            <div>
              <CheckCircle size={19} />
              <span>Excellent value</span>
            </div>

            <div>
              <CheckCircle size={19} />
              <span>Reliable delivery</span>
            </div>

          </div>

          <Link
            to="/products"
            className="primary-btn"
          >
            Find Your Mattress
            <ArrowRight size={17} />
          </Link>

        </div>


        <div className="home-quality-image">

          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80"
            alt="Beautiful bedroom"
          />

        </div>

      </section>


      {/* ========================================
          HOW IT WORKS
      ======================================== */}

      <section className="home-process">

        <div className="home-section-heading centered">

          <span className="home-section-label">
            SIMPLE & EASY
          </span>

          <h2>
            Get your mattress in three steps.
          </h2>

          <p>
            Shopping for your next mattress doesn't
            have to be complicated.
          </p>

        </div>


        <div className="process-grid">

          <div className="process-card">

            <div className="process-number">
              01
            </div>

            <h3>
              Choose
            </h3>

            <p>
              Browse our mattress collection and
              find the one that fits your needs.
            </p>

          </div>


          <div className="process-card">

            <div className="process-number">
              02
            </div>

            <h3>
              Order
            </h3>

            <p>
              Add your mattress to the cart and
              complete your order securely.
            </p>

          </div>


          <div className="process-card">

            <div className="process-number">
              03
            </div>

            <h3>
              Relax
            </h3>

            <p>
              We handle the delivery while you
              look forward to better sleep.
            </p>

          </div>

        </div>

      </section>


      {/* ========================================
          FINAL CTA
      ======================================== */}

      <section className="home-cta">

        <div>

          <span className="home-section-label">
            READY FOR BETTER SLEEP?
          </span>

          <h2>
            Find the comfort
            <span> you deserve.</span>
          </h2>

          <p>
            Explore our mattress collection and
            take the first step toward better nights.
          </p>

          <Link
            to="/products"
            className="cta-button"
          >
            Shop Mattresses
            <ArrowRight size={18} />
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Home;