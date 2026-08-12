import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import API_URL from "../api";

function Checkout() {
 const { cart, cartTotal, clearCart } = useCart();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    county: "",
    town: "",
    address: "",
    paymentMethod: "cash",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

 const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        county: formData.county,
        town: formData.town,
        address: formData.address,
        paymentMethod: formData.paymentMethod,
        cart: cart,
        totalAmount: cartTotal,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to place order"
      );
    }

    console.log("Order created:", data);

    // Clear purchased items from cart
    clearCart();

    // Go to order confirmation page
    navigate(`/order-success/${data.orderId}`);

  } catch (error) {
    console.error("Order submission error:", error);

    alert(
      "Unable to place your order right now. Please try again."
    );
  }
};

  if (cart.length === 0) {
    return (
      <main className="checkout-page">

        <div className="empty-checkout">

          <h1>Your Cart Is Empty</h1>

          <p>
            Add a mattress before proceeding to checkout.
          </p>

          <Link
            to="/products"
            className="primary-btn"
          >
            Shop Mattresses
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="checkout-page">

      <div className="checkout-container">

        <div className="checkout-header">

          <p>SECURE CHECKOUT</p>

          <h1>Complete Your Order</h1>

          <span>
            Enter your details and choose your preferred
            payment method.
          </span>

        </div>


        <div className="checkout-layout">

          {/* CUSTOMER INFORMATION */}

          <form
            className="checkout-form"
            onSubmit={handleSubmit}
          >

            <h2>Customer Information</h2>

            <div className="form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

            </div>


            <div className="form-row">

              <div className="form-group">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="07XXXXXXXX"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />

              </div>

            </div>


            <h2 className="delivery-title">
              Delivery Information
            </h2>


            <div className="form-row">

              <div className="form-group">

                <label>
                  County
                </label>

                <input
                  type="text"
                  name="county"
                  value={formData.county}
                  onChange={handleChange}
                  placeholder="e.g. Taita Taveta"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Town
                </label>

                <input
                  type="text"
                  name="town"
                  value={formData.town}
                  onChange={handleChange}
                  placeholder="e.g. Taveta"
                  required
                />

              </div>

            </div>


            <div className="form-group">

              <label>
                Delivery Address
              </label>

              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your delivery address"
                rows="4"
                required
              />

            </div>


            <h2 className="delivery-title">
              Payment Method
            </h2>


            <div className="payment-options">

              <label className="payment-option">

                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={
                    formData.paymentMethod === "cash"
                  }
                  onChange={handleChange}
                />

                <span>
                  Cash on Delivery
                </span>

              </label>


              <label className="payment-option">

                <input
                  type="radio"
                  name="paymentMethod"
                  value="mpesa"
                  checked={
                    formData.paymentMethod === "mpesa"
                  }
                  onChange={handleChange}
                />

                <span>
                  M-Pesa
                </span>

              </label>

            </div>


            <button
              type="submit"
              className="place-order-btn"
            >
              Place Order
            </button>

          </form>


          {/* ORDER SUMMARY */}

          <aside className="checkout-summary">

            <h2>
              Your Order
            </h2>

            {cart.map((item) => (

              <div
                className="checkout-item"
                key={item.id}
              >

                <img
                  src={item.image}
                  alt={item.name}
                />

                <div>

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    {item.size} × {item.quantity}
                  </p>

                </div>

                <strong>
                  KSh{" "}
                  {(
                    item.price * item.quantity
                  ).toLocaleString()}
                </strong>

              </div>

            ))}


            <div className="checkout-divider"></div>


            <div className="checkout-total">

              <span>
                Total
              </span>

              <strong>
                KSh {cartTotal.toLocaleString()}
              </strong>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Checkout;