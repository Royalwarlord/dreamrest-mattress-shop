import { useEffect, useState } from "react";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    size: "",
    stock: "",
    image_url: "",
    is_active: true,
  });

  const token = localStorage.getItem("dreamrest_admin_token");

  // ========================================
  // IMAGE URL HELPER
  // ========================================

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `http://localhost:5000${imageUrl}`;
  };

  // ========================================
  // FETCH PRODUCTS
  // ========================================

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/admin/products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to retrieve products."
        );
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Products error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ========================================
  // FORM INPUT
  // ========================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ========================================
  // IMAGE SELECT
  // ========================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // ========================================
  // RESET FORM
  // ========================================

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview("");

    setFormData({
      name: "",
      description: "",
      price: "",
      size: "",
      stock: "",
      image_url: "",
      is_active: true,
    });
  };

  // ========================================
  // EDIT PRODUCT
  // ========================================

 const handleEdit = (product) => {
  console.log("========== EDIT TEST ==========");
  console.log("Product ID:", product.id);
  console.log("Product Name:", product.name);
  console.log("IMAGE FROM DATABASE:", product.image_url);
  console.log("================================");

  // your existing handleEdit code...
  console.log("EDIT PRODUCT:", product);

  setEditingProduct(product);

  setFormData({
    name: product.name || "",
    description: product.description || "",
    price: product.price || "",
    size: product.size || "",
    material: product.material || "",
    stockQuantity: product.stock_quantity ?? "",
    imageUrl: product.image_url || "",
    category: product.category || "Mattress",
    is_active: product.is_active !== false,
  });

  // Show existing product image
  if (product.image_url) {
    if (product.image_url.startsWith("http")) {
      setImagePreview(product.image_url);
    } else {
      setImagePreview(
        `http://localhost:5000${product.image_url}`
      );
    }
  } else {
    setImagePreview("");
  }

  setShowForm(true);
};

  // ========================================
  // SUBMIT PRODUCT
  // ========================================
const handleSubmit = async (event) => {
  event.preventDefault();

  if (!formData.name.trim()) {
    alert("Product name is required.");
    return;
  }

  if (formData.price === "") {
    alert("Product price is required.");
    return;
  }

  try {
    setSaving(true);

    // ========================================
    // EXISTING IMAGE
    // ========================================

    let imageUrl = formData.image_url || "";

    console.log("Existing image:", imageUrl);

    // ========================================
    // UPLOAD NEW IMAGE
    // ========================================

    if (imageFile) {
      const imageData = new FormData();

      imageData.append("image", imageFile);

      console.log(
        "Uploading image:",
        imageFile.name
      );

      const imageResponse = await fetch(
        "http://localhost:5000/api/admin/products/upload-image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: imageData,
        }
      );

      const imageResult =
        await imageResponse.json();

      console.log(
        "IMAGE UPLOAD RESULT:",
        imageResult
      );

      if (
        !imageResponse.ok ||
        !imageResult.success
      ) {
        throw new Error(
          imageResult.message ||
            "Failed to upload image."
        );
      }

      imageUrl = imageResult.imageUrl;

      console.log(
        "NEW IMAGE URL:",
        imageUrl
      );
    }

    // ========================================
    // PRODUCT PAYLOAD
    // ========================================

    const productPayload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      size: formData.size,
      material: formData.material,

      // IMPORTANT
      stock_quantity:
        Number(formData.stockQuantity) || 0,

      image_url: imageUrl,

      category: formData.category,

      is_active:
        formData.is_active !== false,
    };

    console.log(
      "PRODUCT PAYLOAD:",
      productPayload
    );

    // ========================================
    // CREATE OR UPDATE
    // ========================================

    const isEditing =
      Boolean(editingProduct);

    const url = isEditing
      ? `http://localhost:5000/api/admin/products/${editingProduct.id}`
      : "http://localhost:5000/api/admin/products";

    const method = isEditing
      ? "PUT"
      : "POST";

    console.log("REQUEST URL:", url);
    console.log("REQUEST METHOD:", method);

    // ========================================
    // SAVE PRODUCT
    // ========================================

    const response = await fetch(url, {
      method: method,

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(
        productPayload
      ),
    });

    const data = await response.json();

    console.log(
      "PRODUCT SAVE RESULT:",
      data
    );

    if (
      !response.ok ||
      !data.success
    ) {
      throw new Error(
        data.message ||
          (
            isEditing
              ? "Failed to update product."
              : "Failed to create product."
          )
      );
    }

    // ========================================
    // UPDATE FRONTEND
    // ========================================

    if (isEditing) {

      setProducts(
        (currentProducts) =>
          currentProducts.map(
            (product) =>
              product.id ===
              editingProduct.id
                ? data.product
                : product
          )
      );

      alert(
        "Product updated successfully."
      );

    } else {

      setProducts(
        (currentProducts) => [
          data.product,
          ...currentProducts,
        ]
      );

      alert(
        "Product added successfully."
      );
    }

    // ========================================
    // RESET
    // ========================================

    resetForm();

    setShowForm(false);

  } catch (error) {

    console.error(
      "Save product error:",
      error
    );

    alert(
      error.message ||
        "Something went wrong while saving the product."
    );

  } finally {

    setSaving(false);

  }
};
  // ========================================
  // DELETE PRODUCT
  // ========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete product."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.filter(
          (product) => product.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      alert(error.message);
    }
  };

  // ========================================
  // TOGGLE STATUS
  // ========================================

  const handleToggleStatus = async (product) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/products/${product.id}/status`,
        {
          method: "PATCH",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            is_active: !product.is_active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update product status."
        );
      }

      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === product.id
            ? {
                ...item,
                is_active:
                  data.product.is_active,
              }
            : item
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

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          Loading products...
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>Unable to Load Products</h2>

          <p>{error}</p>

          <button
            onClick={fetchProducts}
            className="admin-retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-page-header">

        <div>
          <h1>Products</h1>

          <p>
            Manage your DreamRest mattresses.
          </p>
        </div>

        <button
  type="button"
  className="admin-add-product-button"
  onClick={() => {
    resetForm();
    setShowForm(true);
  }}
>
  <span className="admin-add-icon">+</span>
  ADD PRODUCT
</button>

      </div>

      {/* PRODUCT FORM */}

      {showForm && (
        <div className="admin-product-form-card">

          <div className="admin-form-header">

            <div>
              <h2>
                {editingProduct
                  ? "Edit Product"
                  : "Add Product"}
              </h2>

              <p>
                {editingProduct
                  ? "Update mattress information."
                  : "Add a new mattress to your store."}
              </p>
            </div>

            <button
  type="button"
  className="admin-form-close-button"
  onClick={resetForm}
  aria-label="Close product form"
  title="Close"
>
  ×
</button>

          </div>

          <form
            onSubmit={handleSubmit}
            className="admin-product-form"
          >

            {/* NAME */}

            <div className="admin-form-group">
              <label>
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. DreamRest Premium Mattress"
                required
              />
            </div>

            {/* DESCRIPTION */}

            <div className="admin-form-group">
              <label>
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the mattress..."
                rows="4"
              />
            </div>

            {/* PRICE / SIZE / STOCK */}

            <div className="admin-form-row">

              <div className="admin-form-group">
                <label>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="20000"
                  min="0"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>
                  Size
                </label>

                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="6 x 6"
                />
              </div>

              <div className="admin-form-group">
  <label htmlFor="stockQuantity">
    Stock Quantity
  </label>

  <input
    id="stockQuantity"
    name="stockQuantity"
    type="number"
    min="0"
    value={formData.stockQuantity}
    onChange={(e) =>
      setFormData((current) => ({
        ...current,
        stockQuantity: e.target.value,
      }))
    }
    placeholder="Enter stock quantity"
  />
</div>

            </div>

            {/* IMAGE */}

<div className="admin-form-group">

  <label className="admin-image-label">
    Product Image
  </label>

  <div className="admin-image-upload-card">

    {!imagePreview ? (

      /* EMPTY STATE */

      <label
        htmlFor="product-image-input"
        className="admin-image-dropzone"
      >

        <div className="admin-upload-icon">
          📷
        </div>

        <strong>
          Upload product image
        </strong>

        <span>
          Click here to select a mattress image
        </span>

        <small>
          JPG, JPEG, PNG or WEBP
        </small>

      </label>

    ) : (

      /* IMAGE PREVIEW */

      <div className="admin-image-preview-wrapper">

        <div className="admin-image-preview">

         <img
  src={imagePreview}
  alt="Product preview"
  style={{
    display: "block",
    width: "220px",
    height: "160px",
    minWidth: "220px",
    maxWidth: "220px",
    minHeight: "160px",
    maxHeight: "160px",
    objectFit: "contain",
    borderRadius: "10px",
    border: "2px solid red",
    background: "#f5f5f5",
  }}
/>
        </div>

        <div className="admin-image-info">

          <div>
            <strong>
              Product image selected
            </strong>

            <span>
              Image ready for upload
            </span>
          </div>

          <label
            htmlFor="product-image-input"
            className="admin-change-image-btn"
          >
            Change Image
          </label>

        </div>

      </div>

    )}

    <input
      id="product-image-input"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      onChange={handleImageChange}
      style={{ display: "none" }}
    />

  </div>

</div>


{/* ACTIVE */}

<div className="admin-form-group">

  <label>

    <input
      type="checkbox"
      name="is_active"
      checked={formData.is_active}
      onChange={handleChange}
    />

    {" "}Product Active

  </label>

</div>
            {/* BUTTONS */}

            <div className="admin-form-actions">

  <button
    type="button"
    className="admin-cancel-button"
    onClick={resetForm}
    disabled={saving}
  >
    Cancel
  </button>

  <button
    type="submit"
    className="admin-submit-button"
    disabled={saving}
  >
    {saving
      ? "Saving..."
      : editingProduct
      ? "Update Product"
      : "Add Product"}
  </button>

</div>

          </form>

        </div>
      )}

      {/* SUMMARY */}

      <div className="admin-product-summary">

        <div className="admin-summary-card">
          <span>Total Products</span>

          <strong>
            {products.length}
          </strong>
        </div>

        <div className="admin-summary-card">
          <span>Active Products</span>

          <strong>
            {
              products.filter(
                (product) =>
                  product.is_active
              ).length
            }
          </strong>
        </div>

        <div className="admin-summary-card">
          <span>Out of Stock</span>

          <strong>
            {
              products.filter(
                (product) =>
                  Number(product.stock) === 0
              ).length
            }
          </strong>
        </div>

      </div>

      {/* TABLE */}

      <div className="admin-table-card">

        <div className="admin-table-header">

          <div>
            <h2>
              All Products
            </h2>

            <p className="admin-products-count">
  <span>{products.length}</span>
  {products.length === 1 ? " product" : " products"} found
</p>
          </div>

        </div>

        {products.length === 0 ? (

          <div className="admin-empty-state">

            <div className="admin-empty-icon">
              🛏️
            </div>

            <h3>
              No Products Found
            </h3>

            <p>
              You haven't added any
              mattresses yet.
            </p>

          </div>

        ) : (

          <div className="admin-table-wrapper">

            <table className="admin-products-table">

              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {products.map((product) => (

                  <tr key={product.id}>

                    {/* PRODUCT */}

                    <td>

                      <div className="admin-product-info">

                        <div className="admin-product-image">
  {product.image_url ? (
    <img
      src={getImageUrl(product.image_url)}
      alt={product.name}
      className="admin-product-thumbnail"
    />
  ) : (
    <div className="admin-product-placeholder">
      🛏️
    </div>
  )}
</div>

                        <div>

                          <strong>
                            {product.name}
                          </strong>

                          <p>
                            {product.description ||
                              "No description"}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* SIZE */}

                    <td>
                      {product.size || "-"}
                    </td>

                    {/* PRICE */}

                    <td>

                      <strong>
                        KSh{" "}
                        {Number(
                          product.price
                        ).toLocaleString()}
                      </strong>

                    </td>

                    {/* STOCK */}

                    <td>

                      <span
                        className={
                          Number(product.stock) ===
                          0
                            ? "stock-empty"
                            : "stock-available"
                        }
                      >
                        {product.stock}
                      </span>

                    </td>

                    {/* STATUS */}

                    <td>

                      <button
                        type="button"
                        className={
                          product.is_active
                            ? "status-active"
                            : "status-inactive"
                        }
                        onClick={() =>
                          handleToggleStatus(
                            product
                          )
                        }
                      >
                        {product.is_active
                          ? "Active"
                          : "Inactive"}
                      </button>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="admin-product-actions">

                        <button
                          type="button"
                          className="admin-edit-button"
                          onClick={() =>
                            handleEdit(product)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() =>
                            handleDelete(
                              product.id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminProducts;