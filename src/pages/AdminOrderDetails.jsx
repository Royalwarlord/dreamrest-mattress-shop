import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function AdminOrderDetails() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const statuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem(
        "dreamrest_admin_token"
      );

      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load order."
        );
      }

      setOrder(data.order);
    } catch (error) {
      console.error("Admin order error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      setUpdating(true);

      const token = localStorage.getItem(
        "dreamrest_admin_token"
      );

      const response = await fetch(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update order status."
        );
      }

      setOrder((currentOrder) => ({
        ...currentOrder,
        status: data.order.status,
      }));
    } catch (error) {
      console.error("Status update error:", error);
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-order-details-page">
        <div className="admin-order-details-card">
          <h2>Loading Order...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-order-details-page">
        <div className="admin-order-details-card">
          <h2>Unable to Load Order</h2>
          <p>{error}</p>

          <Link
            to="/admin/orders"
            className="admin-back-button"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-order-details-page">

      <div className="admin-order-details-card">

        {/* HEADER */}

        <div className="admin-order-details-header">

          <div>
            <span className="admin-section-label">
              ORDER MANAGEMENT
            </span>

            <h1>
              Order #{order.id}
            </h1>
          </div>

          <Link
            to="/admin/orders"
            className="admin-back-button"
          >
            ← Back to Orders
          </Link>

        </div>


        {/* STATUS */}

        <div className="admin-order-status-box">

          <div>
            <span>Current Status</span>

            <strong>
              {order.status}
            </strong>
          </div>

          <div className="admin-status-control">

            <label>
              Change Status
            </label>

            <select
              value={order.status}
              disabled={updating}
              onChange={(e) =>
                updateStatus(e.target.value)
              }
            >
              {statuses.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status
                    .charAt(0)
                    .toUpperCase() +
                    status.slice(1)}
                </option>
              ))}
            </select>

          </div>

        </div>


        {/* CUSTOMER */}

        <section className="admin-order-section">

          <h2>Customer Information</h2>

          <div className="admin-customer-grid">

            <div>
              <span>Full Name</span>
              <strong>{order.full_name}</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>{order.phone}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{order.email}</strong>
            </div>

            <div>
              <span>County</span>
              <strong>{order.county}</strong>
            </div>

            <div>
              <span>Town</span>
              <strong>{order.town}</strong>
            </div>

            <div>
              <span>Address</span>
              <strong>{order.address}</strong>
            </div>

            <div>
              <span>Payment Method</span>
              <strong>
                {order.payment_method}
              </strong>
            </div>

            <div>
              <span>Order Date</span>
              <strong>
                {new Date(
                  order.created_at
                ).toLocaleString()}
              </strong>
            </div>

          </div>

        </section>


        {/* ITEMS */}

        <section className="admin-order-section">

          <h2>Items Ordered</h2>

          <div className="admin-order-items">

            {order.items.map((item) => (

              <div
                className="admin-order-item"
                key={item.id}
              >

                <div>
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
                </div>

                <div className="admin-item-pricing">

                  <span>
                    KSh{" "}
                    {Number(
                      item.price
                    ).toLocaleString()}{" "}
                    each
                  </span>

                  <strong>
                    KSh{" "}
                    {Number(
                      item.subtotal
                    ).toLocaleString()}
                  </strong>

                </div>

              </div>

            ))}

          </div>

          <div className="admin-order-total">

            <span>Total Order Value</span>

            <strong>
              KSh{" "}
              {Number(
                order.total_amount
              ).toLocaleString()}
            </strong>

          </div>

        </section>

      </div>

    </div>
  );
}

export default AdminOrderDetails;