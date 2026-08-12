import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

const products = [
  {
    id: 1,
    name: "DreamRest Classic",
    size: "4 x 6 ft",
    price: 15000,
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1000&q=80",
    description:
      "A comfortable and affordable mattress designed to give you quality sleep every night. Perfect for everyday use.",
    stock: 12,
  },
  {
    id: 2,
    name: "DreamRest Comfort",
    size: "5 x 6 ft",
    price: 20000,
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80",
    description:
      "Designed with comfort and support in mind, giving you a relaxing sleeping experience night after night.",
    stock: 8,
  },
  {
    id: 3,
    name: "DreamRest Premium",
    size: "6 x 6 ft",
    price: 25000,
    image:
      "https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=1000&q=80",
    description:
      "A premium mattress offering excellent comfort, support and durability for a restful night's sleep.",
    stock: 6,
  },
  {
    id: 4,
    name: "DreamRest Orthopedic",
    size: "5 x 6 ft",
    price: 28500,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
    description:
      "A supportive orthopedic mattress designed for customers looking for enhanced comfort and body support.",
    stock: 5,
  },
  {
    id: 5,
    name: "DreamRest Luxury",
    size: "6 x 6 ft",
    price: 35000,
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80",
    description:
      "Experience premium comfort with our luxury mattress, designed for a superior sleeping experience.",
    stock: 4,
  },
  {
    id: 6,
    name: "DreamRest Comfort Plus",
    size: "4 x 6 ft",
    price: 18000,
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80",
    description:
      "A balanced mattress offering excellent comfort and support at an affordable price.",
    stock: 10,
  },
];

function ProductDetails() {
  const { id } = useParams();

  const { addToCart } = useCart();

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return (
      <main className="not-found">
        <h1>Product Not Found</h1>

        <p>
          Sorry, the mattress you are looking for does not exist.
        </p>

        <Link to="/products" className="primary-btn">
          Back to Mattresses
        </Link>
      </main>
    );
  }

  return (
    <main className="product-details">

      <div className="product-details-container">

        {/* IMAGE */}

        <div className="details-image">

          <img
            src={product.image}
            alt={product.name}
          />

        </div>


        {/* INFORMATION */}

        <div className="details-info">

          <p className="details-size">
            {product.size}
          </p>

          <h1>{product.name}</h1>

          <div className="rating">
            ★★★★★
            <span> 5.0</span>
          </div>

          <h2 className="details-price">
            KSh {product.price.toLocaleString()}
          </h2>

          <p className="details-description">
            {product.description}
          </p>


          <div className="stock">
            <span>✓</span> {product.stock} items available
          </div>


          {/* QUANTITY */}

          <div className="quantity-section">

            <label>Quantity</label>

            <div className="quantity-control">

              <button>-</button>

              <span>1</span>

              <button>+</button>

            </div>

          </div>


          {/* ACTIONS */}

          <div className="details-actions">

            <button
  className="add-cart-btn"
  onClick={() => addToCart(product)}
>
  Add to Cart
</button>

            <Link
              to="/products"
              className="back-products"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}

export default ProductDetails;