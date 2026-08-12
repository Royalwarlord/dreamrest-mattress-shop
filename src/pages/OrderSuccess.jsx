import { Link, useParams } from "react-router-dom";

function OrderSuccess() {
  const { orderId } = useParams();

  return (
    <div className="order-success-page">
      <div className="success-card">

        <div className="success-icon">
          ✓
        </div>

        <p className="success-label">ORDER CONFIRMED</p>

        <h1>Thank You for Your Order!</h1>

        <p className="success-message">
          Your order has been received successfully and is now being processed.
        </p>

        <div className="order-number">
          <span>Order Number</span>
          <strong>#{orderId}</strong>
        </div>

        <p className="delivery-message">
          We will contact you using the phone number provided during checkout
          to confirm your delivery details.
        </p>

        <Link to="/mattresses" className="continue-shopping-btn">
          Continue Shopping
        </Link>

      </div>
    </div>
  );
}

export default OrderSuccess;