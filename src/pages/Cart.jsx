import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    cartTotal,
  } = useCart();

  if (cart.length === 0) {
    return (
      <main className="cart-page">

        <div className="empty-cart">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h1>Your Cart Is Empty</h1>

          <p>
            You haven't added any mattresses to your cart yet.
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
    <main className="cart-page">

      <div className="cart-container">

        {/* PAGE HEADER */}

        <div className="cart-header">

          <p>YOUR SHOPPING CART</p>

          <h1>Your Cart</h1>

        </div>


        <div className="cart-layout">

          {/* CART ITEMS */}

          <div className="cart-items">

            {cart.map((item) => (

              <div
                className="cart-item"
                key={item.id}
              >

                <div className="cart-item-image">

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                </div>


                <div className="cart-item-info">

                  <p className="cart-item-size">
                    {item.size}
                  </p>

                  <h2>
                    {item.name}
                  </h2>

                  <p className="cart-item-price">
                    KSh {item.price.toLocaleString()}
                  </p>


                  <div className="cart-item-actions">

                    <div className="quantity-control">

                      <button
                        onClick={() =>
                          decreaseQuantity(item.id)
                        }
                      >
                        -
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id)
                        }
                      >
                        +
                      </button>

                    </div>


                    <button
                      className="remove-btn"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>


                <div className="cart-item-total">

                  KSh{" "}
                  {(
                    item.price * item.quantity
                  ).toLocaleString()}

                </div>

              </div>

            ))}

          </div>


          {/* ORDER SUMMARY */}

          <aside className="cart-summary">

            <h2>
              Order Summary
            </h2>

            <div className="summary-row">

              <span>
                Items
              </span>

              <span>
                {cart.length}
              </span>

            </div>


            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                KSh {cartTotal.toLocaleString()}
              </span>

            </div>


            <div className="summary-row">

              <span>
                Delivery
              </span>

              <span>
                To be calculated
              </span>

            </div>


            <div className="summary-divider"></div>


            <div className="summary-total">

              <span>
                Total
              </span>

              <strong>
                KSh {cartTotal.toLocaleString()}
              </strong>

            </div>


            <Link
              to="/checkout"
              className="checkout-btn"
            >
              Proceed to Checkout
            </Link>


            <Link
              to="/products"
              className="continue-shopping"
            >
              Continue Shopping
            </Link>

          </aside>

        </div>

      </div>

    </main>
  );
}

export default Cart;