import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import API_URL from "../api";

function Products() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const [addedProductId, setAddedProductId] = useState(null);

  // ========================================
  // IMAGE URL HELPER
  // ========================================

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `${API_URL}${imageUrl}`;
  };

  // ========================================
  // FETCH PRODUCTS
  // ========================================

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
  `${API_URL}/api/products`
);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load products."
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Products error:", error);

      setError(
        "Unable to load our mattress collection. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // CATEGORIES
  // ========================================

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [products]);

  // ========================================
  // FILTER + SORT PRODUCTS
  // ========================================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter((product) => {
        return (
          product.name?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search) ||
          product.material?.toLowerCase().includes(search)
        );
      });
    }

    // Category
    if (selectedCategory !== "All") {
      result = result.filter(
        (product) =>
          product.category === selectedCategory
      );
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price) - Number(b.price)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price) - Number(a.price)
      );
    }

    if (sortBy === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [
    products,
    searchTerm,
    selectedCategory,
    sortBy,
  ]);

  // ========================================
  // ADD TO CART
  // ========================================

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      size: product.size,
      image: getImageUrl(product.image_url),
      quantity: 1,
    });

    setAddedProductId(product.id);

    setTimeout(() => {
      setAddedProductId(null);
    }, 1500);
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="products-page">
        <section className="products-loading-section">
          <div className="products-spinner"></div>

          <h2>Loading our collection</h2>

          <p>
            Finding the perfect mattresses for you...
          </p>
        </section>
      </main>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="products-page">

      {/* ======================================
          HEADER
      ====================================== */}

      <section className="products-header">

        <div className="products-header-content">

          <span className="products-label">
            DREAMREST COLLECTION
          </span>

          <h1>
            Find Your Perfect
            <span> Mattress</span>
          </h1>

          <p>
            Discover premium mattresses designed
            to give you the comfort, support and
            restful sleep you deserve.
          </p>

        </div>

      </section>

      {/* ======================================
          SEARCH + FILTERS
      ====================================== */}

      <section className="products-controls">

        <div className="products-search">

          <span className="search-icon">
            🔍
          </span>

          <input
            type="text"
            placeholder="Search mattresses..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />

        </div>

        <div className="products-filters">

          <select
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value)
            }
          >
            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="featured">
              Featured
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="name">
              Name: A-Z
            </option>
          </select>

        </div>

      </section>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <section className="products-error">

          <div className="error-icon">
            ⚠️
          </div>

          <div>
            <h3>
              Something went wrong
            </h3>

            <p>{error}</p>

            <button
              onClick={fetchProducts}
              className="retry-button"
            >
              Try Again
            </button>
          </div>

        </section>
      )}

      {/* ======================================
          EMPTY DATABASE
      ====================================== */}

      {!error && products.length === 0 && (
        <section className="products-empty">

          <div className="empty-icon">
            🛏️
          </div>

          <h2>
            Our collection is coming soon
          </h2>

          <p>
            We are currently preparing our
            mattress collection. Please check
            back soon.
          </p>

        </section>
      )}

      {/* ======================================
          NO SEARCH RESULTS
      ====================================== */}

      {!error &&
        products.length > 0 &&
        filteredProducts.length === 0 && (
          <section className="products-empty">

            <div className="empty-icon">
              🔎
            </div>

            <h2>
              No mattresses found
            </h2>

            <p>
              Try changing your search or
              category filter.
            </p>

            <button
              className="clear-filters-button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
            >
              Clear Filters
            </button>

          </section>
        )}

      {/* ======================================
          PRODUCTS
      ====================================== */}

      {!error &&
        filteredProducts.length > 0 && (
          <section className="products-section">

            <div className="products-section-top">

              <div>
                <span className="products-count">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1
                    ? "mattress"
                    : "mattresses"}
                </span>

                <h2>
                  Our Collection
                </h2>
              </div>

            </div>

            <div className="products-grid">

              {filteredProducts.map((product) => {

                const stock =
                  Number(product.stock_quantity) || 0;

                const isInStock = stock > 0;

                const isAdded =
                  addedProductId === product.id;

                return (
                  <article
                    className="product-card"
                    key={product.id}
                  >

                    {/* IMAGE */}

                    <div className="product-image-wrapper">

                      <Link
                        to={`/products/${product.id}`}
                        className="product-image-container"
                      >

                        {product.image_url ? (
                          <img
                            src={getImageUrl(
                              product.image_url
                            )}
                            alt={product.name}
                            className="product-image"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";

                              event.currentTarget.nextSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}

                        <div
                          className="product-image-placeholder"
                          style={{
                            display:
                              product.image_url
                                ? "none"
                                : "flex",
                          }}
                        >
                          🛏️
                        </div>

                      </Link>

                      {/* STOCK BADGE */}

                      {isInStock ? (
                        <span className="stock-badge in-stock">
                          In Stock
                        </span>
                      ) : (
                        <span className="stock-badge out-stock">
                          Sold Out
                        </span>
                      )}

                    </div>

                    {/* CONTENT */}

                    <div className="product-card-content">

                      <span className="product-category">
                        {product.category ||
                          "Mattress"}
                      </span>

                      <Link
                        to={`/products/${product.id}`}
                        className="product-title"
                      >
                        {product.name}
                      </Link>

                      {product.description && (
                        <p className="product-description">
                          {product.description}
                        </p>
                      )}

                      {/* META */}

                      <div className="product-meta">

                        {product.size && (
                          <span>
                            <strong>
                              Size:
                            </strong>{" "}
                            {product.size}
                          </span>
                        )}

                        {product.material && (
                          <span>
                            <strong>
                              Material:
                            </strong>{" "}
                            {product.material}
                          </span>
                        )}

                      </div>

                      {/* PRICE */}

                      <div className="product-card-bottom">

                        <div className="product-price-wrapper">

                          <span className="price-label">
                            From
                          </span>

                          <strong className="product-price">
                            KES{" "}
                            {Number(
                              product.price
                            ).toLocaleString()}
                          </strong>

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="product-actions">

                        <Link
                          to={`/products/${product.id}`}
                          className="view-product-button"
                        >
                          View Details
                        </Link>

                        {isInStock ? (
                          <button
                            type="button"
                            className={`product-add-button ${
                              isAdded
                                ? "added"
                                : ""
                            }`}
                            onClick={() =>
                              handleAddToCart(
                                product
                              )
                            }
                          >
                            {isAdded
                              ? "✓ Added"
                              : "Add to Cart"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="product-out-button"
                            disabled
                          >
                            Out of Stock
                          </button>
                        )}

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>

          </section>
        )}

    </main>
  );
}

export default Products;