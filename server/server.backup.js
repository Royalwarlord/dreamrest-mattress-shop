import express from "express";
import cors from "cors";
import pool from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";


const app = express();

// ========================================
// FILE UPLOAD CONFIGURATION
// ========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDirectory = path.join(
  __dirname,
  "uploads",
  "products"
);

// Create uploads/products folder if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);

    const filename =
      `product-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, filename);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 25 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, JPEG, PNG and WEBP images are allowed."
        )
      );
    }
  },
});
const PORT = 5000;

const JWT_SECRET =
  process.env.JWT_SECRET || "dreamrest-development-secret";

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);
// ========================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ========================================

function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.admin = decoded;

    next();

  } catch (error) {

    console.error(
      "Admin authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
}

// ========================================
// TEST API
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "DreamRest API is running",
  });
});


// ========================================
// TEST POSTGRESQL CONNECTION
// ========================================

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "PostgreSQL connection successful",
      time: result.rows[0].now,
    });

  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});


// ========================================
// CREATE A NEW ORDER
// ========================================

// ========================================
// CREATE ORDER
// SERVER-CALCULATED PRICE + STOCK
// ========================================

app.post("/api/orders", async (req, res) => {
  const {
    fullName,
    phone,
    email,
    county,
    town,
    address,
    paymentMethod,
    cart,
  } = req.body;

  // ========================================
  // BASIC VALIDATION
  // ========================================

  if (
    !fullName ||
    !phone ||
    !email ||
    !county ||
    !town ||
    !address ||
    !paymentMethod ||
    !Array.isArray(cart) ||
    cart.length === 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required order information.",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let calculatedTotal = 0;
    const verifiedItems = [];

    // ========================================
    // VERIFY PRODUCTS + CALCULATE PRICES
    // ========================================

    for (const item of cart) {
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Invalid product quantity.");
      }

      const productResult = await client.query(
        `
        SELECT
          id,
          name,
          price,
          size,
          stock_quantity,
          is_active
        FROM products
        WHERE id = $1
        FOR UPDATE
        `,
        [item.id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(
          `Product with ID ${item.id} was not found.`
        );
      }

      const product = productResult.rows[0];

      // Check active status
      if (!product.is_active) {
        throw new Error(
          `${product.name} is no longer available.`
        );
      }

      // Check stock
      if (
        Number(product.stock_quantity) < quantity
      ) {
        throw new Error(
          `Not enough stock for ${product.name}. Available stock: ${product.stock_quantity}.`
        );
      }

      // IMPORTANT:
      // Price comes from PostgreSQL, NOT React
      const price = Number(product.price);

      const subtotal = price * quantity;

      calculatedTotal += subtotal;

      verifiedItems.push({
        id: product.id,
        name: product.name,
        size: product.size,
        price,
        quantity,
        subtotal,
      });
    }

    // ========================================
    // CREATE ORDER USING SERVER TOTAL
    // ========================================

    const orderResult = await client.query(
      `
      INSERT INTO orders (
        full_name,
        phone,
        email,
        county,
        town,
        address,
        payment_method,
        total_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, created_at
      `,
      [
        fullName,
        phone,
        email,
        county,
        town,
        address,
        paymentMethod,
        calculatedTotal,
      ]
    );

    const orderId = orderResult.rows[0].id;

    // ========================================
    // CREATE ORDER ITEMS + REDUCE STOCK
    // ========================================

    for (const item of verifiedItems) {
      await client.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          size,
          quantity,
          price,
          subtotal
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          orderId,
          item.id,
          item.name,
          item.size || null,
          item.quantity,
          item.price,
          item.subtotal,
        ]
      );

      await client.query(
        `
        UPDATE products
        SET
          stock_quantity = stock_quantity - $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        `,
        [
          item.quantity,
          item.id,
        ]
      );
    }

    // ========================================
    // COMPLETE TRANSACTION
    // ========================================

    await client.query("COMMIT");

    // ========================================
    // SUCCESS
    // ========================================

    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      orderId,
      totalAmount: calculatedTotal,
      createdAt: orderResult.rows[0].created_at,
    });

  } catch (error) {

    await client.query("ROLLBACK");

    console.error("Order creation error:", error);

    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Failed to create order.",
    });

  } finally {
    client.release();
  }
});


// ========================================
// GET SINGLE ORDER WITH ITEMS
// ========================================

app.get("/api/orders/:orderId", async (req, res) => {

  const { orderId } = req.params;


  try {

    // ========================================
    // GET ORDER
    // ========================================

    const orderResult = await pool.query(
      `
      SELECT
        id,
        full_name,
        phone,
        email,
        county,
        town,
        address,
        payment_method,
        total_amount,
        status,
        created_at
      FROM orders
      WHERE id = $1
      `,
      [orderId]
    );


    // ========================================
    // CHECK ORDER
    // ========================================

    if (orderResult.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });

    }


    const order = orderResult.rows[0];


    // ========================================
    // GET ORDER ITEMS
    // ========================================

    const itemsResult = await pool.query(
      `
      SELECT
        id,
        product_id,
        product_name,
        size,
        quantity,
        price,
        subtotal
      FROM order_items
      WHERE order_id = $1
      ORDER BY id ASC
      `,
      [orderId]
    );


    // ========================================
    // RETURN ORDER
    // ========================================

    res.json({
      success: true,

      order: {
        ...order,
        items: itemsResult.rows,
      },
    });


  } catch (error) {

    console.error("Get order error:", error);


    res.status(500).json({
      success: false,
      message: "Failed to retrieve order.",
    });

  }

});


// ========================================
// GET ALL ORDERS - ADMIN
// ========================================

app.get(
  "/api/admin/orders",
  authenticateAdmin,
  async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        id,
        full_name,
        phone,
        email,
        county,
        town,
        address,
        payment_method,
        total_amount,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      `
    );


    res.json({
      success: true,
      orders: result.rows,
    });


  } catch (error) {

    console.error("Get admin orders error:", error);


    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders.",
    });

  }

});


// ========================================
// UPDATE ORDER STATUS - ADMIN
// ========================================

app.patch("/api/admin/orders/:orderId/status", async (req, res) => {

  const { orderId } = req.params;
  const { status } = req.body;


  // ========================================
  // ALLOWED STATUSES
  // ========================================

  const allowedStatuses = [
    "Processing",
    "Confirmed",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];


  // ========================================
  // VALIDATE STATUS
  // ========================================

  if (!allowedStatuses.includes(status)) {

    return res.status(400).json({
      success: false,
      message: "Invalid order status.",
    });

  }


  try {

    // ========================================
    // UPDATE STATUS
    // ========================================

    const result = await pool.query(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING
        id,
        status
      `,
      [status, orderId]
    );


    // ========================================
    // CHECK ORDER
    // ========================================

    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });

    }


    // ========================================
    // RESPONSE
    // ========================================

    res.json({
      success: true,
      message: "Order status updated successfully.",
      order: result.rows[0],
    });


  } catch (error) {

    console.error("Update order status error:", error);


    res.status(500).json({
      success: false,
      message: "Failed to update order status.",
    });

  }

});


// ========================================
// ADMIN DASHBOARD STATISTICS
// ========================================

app.get(
  "/api/admin/dashboard",
  authenticateAdmin,
  async (req, res) => {
  try {
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) AS total_orders,

        COUNT(*) FILTER (
          WHERE LOWER(status) = 'processing'
        ) AS processing_orders,

        COUNT(*) FILTER (
          WHERE LOWER(status) = 'confirmed'
        ) AS confirmed_orders,

        COUNT(*) FILTER (
          WHERE LOWER(status) = 'out for delivery'
        ) AS delivery_orders,

        COUNT(*) FILTER (
          WHERE LOWER(status) = 'delivered'
        ) AS delivered_orders,

        COUNT(*) FILTER (
          WHERE LOWER(status) = 'cancelled'
        ) AS cancelled_orders,

        COALESCE(SUM(total_amount), 0) AS total_revenue

      FROM orders
    `);

    const recentOrdersResult = await pool.query(`
      SELECT
        id,
        full_name,
        total_amount,
        payment_method,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      statistics: statsResult.rows[0],
      recentOrders: recentOrdersResult.rows,
    });

  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard.",
    });
  }
});


// ========================================
// ADMIN LOGIN
// ========================================

app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    // Find admin
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        password_hash,
        role
      FROM admins
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [email.trim()]
    );

    // Admin does not exist
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const admin = result.rows[0];

    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    // Successful login
    res.json({
      success: true,
      message: "Login successful.",
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
});


// ========================================
// GET ALL PRODUCTS
// ========================================

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        description,
        price,
        size,
        material,
        stock_quantity,
        image_url,
        category,
        is_active,
        created_at,
        updated_at
      FROM products
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      products: result.rows,
    });

  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve products.",
    });
  }
});

// ========================================
// GET ALL PRODUCTS - ADMIN
// ========================================

// ========================================
// GET ALL PRODUCTS - ADMIN
// ========================================

app.post("/api/admin/products", async (req, res) => {
  const {
    name,
    description,
    price,
    size,
    material,
    stock_quantity,
    image_url,
    category,
    is_active,
  } = req.body;

  console.log("====================================");
  console.log("CREATE PRODUCT");
  console.log("Name:", name);
  console.log("Stock Quantity:", stock_quantity);
  console.log("Image URL:", image_url);
  console.log("====================================");

  try {
    const result = await pool.query(
      `
      INSERT INTO products
      (
        name,
        description,
        price,
        size,
        material,
        stock_quantity,
        image_url,
        category,
        is_active
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)

      RETURNING
        id,
        name,
        description,
        price,
        size,
        material,
        stock_quantity,
        image_url,
        category,
        is_active,
        created_at,
        updated_at
      `,
      [
        name,
        description || null,
        price,
        size || null,
        material || null,
        Number(stock_quantity) || 0,
        image_url || null,
        category || "Mattress",
        is_active !== undefined ? is_active : true,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product: result.rows[0],
    });

  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create product.",
      error: error.message,
    });
  }
});
// ========================================
// CREATE PRODUCT - ADMIN
// ========================================

app.post(
  "/api/admin/products",
  authenticateAdmin,
  async (req, res) => {

    const {
      name,
      description,
      price,
      size,
      material,
      stockQuantity,
      imageUrl,
      category,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product name and price are required.",
      });
    }

    try {

      const result = await pool.query(
        `
        INSERT INTO products (
          name,
          description,
          price,
          size,
          material,
          stock_quantity,
          image_url,
          category
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
          name,
          description || null,
          price,
          size || null,
          material || null,
          stockQuantity || 0,
          imageUrl || null,
          category || "Mattress",
        ]
      );

      res.status(201).json({
        success: true,
        message: "Product created successfully.",
        product: result.rows[0],
      });

    } catch (error) {

      console.error("Create product error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to create product.",
      });
    }
  }
);

// ========================================
// DELETE PRODUCT - ADMIN
// ========================================

// ========================================
// DELETE PRODUCT - ADMIN
// ========================================

// ========================================
// DELETE PRODUCT - ADMIN
// ========================================

app.delete(
  "/api/admin/products/:id",
  authenticateAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        `
        DELETE FROM products
        WHERE id = $1
        RETURNING id, name
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      res.json({
        success: true,
        message: "Product deleted successfully.",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("Delete product error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to delete product.",
      });
    }
  }
);

// ========================================
// UPDATE PRODUCT - ADMIN
// ========================================

// ========================================
// UPDATE PRODUCT - ADMIN
// ========================================

app.put(
  "/api/admin/products/:id",
  authenticateAdmin,
  async (req, res) => {
    const { id } = req.params;

    const {
      name,
      description,
      price,
      size,
      material,
      stockQuantity,
      imageUrl,
      category,
      isActive,
    } = req.body;

    // Validate required fields
    if (!name || price === undefined || price === null || price === "") {
      return res.status(400).json({
        success: false,
        message: "Product name and price are required.",
      });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stockQuantity ?? 0);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid positive number.",
      });
    }

    if (Number.isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock quantity must be a valid number.",
      });
    }

    try {
      const result = await pool.query(
        `
        UPDATE products
        SET
          name = $1,
          description = $2,
          price = $3,
          size = $4,
          material = $5,
          stock_quantity = $6,
          image_url = $7,
          category = $8,
          is_active = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING
          id,
          name,
          description,
          price,
          size,
          material,
          stock_quantity,
          image_url,
          category,
          is_active,
          created_at,
          updated_at
        `,
        [
          name.trim(),
          description || null,
          numericPrice,
          size || null,
          material || null,
          numericStock,
          imageUrl || null,
          category || "Mattress",
          isActive !== undefined ? Boolean(isActive) : true,
          id,
        ]
      );

      // Product doesn't exist
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      res.json({
        success: true,
        message: "Product updated successfully.",
        product: result.rows[0],
      });
    } catch (error) {
      console.error("Update product error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to update product.",
      });
    }
  }
);

// ========================================
// GET SINGLE PRODUCT
// ========================================

app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        price,
        size,
        material,
        stock_quantity,
        image_url,
        category,
        is_active
      FROM products
      WHERE id = $1
        AND is_active = TRUE
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      product: result.rows[0],
    });

  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve product.",
    });
  }
});

// ========================================
// ADMIN DASHBOARD
// ========================================

app.get("/api/admin/dashboard", async (req, res) => {
  try {
    // Total orders
    const totalOrdersResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM orders
    `);

    // Pending orders
    const pendingOrdersResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM orders
      WHERE status = 'pending'
    `);

    // Processing orders
    const processingOrdersResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM orders
      WHERE status = 'processing'
    `);

    // Delivered orders
    const deliveredOrdersResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM orders
      WHERE status = 'delivered'
    `);

    // Total sales
    const totalSalesResult = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS total
      FROM orders
      WHERE status != 'cancelled'
    `);

    // Recent orders
    const recentOrdersResult = await pool.query(`
      SELECT
        id,
        full_name,
        total_amount,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,

      statistics: {
        totalOrders:
          Number(totalOrdersResult.rows[0].total),

        pendingOrders:
          Number(pendingOrdersResult.rows[0].total),

        processingOrders:
          Number(processingOrdersResult.rows[0].total),

        deliveredOrders:
          Number(deliveredOrdersResult.rows[0].total),

        totalSales:
          Number(totalSalesResult.rows[0].total),
      },

      recentOrders:
        recentOrdersResult.rows,
    });

  } catch (error) {

    console.error(
      "Admin dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard.",
    });
  }
});

// ========================================
// ADMIN PRODUCTS
// ========================================

// GET ALL PRODUCTS
app.get("/api/admin/products", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        description,
        price,
        size,
        stock,
        image_url,
        is_active
      FROM products
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      products: result.rows,
    });

  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve products.",
    });
  }
});


// GET SINGLE PRODUCT
app.get("/api/admin/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        price,
        size,
        stock,
        image_url,
        is_active
      FROM products
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      product: result.rows[0],
    });

  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve product.",
    });
  }
});

app.post(
  "/api/admin/products/upload-image",
  authenticateAdmin,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image was uploaded.",
        });
      }

      const imageUrl =
        `/uploads/products/${req.file.filename}`;

      res.json({
        success: true,
        message: "Image uploaded successfully.",
        imageUrl,
      });

    } catch (error) {
      console.error("Image upload error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to upload image.",
      });
    }
  }
);


// CREATE PRODUCT
app.post("/api/admin/products", async (req, res) => {
 const {
  name,
  description,
  price,
  size,
  material,
  stock_quantity,
  image_url,
  category,
  is_active,
} = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({
      success: false,
      message: "Product name and price are required.",
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO products (
  name,
  description,
  price,
  size,
  material,
  stock_quantity,
  image_url,
  category,
  is_active
)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        name,
        description,
        price,
        size,
        stock,
        image_url,
        is_active
      `,
      [
  name,
  description || null,
  price,
  size || null,
  material || null,
  Number(stock_quantity) || 0,
  image_url || null,
  category || "Mattress",
  is_active !== undefined ? is_active : true,
]
    );

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product: result.rows[0],
    });

  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create product.",
    });
  }
});


// UPDATE PRODUCT
app.put("/api/admin/products/:id", async (req, res) => {
  const { id } = req.params;

  const {
    name,
    description,
    price,
    size,
    material,
    stock_quantity,
    image_url,
    category,
    is_active,
  } = req.body;

  console.log("====================================");
  console.log("UPDATE PRODUCT");
  console.log("Product ID:", id);
  console.log("Name:", name);
  console.log("Stock Quantity:", stock_quantity);
  console.log("Image URL:", image_url);
  console.log("====================================");

  if (!name || price === undefined) {
    return res.status(400).json({
      success: false,
      message: "Product name and price are required.",
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE products
      SET
        name = $1,
        description = $2,
        price = $3,
        size = $4,
        material = $5,
        stock_quantity = $6,
        image_url = $7,
        category = $8,
        is_active = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10

      RETURNING
        id,
        name,
        description,
        price,
        size,
        material,
        stock_quantity,
        image_url,
        category,
        is_active,
        created_at,
        updated_at
      `,
      [
        name,
        description || null,
        price,
        size || null,
        material || null,
        Number(stock_quantity) || 0,
        image_url || null,
        category || "Mattress",
        is_active !== undefined ? is_active : true,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    console.log("UPDATED PRODUCT:", result.rows[0]);

    res.json({
      success: true,
      message: "Product updated successfully.",
      product: result.rows[0],
    });

  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product.",
      error: error.message,
    });
  }
});
// DELETE PRODUCT
app.delete("/api/admin/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      message: "Product deleted successfully.",
    });

  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
});


// CHANGE PRODUCT STATUS
// ========================================
// CHANGE PRODUCT STATUS - ADMIN
// ========================================

app.patch(
  "/api/admin/products/:id/status",
  authenticateAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;

    try {
      const result = await pool.query(
        `
        UPDATE products
        SET is_active = $1
        WHERE id = $2
        RETURNING
          id,
          name,
          is_active
        `,
        [is_active, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }

      res.json({
        success: true,
        message: "Product status updated successfully.",
        product: result.rows[0],
      });

    } catch (error) {
      console.error(
        "Update product status error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to update product status.",
      });
    }
  }
);

// ========================================
// UPLOAD PRODUCT IMAGE
// ========================================

app.post(
  "/api/admin/products/upload-image",
  authenticateAdmin,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image was uploaded.",
        });
      }

      const imageUrl =
        `/uploads/products/${req.file.filename}`;

      console.log(
        "Product image uploaded:",
        imageUrl
      );

      res.status(201).json({
        success: true,
        message: "Image uploaded successfully.",
        imageUrl,
      });

    } catch (error) {
      console.error(
        "Product image upload error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to upload product image.",
      });
    }
  }
);

// ========================================
// START SERVER
// ========================================


app.listen(PORT, () => {

  console.log(
    `DreamRest server running on http://localhost:${PORT}`
  );

});