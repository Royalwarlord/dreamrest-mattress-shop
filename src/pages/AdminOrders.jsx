import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API_URL from "../api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem(
  "dreamrest_admin_token"
);

const response = await fetch(
  `${API_URL}/api/admin/orders/${orderId}/status`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load orders.");
      }

      setOrders(data.orders);
    } catch (error) {
      console.error("Admin orders error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
const updateOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem(
      "dreamrest_admin_token"
    );

    const response = await fetch(
      `${API_URL}/api/admin/orders/${orderId}/status`,
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

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: data.order.status,
            }
          : order
      )
    );

  } catch (error) {
    console.error(
      "Status update error:",
      error
    );

    alert(error.message);
  }
};

  if (loading) {
    return (
      <div className="admin-orders-page">
        <div className="admin-orders-container">
          <h2>Loading Orders...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders-page">
        <div className="admin-orders-container">
          <h2>Unable to Load Orders</h2>
          <p>{error}</p>

          <button
            className="admin-refresh-btn"
            onClick={fetchOrders}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">

      <div className="admin-orders-container">

        {/* Header */}
        <div className="admin-orders-header">

          <div>
            <p className="admin-page-label">
              DREAMREST ADMIN
            </p>

            <h1>Order Management</h1>

            <p>
              Manage customer orders and update delivery status.
            </p>
          </div>

          <button
            className="admin-refresh-btn"
            onClick={fetchOrders}
          >
            Refresh Orders
          </button>

        </div>


        {/* Statistics */}
        <div className="admin-order-stats">

          <div className="admin-stat-card">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Processing</span>
            <strong>
              {
                orders.filter(
                  (order) => order.status === "Processing"
                ).length
              }
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>Out for Delivery</span>
            <strong>
              {
                orders.filter(
                  (order) =>
                    order.status === "Out for Delivery"
                ).length
              }
            </strong>
          </div>

          <div className="admin-stat-card">
            <span>Delivered</span>
            <strong>
              {
                orders.filter(
                  (order) => order.status === "Delivered"
                ).length
              }
            </strong>
          </div>

        </div>


        {/* Orders Table */}
        <div className="admin-orders-table-wrapper">

          <table className="admin-orders-table">

            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {orders.length === 0 ? (

                <tr>
                  <td colSpan="8" className="no-orders">
                    No orders found.
                  </td>
                </tr>

              ) : (

                orders.map((order) => (

                  <tr key={order.id}>

                    <td>
                      <strong>
                        #{order.id}
                      </strong>
                    </td>

                    <td>
                      {order.full_name}
                    </td>

                    <td>
                      {order.phone}
                    </td>

                    <td>
                      KSh{" "}
                      {Number(
                        order.total_amount
                      ).toLocaleString()}
                    </td>

                    <td>
                      <span className="payment-badge">
                        {order.payment_method}
                      </span>
                    </td>

                    <td>
                      <select
  className="admin-order-status-select"
  value={order.status}
  onChange={(e) =>
    updateOrderStatus(
      order.id,
      e.target.value
    )
  }
>
  <option value="pending">
    Pending
  </option>

  <option value="confirmed">
    Confirmed
  </option>

  <option value="processing">
    Processing
  </option>

  <option value="shipped">
    Shipped
  </option>

  <option value="delivered">
    Delivered
  </option>

  <option value="cancelled">
    Cancelled
  </option>
</select>
                    </td>

                    <td>
                      {new Date(
                        order.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <Link
  to={`/admin/orders/${order.id}`}
  className="admin-view-order-button"
>
  View
</Link>
                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AdminOrders;