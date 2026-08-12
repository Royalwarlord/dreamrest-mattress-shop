import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";

function Navbar() {
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="navbar">

      <div className="navbar-container">

        {/* LOGO */}
        <Link
          to="/"
          className="logo"
          onClick={() => setMenuOpen(false)}
        >
          Dream<span>Rest</span>
        </Link>


        {/* NAVIGATION */}
        <nav
          className={
            menuOpen
              ? "nav-links active"
              : "nav-links"
          }
        >

          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            to="/products"
            onClick={() => setMenuOpen(false)}
          >
            Mattresses
          </Link>

          <Link
            to="/about"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>

          <Link
            to="/contact"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>

        </nav>


        {/* CART */}
        <Link
          to="/cart"
          className="cart-link"
        >
          <span className="cart-icon">
            🛒
          </span>

          <span className="cart-text">
            Cart
          </span>

          <span className="cart-count">
            {cartCount}
          </span>
        </Link>


        {/* MOBILE MENU */}
        <button
          type="button"
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>

      </div>

    </header>
  );
}

export default Navbar;