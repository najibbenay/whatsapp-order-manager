import { useEffect, useState } from "react";
import {
  ShoppingBag,
  Clock3,
  CheckCircle2,
  Wallet,
  Plus,
  Search,
  MessageCircle,
  Trash2,
  Pencil,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import QuantumBackground from "./components/QuantumBackground";

import Analytics from "./pages/Analytics";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import Products from "./pages/Products";

import {
  getOrders,
  createOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrderById,
  getSettings,
  getProducts,
} from "./services/api";

const initialForm = {
  customer: "",
  phone: "",
  product: "",
  quantity: 1,
  price: "",
  address: "",
};

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

const money = (value) =>
  `${Number(value || 0).toFixed(2)} MAD`;

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-[#080D1F]/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-[#22D3EE]/60 focus:ring-2 focus:ring-[#7C3AED]/20 disabled:cursor-not-allowed disabled:opacity-60";

const formFields = [
  ["customer", "Customer Name", "text"],
  ["phone", "WhatsApp Number", "tel"],
  ["product", "Product", "text"],
  ["quantity", "Quantity", "number"],
  ["price", "Unit Price (MAD)", "number"],
  ["address", "Delivery Address", "text"],
];

export default function App({
  user = null,
  onLogout,
}) {

  const [currentUser, setCurrentUser] =
    useState(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [products, setProducts] = useState([]);

  const [
    selectedProductId,
    setSelectedProductId,
  ] = useState("");

  const [
    editSelectedProductId,
    setEditSelectedProductId,
  ] = useState("");

  const [
    productsLoading,
    setProductsLoading,
  ] = useState(false);

  const [activePage, setActivePage] =
    useState("Dashboard");

  const [collapsed, setCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const [showForm, setShowForm] =
    useState(false);

  const [form, setForm] = useState({
    ...initialForm,
  });

  const [saving, setSaving] =
    useState(false);

  const [editingOrder, setEditingOrder] =
    useState(null);

  const [editForm, setEditForm] = useState({
    ...initialForm,
  });

  const [editSaving, setEditSaving] =
    useState(false);

  const [search, setSearch] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    businessSettings,
    setBusinessSettings,
  ] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );

    localStorage.setItem(
      "theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const loadOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getOrders();

      setOrders(response.data);

      return response.data;
    } catch (err) {
      console.error(
        "Load orders error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to load orders. Check your backend connection."
      );

      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);

    try {
      const response = await getProducts();

      setProducts(response.data);

      return response.data;
    } catch (err) {
      console.error(
        "Load products error:",
        err
      );

      throw err;
    } finally {
      setProductsLoading(false);
    }
  };

  const loadBusinessSettings = async () => {
    try {
      const response = await getSettings();

      const settings = response.data;

      setBusinessSettings(settings);

      if (settings?.store_name) {
        setCurrentUser((prev) => ({
          ...(prev || {}),
          storeName: settings.store_name,
          store_name: settings.store_name,
        }));
      }

      return settings;
    } catch (err) {
      console.error(
        "Settings load error:",
        err
      );

      return null;
    }
  };

  const handleSettingsSaved = (
    updatedSettings
  ) => {
    setBusinessSettings(updatedSettings);

    if (updatedSettings?.store_name) {
      setCurrentUser((prev) => ({
        ...(prev || {}),
        storeName: updatedSettings.store_name,
        store_name: updatedSettings.store_name,
      }));
    }
  };

  useEffect(() => {
    loadOrders();

    loadProducts().catch(() => {});

    loadBusinessSettings();
  }, []);

  const selectedProduct = products.find(
    (item) =>
      String(item.id) ===
      String(selectedProductId)
  );

  const editSelectedProduct = products.find(
    (item) =>
      String(item.id) ===
      String(editSelectedProductId)
  );

  const requestedQuantity =
    Number(form.quantity);

  const insufficientStock =
    Boolean(selectedProduct) &&
    Number.isFinite(requestedQuantity) &&
    requestedQuantity >
      Number(selectedProduct.stock);

  const unavailableProduct =
    Boolean(selectedProduct) &&
    (
      !selectedProduct.is_active ||
      Number(selectedProduct.stock) <= 0
    );

  const stockError =
    Boolean(selectedProductId) &&
    (
      !selectedProduct ||
      insufficientStock ||
      unavailableProduct
    );

  const editRequestedQuantity =
    Number(editForm.quantity);

  const editingIsCancelled =
    editingOrder?.status === "Cancelled";

  const editingSameProduct =
    Boolean(editingOrder?.product_id) &&
    String(editingOrder.product_id) ===
      String(editSelectedProductId);

  const editAvailableStock =
    editSelectedProduct
      ? Number(editSelectedProduct.stock) +
        (
          editingSameProduct &&
          !editingIsCancelled
            ? Number(editingOrder.quantity)
            : 0
        )
      : 0;

  const editInsufficientStock =
    Boolean(editSelectedProduct) &&
    !editingIsCancelled &&
    editRequestedQuantity >
      editAvailableStock;

  const editUnavailableProduct =
    Boolean(editSelectedProduct) &&
    !editingIsCancelled &&
    !editSelectedProduct.is_active &&
    !(
      editingSameProduct &&
      editRequestedQuantity <=
        Number(editingOrder.quantity)
    );

  const editStockError =
    Boolean(editSelectedProductId) &&
    (
      !editSelectedProduct ||
      editInsufficientStock ||
      editUnavailableProduct
    );

  const handleProductSelect = (event) => {
    const id = event.target.value;

    setSelectedProductId(id);

    if (!id) {
      setForm((prev) => ({
        ...prev,
        product: "",
        price: "",
      }));

      return;
    }

    const product = products.find(
      (item) =>
        String(item.id) === id
    );

    if (!product) return;

    setForm((prev) => ({
      ...prev,
      product: product.name,
      price: String(product.price),
    }));
  };

  const handleEditProductSelect = (
    event
  ) => {
    const id = event.target.value;

    setEditSelectedProductId(id);

    if (!id) {
      setEditForm((prev) => ({
        ...prev,
        product: "",
        price: "",
      }));

      return;
    }

    const product = products.find(
      (item) =>
        String(item.id) === id
    );

    if (!product) return;

    const sameProduct =
      String(editingOrder?.product_id) ===
      id;

    setEditForm((prev) => ({
      ...prev,
      product: product.name,
      price: sameProduct
        ? String(editingOrder.price)
        : String(product.price),
    }));
  };

  const openAddOrder = async () => {
    setForm({ ...initialForm });
    setSelectedProductId("");
    setShowForm(true);

    try {
      await loadProducts();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Unable to refresh products."
      );
    }
  };

  const openEditOrder = async (order) => {
    setEditingOrder(order);

    setEditSelectedProductId(
      order.product_id
        ? String(order.product_id)
        : ""
    );

    setEditForm({
      customer: order.customer || "",
      phone: String(order.phone || ""),
      product: order.product || "",
      quantity: order.quantity,
      price: order.price,
      address: order.address || "",
    });

    try {
      await loadProducts();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Unable to refresh products."
      );
    }
  };

  const validateOrder = (data) => {
    const phone = String(
      data.phone || ""
    ).replace(/\D/g, "");

    const quantity =
      Number(data.quantity);

    const price =
      Number(data.price);

    if (!/^[1-9]\d{7,14}$/.test(phone)) {
      alert(
        "Enter a valid international WhatsApp number."
      );

      return null;
    }

    if (
      !String(data.customer || "").trim() ||
      !String(data.product || "").trim() ||
      data.quantity === "" ||
      data.quantity == null ||
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      data.price === "" ||
      data.price == null ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 9999999999
    ) {
      alert(
        "Please enter valid order information."
      );

      return null;
    }

    const total =
      Math.round(
        quantity * price * 100
      ) / 100;

    if (
      !Number.isFinite(total) ||
      total > 9999999999
    ) {
      alert("Order total is too large.");

      return null;
    }

    return {
      customer:
        String(data.customer).trim(),
      phone,
      product:
        String(data.product).trim(),
      quantity,
      price,
      address: data.address || "",
    };
  };

  const addOrder = async (event) => {
    event.preventDefault();

    if (saving || productsLoading) {
      return;
    }

    const data = validateOrder(form);

    if (!data) return;

    if (stockError) {
      alert(
        "Insufficient stock or unavailable product."
      );

      return;
    }

    data.product_id = selectedProduct
      ? Number(selectedProduct.id)
      : null;

    setSaving(true);

    try {
      const response =
        await createOrder(data);

      setOrders((prev) => [
        response.data,
        ...prev,
      ]);

      setForm({ ...initialForm });
      setSelectedProductId("");
      setShowForm(false);
    } catch (err) {
      console.error(
        "Create order error:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to save order."
      );
    } finally {
      try {
        await loadProducts();
      } catch (err) {
        console.error(
          "Refresh products error:",
          err
        );
      }

      setSaving(false);
    }
  };

  const saveEditedOrder = async (
    event
  ) => {
    event.preventDefault();

    if (
      !editingOrder ||
      editSaving ||
      productsLoading
    ) {
      return;
    }

    const data =
      validateOrder(editForm);

    if (!data) return;

    if (editStockError) {
      alert(
        "Insufficient stock or unavailable product."
      );

      return;
    }

    data.product_id =
      editSelectedProduct
        ? Number(editSelectedProduct.id)
        : null;

    setEditSaving(true);

    try {
      const response =
        await updateOrder(
          editingOrder.id,
          data
        );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === editingOrder.id
            ? response.data
            : order
        )
      );

      setEditingOrder(null);
      setEditSelectedProductId("");
      setEditForm({ ...initialForm });
    } catch (err) {
      console.error(
        "Edit order error:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to update order."
      );
    } finally {
      try {
        await loadProducts();
      } catch (err) {
        console.error(
          "Refresh products error:",
          err
        );
      }

      setEditSaving(false);
    }
  };

  const updateStatus = async (
    id,
    status
  ) => {
    try {
      const response =
        await updateOrderStatus(
          id,
          status
        );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? response.data
            : order
        )
      );
    } catch (err) {
      console.error(
        "Status update error:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to update order status."
      );
    } finally {
      try {
        await loadProducts();
      } catch (err) {
        console.error(
          "Refresh products error:",
          err
        );
      }
    }
  };

  const deleteOrder = async (id) => {
    if (
      !window.confirm(
        "Delete this order?"
      )
    ) {
      return;
    }

    try {
      await deleteOrderById(id);

      setOrders((prev) =>
        prev.filter(
          (order) => order.id !== id
        )
      );
    } catch (err) {
      console.error(
        "Delete order error:",
        err
      );

      alert(
        err.response?.data?.error ||
          "Failed to delete order."
      );
    } finally {
      try {
        await loadProducts();
      } catch (err) {
        console.error(
          "Refresh products error:",
          err
        );
      }
    }
  };

  const sendWhatsApp = (order) => {
    const phone = String(
      order.phone || ""
    ).replace(/\D/g, "");

    if (
      !/^[1-9]\d{7,14}$/.test(phone)
    ) {
      alert(
        "Invalid WhatsApp number."
      );

      return;
    }

    const template =
      businessSettings?.whatsapp_message ||
      defaultMessage;

    const variables = {
      customer: order.customer || "",
      order_id: String(order.id),
      product: order.product || "",
      quantity:
        String(order.quantity),
      total: money(order.total),
      address: order.address || "",
      store_name:
        businessSettings?.store_name ||
        "My Store",
    };

    const message = template.replace(
      /\{(customer|order_id|product|quantity|total|address|store_name)\}/g,
      (_, key) => variables[key]
    );

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(
        message
      )}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const filteredOrders =
    orders.filter((order) => {
      const text = [
        order.id,
        order.customer,
        order.phone,
        order.product,
      ]
        .join(" ")
        .toLowerCase();

      return (
        text.includes(
          search.toLowerCase()
        ) &&
        (
          statusFilter === "All" ||
          order.status === statusFilter
        )
      );
    });

  const pendingOrders =
    orders.filter(
      (order) =>
        ![
          "Delivered",
          "Cancelled",
        ].includes(order.status)
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status === "Delivered"
    ).length;

  const deliveredRevenue = orders
    .filter(
      (order) =>
        order.status === "Delivered"
    )
    .reduce(
      (sum, order) =>
        sum +
        Number(order.total || 0),
      0
    );

  const stats = [
    {
      title: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "blue",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock3,
      color: "amber",
    },
    {
      title: "Delivered Orders",
      value: deliveredOrders,
      icon: CheckCircle2,
      color: "green",
    },
    {
      title: "Delivered Revenue",
      value: money(deliveredRevenue),
      icon: Wallet,
      color: "indigo",
    },
  ];

  const renderFormFields = (
    values,
    setValues,
    prefix
  ) =>
    formFields.map(
      ([name, label, type]) => {
        const isAdd =
          prefix === "add";

        const catalogSelected =
          isAdd
            ? Boolean(selectedProductId)
            : Boolean(
                editSelectedProductId
              );

        const lockedCatalogField =
          catalogSelected &&
          (
            name === "product" ||
            name === "price"
          );

        return (
          <div key={name}>
            <label
              htmlFor={`${prefix}-${name}`}
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              {label}
            </label>

            <input
              id={`${prefix}-${name}`}
              type={type}
              value={
                values[name] ?? ""
              }
              readOnly={
                lockedCatalogField
              }
              onChange={(event) => {
                const value =
                  event.target.value;

                setValues((prev) => ({
                  ...prev,
                  [name]: value,
                }));
              }}
              min={
                name === "quantity"
                  ? 1
                  : name === "price"
                  ? 0
                  : undefined
              }
              step={
                name === "price"
                  ? "0.01"
                  : name === "quantity"
                  ? "1"
                  : undefined
              }
              required={
                name !== "address"
              }
              className={`${fieldClass} ${
                lockedCatalogField
                  ? "cursor-not-allowed bg-[#17213A]"
                  : ""
              }`}
            />

            {lockedCatalogField &&
              name === "product" && (
                <p className="mt-1 text-xs text-slate-400">
                  Product details are linked
                  to the catalog. Select
                  Manual Entry to edit them.
                </p>
              )}
          </div>
        );
      }
    );

  const ordersContent = (
    <section className="overflow-hidden rounded-[24px] border border-[#22D3EE]/15 bg-[#10182D]/90 text-white shadow-[0_15px_50px_rgba(0,0,0,0.25)] backdrop-blur-2xl transition-all duration-300 hover:border-[#7C3AED]/30">
      {}

      <div className="flex flex-col gap-4 border-b border-white/10 bg-gradient-to-r from-[#7C3AED]/10 to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">
            Orders Management
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {filteredOrders.length} orders found
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-[#22D3EE]"
            />

            <input
              aria-label="Search orders"
              placeholder="Search orders..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className={`${fieldClass} py-2 pl-10`}
            />
          </div>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className={`${fieldClass} py-2`}
          >
            <option value="All">
              All Statuses
            </option>

            {statuses.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4 p-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-14 rounded-xl border border-white/5 bg-white/5"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-slate-400">
          <ShoppingBag
            size={40}
            className="mx-auto mb-3 text-[#22D3EE]/40"
          />

          <p>No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#7C3AED]/10 text-[#C4B5FD]">
              <tr>
                {[
                  "Order",
                  "Customer",
                  "Product",
                  "Qty",
                  "Total",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-4 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map(
                (order) => (
                  <tr
                    key={order.id}
                    className="border-t border-white/10 text-slate-200 transition-colors duration-300 hover:bg-[#7C3AED]/10"
                  >
                    <td className="px-5 py-4 font-semibold text-[#22D3EE]">
                      #{order.id}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {order.customer}
                      </p>

                      <p className="text-xs text-slate-400">
                        {order.phone}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {order.product}
                    </td>

                    <td className="px-5 py-4">
                      {order.quantity}
                    </td>

                    <td className="px-5 py-4 font-semibold text-white">
                      {money(order.total)}
                    </td>

                    <td className="px-5 py-4">
                      <select
                        aria-label={`Status for order ${order.id}`}
                        value={
                          order.status
                        }
                        onChange={(event) =>
                          updateStatus(
                            order.id,
                            event.target.value
                          )
                        }
                        className="rounded-xl border border-[#7C3AED]/40 bg-[#080D1F] px-3 py-2 text-sm font-medium text-[#C4B5FD] outline-none transition-all duration-300 hover:border-[#22D3EE]/50 focus:ring-2 focus:ring-[#7C3AED]/30"
                      >
                        {statuses.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          )
                        )}
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Edit order"
                          aria-label={`Edit order ${order.id}`}
                          onClick={() =>
                            openEditOrder(
                              order
                            )
                          }
                          className="rounded-lg border border-[#7C3AED]/30 bg-[#7C3AED]/15 p-2 text-[#C4B5FD] transition-all duration-300 hover:bg-[#7C3AED]/30 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          title="Open WhatsApp"
                          aria-label={`WhatsApp order ${order.id}`}
                          onClick={() =>
                            sendWhatsApp(
                              order
                            )
                          }
                          className="rounded-lg border border-emerald-500/30 bg-emerald-500/15 p-2 text-emerald-400 transition-all duration-300 hover:bg-emerald-500/25"
                        >
                          <MessageCircle
                            size={17}
                          />
                        </button>

                        <button
                          type="button"
                          title="Delete order"
                          aria-label={`Delete order ${order.id}`}
                          onClick={() =>
                            deleteOrder(
                              order.id
                            )
                          }
                          className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition-all duration-300 hover:bg-red-500/20"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="h-[2px] bg-gradient-to-r from-[#7C3AED]/60 via-[#22D3EE]/40 to-transparent" />
    </section>
  );

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-[#080D1F] text-white">
      <QuantumBackground />

      <div className="relative z-10 min-h-screen">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div
          className={`min-h-screen transition-all duration-300 ${
            collapsed
              ? "lg:ml-20"
              : "lg:ml-64"
          }`}
        >
          {}

          <Navbar
            activePage={activePage}
            setActivePage={setActivePage}
            setMobileOpen={setMobileOpen}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            search={search}
            setSearch={setSearch}
            user={currentUser}
            onLogout={onLogout}
          />

          <main className="mx-auto max-w-7xl space-y-7 p-4 sm:p-8">
            {error && (
              <div
                role="alert"
                className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300"
              >
                <AlertCircle size={20} />

                <span>{error}</span>

                <button
                  type="button"
                  onClick={loadOrders}
                  className="ml-auto underline"
                >
                  Retry
                </button>
              </div>
            )}

            {(
              activePage === "Dashboard" ||
              activePage === "Orders"
            ) && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                      {activePage === "Dashboard"
                        ? "Business Overview"
                        : "All Orders"}
                    </h1>

                    <p className="mt-1 text-sm text-slate-400">
                      Manage your customer orders efficiently.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await loadOrders();

                        try {
                          await loadProducts();
                        } catch (err) {
                          console.error(
                            err
                          );
                        }
                      }}
                      aria-label="Refresh orders"
                      className="rounded-xl border border-white/15 bg-white/5 p-3 text-[#22D3EE] transition hover:border-[#22D3EE]/40 hover:bg-white/10"
                    >
                      <RefreshCw
                        size={19}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={
                        openAddOrder
                      }
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] px-5 py-3 font-semibold text-white shadow-lg shadow-[#7C3AED]/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-[#7C3AED]/40"
                    >
                      <Plus size={19} />
                      Add New Order
                    </button>
                  </div>
                </div>

                {activePage ===
                  "Dashboard" && (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map(
                      (stat) => (
                        <StatCard
                          key={
                            stat.title
                          }
                          {...stat}
                        />
                      )
                    )}
                  </div>
                )}

                {ordersContent}
              </>
            )}

            {activePage ===
              "Products" && (
              <Products />
            )}

            {activePage ===
              "Analytics" && (
              <Analytics
                orders={orders}
              />
            )}

            {activePage ===
              "Customers" && (
              <Customers
                orders={orders}
              />
            )}

            {}

            {activePage ===
              "Settings" && (
              <Settings
                onSettingsSaved={
                  handleSettingsSaved
                }
              />
            )}
          </main>
        </div>

        {}

        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#080D1F]/85 p-4 backdrop-blur-md">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-order-title"
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] border border-[#7C3AED]/30 bg-[#10182D] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.5)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2
                  id="add-order-title"
                  className="text-xl font-bold text-white"
                >
                  Add New Order
                </h2>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    setShowForm(false)
                  }
                  aria-label="Close add order form"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>

              <form
                onSubmit={addOrder}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="select-product"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Select Product (Optional)
                  </label>

                  <select
                    id="select-product"
                    value={
                      selectedProductId
                    }
                    onChange={
                      handleProductSelect
                    }
                    disabled={
                      productsLoading ||
                      saving
                    }
                    className={
                      fieldClass
                    }
                  >
                    <option value="">
                      Manual Entry
                    </option>

                    {products
                      .filter(
                        (product) =>
                          product.is_active
                      )
                      .map(
                        (product) => {
                          const outOfStock =
                            Number(
                              product.stock
                            ) <= 0;

                          return (
                            <option
                              key={
                                product.id
                              }
                              value={
                                product.id
                              }
                              disabled={
                                outOfStock
                              }
                            >
                              {
                                product.name
                              }
                              {" — "}
                              {money(
                                product.price
                              )}
                              {" | Stock: "}
                              {
                                product.stock
                              }
                              {outOfStock
                                ? " (Out of Stock)"
                                : ""}
                            </option>
                          );
                        }
                      )}
                  </select>

                  {productsLoading && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-[#22D3EE]">
                      <Loader2
                        size={14}
                        className="animate-spin"
                      />
                      Loading products...
                    </p>
                  )}

                  {selectedProduct && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-400">
                          Available Stock
                        </span>

                        <span
                          className={`text-sm font-bold ${
                            stockError
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {
                            selectedProduct.stock
                          }
                          {" units"}
                        </span>
                      </div>

                      {insufficientStock && (
                        <p
                          role="alert"
                          className="mt-2 flex items-center gap-2 text-sm text-red-400"
                        >
                          <AlertCircle
                            size={16}
                          />
                          Requested quantity exceeds available stock.
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-slate-400">
                    Select a catalog product or enter the product details manually.
                  </p>
                </div>

                {renderFormFields(
                  form,
                  setForm,
                  "add"
                )}

                <div className="rounded-xl border border-[#7C3AED]/25 bg-[#7C3AED]/10 p-4">
                  <p className="text-sm text-slate-400">
                    Order Total
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#22D3EE]">
                    {money(
                      Number(
                        form.quantity
                      ) *
                        Number(
                          form.price
                        )
                    )}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    productsLoading ||
                    stockError
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] py-3 font-semibold text-white shadow-lg shadow-[#7C3AED]/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : stockError
                    ? "Insufficient Stock"
                    : "Save Order"}
                </button>
              </form>
            </div>
          </div>
        )}

        {}

        {editingOrder && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#080D1F]/85 p-4 backdrop-blur-md">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-order-title"
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] border border-[#7C3AED]/30 bg-[#10182D] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.5)]"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2
                    id="edit-order-title"
                    className="text-xl font-bold text-white"
                  >
                    Edit Order #
                    {
                      editingOrder.id
                    }
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Update the order information.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    editSaving
                  }
                  onClick={() =>
                    setEditingOrder(
                      null
                    )
                  }
                  aria-label="Close edit order form"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={22} />
                </button>
              </div>

              <form
                onSubmit={
                  saveEditedOrder
                }
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="edit-select-product"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Select Product (Optional)
                  </label>

                  <select
                    id="edit-select-product"
                    value={
                      editSelectedProductId
                    }
                    onChange={
                      handleEditProductSelect
                    }
                    disabled={
                      editSaving ||
                      productsLoading
                    }
                    className={
                      fieldClass
                    }
                  >
                    <option value="">
                      Manual Entry
                    </option>

                    {products.map(
                      (product) => {
                        const isCurrent =
                          String(
                            editingOrder.product_id
                          ) ===
                          String(
                            product.id
                          );

                        const unavailable =
                          !product.is_active ||
                          Number(
                            product.stock
                          ) <= 0;

                        return (
                          <option
                            key={
                              product.id
                            }
                            value={
                              product.id
                            }
                            disabled={
                              unavailable &&
                              !isCurrent
                            }
                          >
                            {
                              product.name
                            }
                            {" — "}
                            {money(
                              product.price
                            )}
                            {" | Stock: "}
                            {
                              product.stock
                            }
                            {unavailable
                              ? " (Unavailable)"
                              : ""}
                          </option>
                        );
                      }
                    )}
                  </select>

                  {editSelectedProduct && (
                    <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-slate-400">
                          Available for this order
                        </span>

                        <span
                          className={`text-sm font-bold ${
                            editStockError
                              ? "text-red-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {
                            editAvailableStock
                          }
                          {" units"}
                        </span>
                      </div>

                      {editInsufficientStock && (
                        <p
                          role="alert"
                          className="mt-2 flex items-center gap-2 text-sm text-red-400"
                        >
                          <AlertCircle
                            size={16}
                          />
                          Requested quantity exceeds available stock.
                        </p>
                      )}

                      {editingIsCancelled && (
                        <p className="mt-2 text-xs text-slate-400">
                          This order is cancelled. Stock will be reserved when you reactivate it.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {renderFormFields(
                  editForm,
                  setEditForm,
                  "edit"
                )}

                <div className="rounded-xl border border-[#7C3AED]/25 bg-[#7C3AED]/10 p-4">
                  <p className="text-sm text-slate-400">
                    Updated Total
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#22D3EE]">
                    {money(
                      Number(
                        editForm.quantity
                      ) *
                        Number(
                          editForm.price
                        )
                    )}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={
                      editSaving
                    }
                    onClick={() =>
                      setEditingOrder(
                        null
                      )
                    }
                    className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      editSaving ||
                      productsLoading ||
                      editStockError
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] px-4 py-3 font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {editSaving && (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    )}

                    {editSaving
                      ? "Saving..."
                      : editStockError
                      ? "Insufficient Stock"
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}