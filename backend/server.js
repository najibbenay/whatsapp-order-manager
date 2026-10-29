require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in backend/.env");
}

if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL is missing in backend/.env");
}

const allowedOrigins = process.env.FRONTEND_URL
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.disable("x-powered-by");

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "100kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Please try again later.",
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many registration attempts. Please try again later.",
  },
});

const db = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});

const statuses = [
  "New",
  "Confirmed",
  "Preparing",
  "Ready",
  "Delivered",
  "Cancelled",
];

const defaultMessage =
  "Bonjour {customer}, merci pour votre commande #{order_id}. Produit : {product}. Quantité : {quantity}. Total : {total}.";

function createToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
      algorithm: "HS256",
    }
  );
}

function validId(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    typeof value === "boolean"
  ) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null;
}

function validateOrder(body) {
  const {
    customer,
    phone,
    product,
    product_id = null,
    quantity,
    price,
    address,
  } = body || {};

  const qty = Number(quantity);
  const unitPrice = Number(price);
  const cleanPhone = String(phone || "").replace(/\D/g, "");

  const productId =
    product_id === null ||
    product_id === undefined ||
    product_id === ""
      ? null
      : validId(product_id);

  const total =
    Math.round(qty * unitPrice * 100) / 100;

  if (
    typeof customer !== "string" ||
    !customer.trim() ||
    customer.trim().length > 200 ||
    typeof product !== "string" ||
    !product.trim() ||
    product.trim().length > 200 ||
    !/^[1-9]\d{7,14}$/.test(cleanPhone) ||
    (product_id != null &&
      product_id !== "" &&
      !productId) ||
    quantity == null ||
    quantity === "" ||
    !Number.isSafeInteger(qty) ||
    qty <= 0 ||
    price == null ||
    price === "" ||
    !Number.isFinite(unitPrice) ||
    unitPrice < 0 ||
    unitPrice > 9999999999 ||
    !Number.isFinite(total) ||
    total > 9999999999 ||
    (address != null &&
      typeof address !== "string") ||
    (typeof address === "string" &&
      address.length > 2000)
  ) {
    return null;
  }

  return {
    customer: customer.trim(),
    phone: cleanPhone,
    product: product.trim(),
    product_id: productId,
    quantity: qty,
    price: unitPrice,
    total,
    address: (address || "").trim(),
  };
}

function validateProduct(body) {
  const {
    name,
    description = "",
    category = "",
    price,
    stock = 0,
    image_url = "",
    is_active = true,
  } = body || {};

  const productPrice = Number(price);
  const productStock = Number(stock);

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 200 ||
    typeof description !== "string" ||
    description.length > 5000 ||
    typeof category !== "string" ||
    category.length > 100 ||
    price == null ||
    price === "" ||
    !Number.isFinite(productPrice) ||
    productPrice < 0 ||
    productPrice > 9999999999.99 ||
    stock == null ||
    stock === "" ||
    !Number.isSafeInteger(productStock) ||
    productStock < 0 ||
    typeof image_url !== "string" ||
    image_url.length > 2000 ||
    typeof is_active !== "boolean"
  ) {
    return null;
  }

  return {
    name: name.trim(),
    description: description.trim(),
    category: category.trim(),
    price: productPrice,
    stock: productStock,
    image_url: image_url.trim(),
    is_active,
  };
}

class StockError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "StockError";
    this.status = status;
  }
}

async function lockProduct(client, storeId, productId) {
  const result = await client.query(
    `SELECT id, name, price, stock, is_active
     FROM products
     WHERE id = $1
       AND store_id = $2
     FOR UPDATE`,
    [productId, storeId]
  );

  if (!result.rows.length) {
    throw new StockError("Product not found", 404);
  }

  return result.rows[0];
}

async function changeStock(client, storeId, productId, delta) {
  if (!productId || delta === 0) {
    return;
  }

  const product = await lockProduct(
    client,
    storeId,
    productId
  );

  if (delta < 0 && !product.is_active) {
    throw new StockError("Product is inactive", 409);
  }

  const newStock = Number(product.stock) + delta;

  if (
    !Number.isSafeInteger(newStock) ||
    newStock < 0
  ) {
    throw new StockError(
      `Insufficient stock for ${product.name}. Available: ${product.stock}`,
      409
    );
  }

  await client.query(
    `UPDATE products
     SET stock = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
       AND store_id = $3`,
    [newStock, productId, storeId]
  );
}

function handleOrderError(res, error, action) {
  if (error instanceof StockError) {
    return res.status(error.status).json({
      error: error.message,
    });
  }

  console.error(`${action} error:`, error);

  return res.status(500).json({
    error: `Failed to ${action.toLowerCase()}`,
  });
}

async function rollbackQuietly(client) {
  if (!client) return;

  try {
    await client.query("ROLLBACK");
  } catch (error) {
    console.error("Rollback error:", error);
  }
}

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      status: "OK",
      database: "Connected",
    });
  } catch (error) {
    console.error("Health error:", error);

    res.status(503).json({
      status: "ERROR",
      database: "Disconnected",
    });
  }
});

app.post(
  "/api/auth/register",
  registerLimiter,
  async (req, res) => {
    const {
      name,
      email,
      password,
      storeName,
    } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 150 ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      email.trim().length > 255 ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128 ||
      typeof storeName !== "string" ||
      !storeName.trim() ||
      storeName.trim().length > 150
    ) {
      return res.status(400).json({
        error: "Invalid registration information",
      });
    }

    let client;

    try {
      const normalizedEmail =
        email.trim().toLowerCase();

      const passwordHash =
        await bcrypt.hash(password, 12);

      client = await db.connect();
      await client.query("BEGIN");

      const userResult = await client.query(
        `INSERT INTO users (
          name,
          email,
          password_hash
        )
        VALUES ($1, $2, $3)
        RETURNING id, name, email`,
        [
          name.trim(),
          normalizedEmail,
          passwordHash,
        ]
      );

      const user = userResult.rows[0];

      const storeResult = await client.query(
        `INSERT INTO stores (
          owner_id,
          name
        )
        VALUES ($1, $2)
        RETURNING id, name`,
        [user.id, storeName.trim()]
      );

      const store = storeResult.rows[0];

      await client.query(
        `INSERT INTO settings (
          store_id,
          store_name,
          store_phone,
          store_email,
          store_address,
          whatsapp_message
        )
        VALUES ($1, $2, '', '', '', $3)`,
        [
          store.id,
          store.name,
          defaultMessage,
        ]
      );

      await client.query("COMMIT");

      res.status(201).json({
        message: "Account created successfully",
        token: createToken(user.id),
        user,
        store,
      });
    } catch (error) {
      await rollbackQuietly(client);

      if (error.code === "23505") {
        return res.status(409).json({
          error: "Email already registered",
        });
      }

      console.error("Register error:", error);

      res.status(500).json({
        error: "Registration failed",
      });
    } finally {
      if (client) client.release();
    }
  }
);

app.post(
  "/api/auth/login",
  authLimiter,
  async (req, res) => {
    try {
      const { email, password } = req.body || {};

      if (
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password
      ) {
        return res.status(400).json({
          error: "Email and password are required",
        });
      }

      const result = await db.query(
        `SELECT id, name, email, password_hash
         FROM users
         WHERE LOWER(email) = $1`,
        [email.trim().toLowerCase()]
      );

      const user = result.rows[0];

      const validPassword = user
        ? await bcrypt.compare(
            password,
            user.password_hash
          )
        : false;

      if (!validPassword) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      const storeResult = await db.query(
        `SELECT s.id,
                COALESCE(st.store_name, s.name) AS name
         FROM stores s
         LEFT JOIN settings st ON st.store_id = s.id
         WHERE s.owner_id = $1
         ORDER BY s.id ASC
         LIMIT 1`,
        [user.id]
      );

      const store = storeResult.rows[0];

      if (!store) {
        return res.status(403).json({
          error: "No store assigned to this account",
        });
      }

      res.json({
        message: "Login successful",
        token: createToken(user.id),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        store,
      });
    } catch (error) {
      console.error("Login error:", error);

      res.status(500).json({
        error: "Login failed",
      });
    }
  }
);

function authenticate(req, res, next) {
  const authorization =
    req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  try {
    const token = authorization.slice(7);

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    const userId = validId(payload.userId);

    if (!userId) {
      return res.status(401).json({
        error: "Invalid token",
      });
    }

    req.userId = userId;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}

app.get(
  "/api/auth/me",
  authenticate,
  async (req, res) => {
    try {
      const result = await db.query(
        `SELECT id, name, email
         FROM users
         WHERE id = $1`,
        [req.userId]
      );

      if (!result.rows.length) {
        return res.status(401).json({
          error: "User not found",
        });
      }

      const storeResult = await db.query(
        `SELECT s.id,
                COALESCE(st.store_name, s.name) AS name
         FROM stores s
         LEFT JOIN settings st ON st.store_id = s.id
         WHERE s.owner_id = $1
         ORDER BY s.id ASC
         LIMIT 1`,
        [req.userId]
      );

      const store = storeResult.rows[0];

      if (!store) {
        return res.status(403).json({
          error: "Store access denied",
        });
      }

      res.json({
        user: result.rows[0],
        store,
      });
    } catch (error) {
      console.error("Current user error:", error);

      res.status(500).json({
        error: "Failed to load user",
      });
    }
  }
);

async function requireStore(req, res, next) {
  try {
    const result = await db.query(
      `SELECT id
       FROM stores
       WHERE owner_id = $1
       ORDER BY id ASC
       LIMIT 1`,
      [req.userId]
    );

    if (!result.rows.length) {
      return res.status(403).json({
        error: "Store access denied",
      });
    }

    req.storeId = result.rows[0].id;
    next();
  } catch (error) {
    console.error("Store authorization error:", error);

    res.status(500).json({
      error: "Failed to verify store access",
    });
  }
}

app.use("/api/orders", authenticate, requireStore);
app.use("/api/settings", authenticate, requireStore);
app.use("/api/products", authenticate, requireStore);

app.get("/api/orders", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM orders
       WHERE store_id = $1
       ORDER BY created_at DESC, id DESC`,
      [req.storeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      error: "Failed to load orders",
    });
  }
});

app.post("/api/orders", async (req, res) => {
  const order = validateOrder(req.body);

  if (!order) {
    return res.status(400).json({
      error: "Invalid order data",
    });
  }

  let client;

  try {
    client = await db.connect();
    await client.query("BEGIN");

    let productName = order.product;
    let productPrice = order.price;

    if (order.product_id) {
      const product = await lockProduct(
        client,
        req.storeId,
        order.product_id
      );

      if (!product.is_active) {
        throw new StockError("Product is inactive", 409);
      }

      if (Number(product.stock) < order.quantity) {
        throw new StockError(
          `Insufficient stock for ${product.name}. Available: ${product.stock}`,
          409
        );
      }

      await changeStock(
        client,
        req.storeId,
        order.product_id,
        -order.quantity
      );

      productName = product.name;
      productPrice = Number(product.price);
    }

    const total =
      Math.round(order.quantity * productPrice * 100) / 100;

    if (!Number.isFinite(total) || total > 9999999999) {
      throw new StockError("Order total is too large", 400);
    }

    const result = await client.query(
      `INSERT INTO orders (
        store_id,
        customer,
        phone,
        product,
        product_id,
        quantity,
        price,
        total,
        address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        req.storeId,
        order.customer,
        order.phone,
        productName,
        order.product_id,
        order.quantity,
        productPrice,
        total,
        order.address,
      ]
    );

    await client.query("COMMIT");

    res.status(201).json(result.rows[0]);
  } catch (error) {
    await rollbackQuietly(client);
    handleOrderError(res, error, "Create order");
  } finally {
    if (client) client.release();
  }
});

app.patch(
  "/api/orders/:id/status",
  async (req, res) => {
    const id = validId(req.params.id);
    const newStatus = req.body?.status;

    if (!id) {
      return res.status(400).json({
        error: "Invalid order ID",
      });
    }

    if (!statuses.includes(newStatus)) {
      return res.status(400).json({
        error: "Invalid status",
      });
    }

    let client;

    try {
      client = await db.connect();
      await client.query("BEGIN");

      const result = await client.query(
        `SELECT *
         FROM orders
         WHERE id = $1
           AND store_id = $2
         FOR UPDATE`,
        [id, req.storeId]
      );

      if (!result.rows.length) {
        throw new StockError("Order not found", 404);
      }

      const order = result.rows[0];

      if (order.product_id) {
        if (
          order.status !== "Cancelled" &&
          newStatus === "Cancelled"
        ) {
          await changeStock(
            client,
            req.storeId,
            order.product_id,
            Number(order.quantity)
          );
        }

        if (
          order.status === "Cancelled" &&
          newStatus !== "Cancelled"
        ) {
          await changeStock(
            client,
            req.storeId,
            order.product_id,
            -Number(order.quantity)
          );
        }
      }

      const updated = await client.query(
        `UPDATE orders
         SET status = $1
         WHERE id = $2
           AND store_id = $3
         RETURNING *`,
        [newStatus, id, req.storeId]
      );

      await client.query("COMMIT");

      res.json(updated.rows[0]);
    } catch (error) {
      await rollbackQuietly(client);
      handleOrderError(res, error, "Update order status");
    } finally {
      if (client) client.release();
    }
  }
);

app.put("/api/orders/:id", async (req, res) => {
  const id = validId(req.params.id);
  const data = validateOrder(req.body);

  if (!id) {
    return res.status(400).json({
      error: "Invalid order ID",
    });
  }

  if (!data) {
    return res.status(400).json({
      error: "Invalid order data",
    });
  }

  let client;

  try {
    client = await db.connect();
    await client.query("BEGIN");

    const existingResult = await client.query(
      `SELECT *
       FROM orders
       WHERE id = $1
         AND store_id = $2
       FOR UPDATE`,
      [id, req.storeId]
    );

    if (!existingResult.rows.length) {
      throw new StockError("Order not found", 404);
    }

    const oldOrder = existingResult.rows[0];

    const hasProductId =
      Object.prototype.hasOwnProperty.call(
        req.body || {},
        "product_id"
      );

    const newProductId = hasProductId
      ? data.product_id
      : oldOrder.product_id;

    const oldProductId = oldOrder.product_id;

    const isCancelled =
      oldOrder.status === "Cancelled";

    const oldQuantity = Number(oldOrder.quantity);

    if (!isCancelled) {
      if (oldProductId === newProductId) {
        if (newProductId) {
          await changeStock(
            client,
            req.storeId,
            newProductId,
            oldQuantity - data.quantity
          );
        }
      } else {
        const ids = [
          oldProductId,
          newProductId,
        ]
          .filter(Boolean)
          .map(Number)
          .sort((a, b) => a - b);

        for (const productId of ids) {
          await lockProduct(
            client,
            req.storeId,
            productId
          );
        }

        if (oldProductId) {
          await changeStock(
            client,
            req.storeId,
            oldProductId,
            oldQuantity
          );
        }

        if (newProductId) {
          await changeStock(
            client,
            req.storeId,
            newProductId,
            -data.quantity
          );
        }
      }
    }

    let productName = data.product;
    let productPrice = data.price;

    if (newProductId) {
      const product = await lockProduct(
        client,
        req.storeId,
        newProductId
      );

      productName = product.name;

      if (oldProductId === newProductId) {
        productPrice = Number(oldOrder.price);
      } else {
        productPrice = Number(product.price);
      }
    }

    const total =
      Math.round(data.quantity * productPrice * 100) / 100;

    if (!Number.isFinite(total) || total > 9999999999) {
      throw new StockError("Order total is too large", 400);
    }

    const updated = await client.query(
      `UPDATE orders
       SET customer = $1,
           phone = $2,
           product = $3,
           product_id = $4,
           quantity = $5,
           price = $6,
           total = $7,
           address = $8
       WHERE id = $9
         AND store_id = $10
       RETURNING *`,
      [
        data.customer, data.phone,productName, newProductId, data.quantity,
       productPrice,total,data.address, id,req.storeId, 
      ]
    );

    await client.query("COMMIT");

    res.json(updated.rows[0]);
  } catch (error) {
    await rollbackQuietly(client);
    handleOrderError(res, error, "Update order");
  } finally {
    if (client) client.release();
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  const id = validId(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: "Invalid order ID",
    });
  }

  let client;

  try {
    client = await db.connect();
    await client.query("BEGIN");

    const result = await client.query(
      `SELECT *
       FROM orders
       WHERE id = $1
         AND store_id = $2
       FOR UPDATE`,
      [id, req.storeId]
    );

    if (!result.rows.length) {
      throw new StockError("Order not found", 404);
    }

    const order = result.rows[0];

    if (
      order.product_id &&
      order.status !== "Cancelled"
    ) {
      await changeStock(
        client,
        req.storeId,
        order.product_id,
        Number(order.quantity)
      );
    }

    await client.query(
      `DELETE FROM orders
       WHERE id = $1
         AND store_id = $2`,
      [id, req.storeId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Order deleted",
    });
  } catch (error) {
    await rollbackQuietly(client);
    handleOrderError(res, error, "Delete order");
  } finally {
    if (client) client.release();
  }
});

app.get("/api/settings", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM settings
       WHERE store_id = $1`,
      [req.storeId]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        error: "Settings not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get settings error:", error);

    res.status(500).json({
      error: "Failed to load settings",
    });
  }
});

app.put("/api/settings", async (req, res) => {
  const {
    store_name,
    store_phone,
    store_email,
    store_address,
    whatsapp_message,
  } = req.body || {};

  if (
    typeof store_name !== "string" ||
    !store_name.trim() ||
    store_name.trim().length > 150 ||
    typeof store_phone !== "string" ||
    store_phone.length > 30 ||
    typeof store_email !== "string" ||
    store_email.length > 150 ||
    typeof store_address !== "string" ||
    typeof whatsapp_message !== "string" ||
    !whatsapp_message.trim()
  ) {
    return res.status(400).json({
      error: "Invalid settings data",
    });
  }

  let client;

  try {
    client = await db.connect();
    await client.query("BEGIN");

    const result = await client.query(
      `UPDATE settings
       SET store_name = $1,
           store_phone = $2,
           store_email = $3,
           store_address = $4,
           whatsapp_message = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE store_id = $6
       RETURNING *`,
      [
        store_name.trim(), store_phone.trim(),store_email.trim(),
        store_address.trim(), whatsapp_message.trim(),
        req.storeId,
      ]
    );

    if (!result.rows.length) {
      throw new StockError("Settings not found", 404);
    }

    await client.query(
      `UPDATE stores
       SET name = $1
       WHERE id = $2`,
      [store_name.trim(), req.storeId]
    );

    await client.query("COMMIT");

    res.json(result.rows[0]);
  } catch (error) {
    await rollbackQuietly(client);

    handleOrderError(res, error, "Update settings");
  } finally {
    if (client) client.release();
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await db.query(
      `SELECT *
       FROM products
       WHERE store_id = $1
       ORDER BY created_at DESC, id DESC`,
      [req.storeId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      error: "Failed to load products",
    });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const product = validateProduct(req.body);

    if (!product) {
      return res.status(400).json({
        error: "Invalid product data",
      });
    }

    const result = await db.query(
      `INSERT INTO products (
        store_id,
        name,
        description,
        category,
        price,
        stock,
        image_url,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        req.storeId,product.name,product.description,product.category,
        product.price, product.stock,product.image_url,product.is_active,   
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      error: "Failed to create product",
    });
  }
});

app.put("/api/products/:id", async (req, res) => {
  const id = validId(req.params.id);
  const product = validateProduct(req.body);

  if (!id) {
    return res.status(400).json({
      error: "Invalid product ID",
    });
  }

  if (!product) {
    return res.status(400).json({
      error: "Invalid product data",
    });
  }

  let client;

  try {
    client = await db.connect();
    await client.query("BEGIN");

    const existing = await lockProduct(
      client,
      req.storeId,
      id
    );

    const result = await client.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           category = $3,
           price = $4,
           stock = $5,
           image_url = $6,
           is_active = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
         AND store_id = $9
       RETURNING *`,
      [
        product.name,product.description,product.category, product.price,
        product.stock,product.image_url, product.is_active, id,req.storeId,   
      ]
    );
    await client.query("COMMIT");

    res.json(result.rows[0]);
  } catch (error) {
    await rollbackQuietly(client);

    if (error instanceof StockError) {
      return res.status(error.status).json({
        error: error.message,
      });
    }

    console.error("Update product error:", error);

    res.status(500).json({
      error: "Failed to update product",
    });
  } finally {
    if (client) client.release();
  }
});

app.delete("/api/products/:id", async (req, res) => {
  const id = validId(req.params.id);

  if (!id) {
    return res.status(400).json({
      error: "Invalid product ID",
    });
  }

  let client;

  try {
    client = await db.connect();
    await client.query("BEGIN");

    await lockProduct(client, req.storeId, id);

    const referencedOrders = await client.query(
      `SELECT id
       FROM orders
       WHERE product_id = $1
         AND store_id = $2
       LIMIT 1`,
      [id, req.storeId]
    );

    if (referencedOrders.rows.length) {
      throw new StockError(
        "This product is linked to existing orders. Deactivate it instead of deleting it.",
        409
      );
    }

    await client.query(
      `DELETE FROM products
       WHERE id = $1
         AND store_id = $2`,
      [id, req.storeId]
    );

    await client.query("COMMIT");

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    await rollbackQuietly(client);

    if (error instanceof StockError) {
      return res.status(error.status).json({
        error: error.message,
      });
    }

    console.error("Delete product error:", error);

    res.status(500).json({
      error: "Failed to delete product",
    });
  } finally {
    if (client) client.release();
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "API route not found",
  });
});

app.use((error, req, res, next) => {
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      error: "Request body too large",
    });
  }

  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      error: "Invalid JSON body",
    });
  }

  if (error.message === "CORS origin not allowed") {
    return res.status(403).json({
      error: "Origin not allowed",
    });
  }

  console.error("Unhandled API error:", error);

  return res.status(500).json({
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
});