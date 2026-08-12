import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function OrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/orders/${orderId}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch order."
          );
        }

        setOrder(data.order);
      } catch (error) {
        console.error("Order fetch error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-card">
          <h2>Loading Order...</h2>

          <p>
            Please wait while we retrieve your order
            details.
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="order-details-page">
        <div className="order-details-card">
          <h2>Order Not Found</h2>

          <p>{error}</p>

          <Link
            to="/"
            className="continue-shopping-btn"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // ========================================
  // STATUS
  // ========================================

  const status = order.status?.toLowerCase();

  const statusLabels = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  const currentStatus =
    statusLabels[status] || "Pending";

  // ========================================
  // PROGRESS
  // ========================================

  const progressStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
  ];

  const currentIndex =
    progressStatuses.indexOf(status);

  return (
    <div className="order-details-page">

      <div className="order-details-card">

        {/* ========================================
            HEADER
        ======================================== */}

        <div className="order-details-header">

          <p className="success-label">
            ORDER DETAILS
          </p>

          <h1>
            Order #{order.id}
          </h1>

          <span
            className={`order-status order-status-${status}`}
          >
            {currentStatus}
          </span>

        </div>


        {/* ========================================
            CUSTOMER INFORMATION
        ======================================== */}

        <div className="order-section">

          <h2>Customer Information</h2>

          <div className="customer-details">

            <p>
              <strong>Name</strong>
              <span>{order.full_name}</span>
            </p>

            <p>
              <strong>Phone</strong>
              <span>{order.phone}</span>
            </p>

            <p>
              <strong>Email</strong>
              <span>{order.email}</span>
            </p>

            <p>
              <strong>County</strong>
              <span>{order.county}</span>
            </p>

            <p>
              <strong>Town</strong>
              <span>{order.town}</span>
            </p>

            <p>
              <strong>Address</strong>
              <span>{order.address}</span>
            </p>

            <p>
              <strong>Payment</strong>
              <span>
                {order.payment_method}
              </span>
            </p>

          </div>

        </div>


        {/* ========================================
            ITEMS ORDERED
        ======================================== */}

        <div className="order-section">

          <h2>Items Ordered</h2>

          <div className="order-items">

            {order.items.map((item) => (

              <div
                className="order-item"
                key={item.id}
              >

                <div className="order-item-info">

                  <h3>
                    {item.product_name}
                  </h3>

                  {item.size && (
                    <p>
                      Size: {item.size}
                    </p>
                  )}

                  <p>
                    Quantity: {item.quantity}
                  </p>

                  <p>
                    Unit Price: KSh{" "}
                    {Number(
                      item.price
                    ).toLocaleString()}
                  </p>

                </div>

                <div className="order-item-price">

                  KSh{" "}
                  {Number(
                    item.subtotal
                  ).toLocaleString()}

                </div>

              </div>

            ))}

          </div>


          {/* TOTAL */}

          <div className="order-total">

            <span>
              Total Amount
            </span>

            <strong>
              KSh{" "}
              {Number(
                order.total_amount
              ).toLocaleString()}
            </strong>

          </div>

        </div>


        {/* ========================================
            ORDER STATUS
        ======================================== */}

        <div className="order-section">

          <h2>Order Status</h2>

          {status === "cancelled" ? (

            <div className="cancelled-order-message">

              <div className="cancelled-icon">
                ✕
              </div>

              <div>
                <h3>
                  Order Cancelled
                </h3>

                <p>
                  This order has been cancelled.
                </p>
              </div>

            </div>

          ) : (

            <div className="order-progress">

              {progressStatuses.map(
                (step, index) => {

                  const isCompleted =
                    currentIndex >= index;

                  const isCurrent =
                    currentIndex === index;

                  return (
                    <div
                      className="progress-wrapper"
                      key={step}
                    >

                      <div
                        className={`progress-step ${
                          isCompleted
                            ? "completed"
                            : ""
                        } ${
                          isCurrent
                            ? "current"
                            : ""
                        }`}
                      >

                        <div className="progress-circle">

                          {isCompleted
                            ? "✓"
                            : index + 1}

                        </div>

                        <p>
                          {statusLabels[step]}
                        </p>

                      </div>

                      {index <
                        progressStatuses.length -
                          1 && (

                        <div
                          className={`progress-line ${
                            currentIndex >
                            index
                              ? "completed"
                              : ""
                          }`}
                        />

                      )}

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>


        {/* ========================================
            ORDER DATE
        ======================================== */}

        <div className="order-date">

          <span>
            Order placed:
          </span>

          <strong>
            {new Date(
              order.created_at
            ).toLocaleString()}
          </strong>

        </div>


        {/* ========================================
            BUTTONS
        ======================================== */}

        <div className="order-actions">

          <Link
            to="/mattresses"
            className="continue-shopping-btn"
          >
            Continue Shopping
          </Link>

          <Link
            to="/"
            className="back-home-btn"
          >
            Back to Home
          </Link>

        </div>

      </div>

    </div>
  );
}

export default OrderDetails;