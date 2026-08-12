import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const adminData = localStorage.getItem("dreamrest_admin");

  const admin = adminData
    ? JSON.parse(adminData)
    : null;

  const handleLogout = () => {
    localStorage.removeItem("dreamrest_admin_token");
    localStorage.removeItem("dreamrest_admin");

    navigate("/admin/login", { replace: true });
  };

  const isActive = (path) => {
  return location.pathname.startsWith(path) ? "active" : "";
};

  return (
    <div className="admin-layout">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="admin-sidebar-logo">
          Dream<span>Rest</span>
        </div>

        <div className="admin-sidebar-section">
          <p>MAIN MENU</p>

          <Link
            to="/admin/dashboard"
            className={`admin-nav-link ${isActive(
              "/admin/dashboard"
            )}`}
          >
            <span>📊</span>
            Dashboard
          </Link>

          <Link
            to="/admin/orders"
            className={`admin-nav-link ${isActive(
              "/admin/orders"
            )}`}
          >
            <span>🛒</span>
            Orders
          </Link>

        </div>


        <div className="admin-sidebar-section">

          <p>MANAGEMENT</p>

          <Link
            to="/admin/products"
            className={`admin-nav-link ${isActive(
              "/admin/products"
            )}`}
          >
            <span>🛏️</span>
            Products
          </Link>

          <Link
            to="/admin/customers"
            className={`admin-nav-link ${isActive(
              "/admin/customers"
            )}`}
          >
            <span>👥</span>
            Customers
          </Link>

          <Link
    to="/"
    className="admin-nav-link"
  >
    <span>🌐</span>
    View Store
  </Link>
  

        </div>


        <div className="admin-sidebar-bottom">

          <button
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <span>🚪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* MAIN AREA */}

      <div className="admin-main">

        {/* TOP BAR */}

        <header className="admin-topbar">

          <div>
            <h2>DreamRest Administration</h2>
          </div>

          <div className="admin-user">

            <div className="admin-user-avatar">
              {admin?.name
                ? admin.name.charAt(0).toUpperCase()
                : "A"}
            </div>

            <div className="admin-user-info">

              <strong>
                {admin?.name || "Administrator"}
              </strong>

              <span>
                {admin?.role || "admin"}
              </span>

            </div>

          </div>

        </header>


        {/* PAGE CONTENT */}

        <main className="admin-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;