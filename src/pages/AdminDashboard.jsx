import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH DASHBOARD
  // ========================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // Get the SAME token that AdminLogin saves
      const token = localStorage.getItem("dreamrest_admin_token");

      console.log("DASHBOARD TOKEN:", token);

      // No token
      if (!token) {
        throw new Error(
          "No admin authentication token found. Please log in again."
        );
      }

      // Send token to backend
      const response = await fetch(
        "http://localhost:5000/api/admin/dashboard",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      console.log("DASHBOARD RESPONSE:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load dashboard."
        );
      }

      setDashboard(data);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD DASHBOARD WHEN PAGE OPENS
  // ========================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-loading">
          <h2>Loading Dashboard...</h2>
          <p>
            Please wait while we retrieve your store data.
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
      <div className="admin-dashboard-page">
        <div className="admin-error">
          <h2>Dashboard Error</h2>

          <p>{error}</p>

          <button
            onClick={fetchDashboard}
            className="admin-retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // SAFETY CHECK
  // ========================================

  if (!dashboard) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-error">
          <h2>No Dashboard Data</h2>

          <p>
            The server did not return dashboard data.
          </p>

          <button
            onClick={fetchDashboard}
            className="admin-retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // DASHBOARD DATA
  // ========================================

  const stats = dashboard.statistics || {};

  const recentOrders =
    dashboard.recentOrders || [];

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="admin-dashboard-page">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="admin-dashboard-header">

        <div>

          <span className="admin-section-label">
            DREAMREST ADMINISTRATION
          </span>

          <h1>Dashboard</h1>

          <p>
            Welcome back. Here's what's happening
            with your store.
          </p>

        </div>

        <button
          onClick={fetchDashboard}
          className="admin-refresh-button"
        >
          ↻ Refresh
        </button>

      </div>


      {/* ========================================
          STATISTICS
      ======================================== */}

      <div className="admin-stat-grid">

        {/* TOTAL ORDERS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            🛒
          </div>

          <div>

            <span>
              Total Orders
            </span>

            <strong>
              {stats.totalOrders ?? 0}
            </strong>

          </div>

        </div>


        {/* PENDING ORDERS */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ⏳
          </div>

          <div>

            <span>
              Pending Orders
            </span>

            <strong>
              {stats.pendingOrders ?? 0}
            </strong>

          </div>

        </div>


        {/* PROCESSING */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ⚙️
          </div>

          <div>

            <span>
              Processing
            </span>

            <strong>
              {stats.processingOrders ?? 0}
            </strong>

          </div>

        </div>


        {/* DELIVERED */}

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ✓
          </div>

          <div>

            <span>
              Delivered
            </span>

            <strong>
              {stats.deliveredOrders ?? 0}
            </strong>

          </div>

        </div>


        {/* TOTAL SALES */}

        <div className="admin-stat-card admin-sales-card">

          <div className="admin-stat-icon">
            KSh
          </div>

          <div>

            <span>
              Total Sales
            </span>

            <strong>
              KSh{" "}
              {Number(
                stats.totalSales || 0
              ).toLocaleString()}
            </strong>

          </div>

        </div>

      </div>


      {/* ========================================
          RECENT ORDERS
      ======================================== */}

      <div className="admin-recent-section">

        <div className="admin-section-heading">

          <div>

            <span className="admin-section-label">
              ORDERS
            </span>

            <h2>
              Recent Orders
            </h2>

          </div>

          <Link
            to="/admin/orders"
            className="admin-view-all-button"
          >
            View All
          </Link>

        </div>


        {/* NO ORDERS */}

        {recentOrders.length === 0 ? (

          <div className="admin-empty-state">

            <h3>
              No Orders Yet
            </h3>

            <p>
              New customer orders will appear here.
            </p>

          </div>

        ) : (

          /* ORDERS TABLE */

          <div className="admin-orders-table-wrapper">

            <table className="admin-orders-table">

              <thead>

                <tr>

                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                  </th>

                </tr>

              </thead>


              <tbody>

                {recentOrders.map(
                  (order) => (

                    <tr
                      key={order.id}
                    >

                      {/* ORDER */}

                      <td>

                        <strong>
                          #{order.id}
                        </strong>

                      </td>


                      {/* CUSTOMER */}

                      <td>
                        {order.full_name}
                      </td>


                      {/* TOTAL */}

                      <td>

                        KSh{" "}

                        {Number(
                          order.total_amount || 0
                        ).toLocaleString()}

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={`admin-order-status admin-status-${order.status}`}
                        >
                          {order.status}
                        </span>

                      </td>


                      {/* DATE */}

                      <td>

                        {order.created_at
                          ? new Date(
                              order.created_at
                            ).toLocaleDateString()
                          : "-"

                        }

                      </td>


                      {/* VIEW */}

                      <td>

                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="admin-table-view"
                        >
                          View
                        </Link>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminDashboard;