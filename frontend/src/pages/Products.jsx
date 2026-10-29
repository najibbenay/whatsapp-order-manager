import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/api";

const emptyForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "0",
  image_url: "",
  is_active: true,
};

const money = (value) =>
  `${Number(value || 0).toFixed(2)} MAD`;

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#080D1F]/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-[#22D3EE]/60 focus:ring-2 focus:ring-[#7C3AED]/20 disabled:cursor-not-allowed disabled:opacity-50";

const labelClass =
  "mb-1.5 block text-sm font-semibold text-slate-300";

const stockStyles = {
  available:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  low:
    "border-amber-500/20 bg-amber-500/10 text-amber-400",
  out:
    "border-red-500/20 bg-red-500/10 text-red-400",
};

export default function Products() {
  const reduceMotion = useReducedMotion();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p) => p.is_active).length,
      lowStock: products.filter(
        (p) => Number(p.stock) > 0 && Number(p.stock) <= 5
      ).length,
      outOfStock: products.filter(
        (p) => Number(p.stock) === 0
      ).length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(term) ||
        (p.category || "").toLowerCase().includes(term);

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && p.is_active) ||
        (filter === "inactive" && !p.is_active) ||
        (filter === "low" &&
          Number(p.stock) > 0 &&
          Number(p.stock) <= 5) ||
        (filter === "out" && Number(p.stock) === 0);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, filter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? 0),
      image_url: product.image_url || "",
      is_active: Boolean(product.is_active),
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.name.trim() ||
      form.price === "" ||
      Number(form.price) < 0 ||
      form.stock === "" ||
      !Number.isSafeInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      setError("Please enter valid product information.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
      };

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await createProduct(payload);
      }

      setModalOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      await loadProducts();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"?`
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setError("");

    try {
      await deleteProduct(product.id);

      setProducts((prev) =>
        prev.filter((p) => p.id !== product.id)
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const statCards = [
    {
      label: "Total Products",
      value: stats.total,
      icon: Package,
      accent: "#22D3EE",
    },
    {
      label: "Active Products",
      value: stats.active,
      icon: CheckCircle2,
      accent: "#7C3AED",
    },
    {
      label: "Low Stock",
      value: stats.lowStock,
      icon: AlertTriangle,
      accent: "#F59E0B",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      icon: Boxes,
      accent: "#F87171",
    },
  ];

  return (
    <div className="space-y-7 pb-10 text-white">
      {}

      <motion.div
        initial={
          reduceMotion ? false : { opacity: 0, y: 18 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#22D3EE]" />

            <p className="text-sm font-medium text-[#22D3EE]">
              Inventory Management
            </p>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Products
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your catalog, pricing and inventory.
          </p>
        </div>

        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            whileHover={
              reduceMotion ? undefined : { scale: 1.05 }
            }
            whileTap={
              reduceMotion ? undefined : { scale: 0.95 }
            }
            className="rounded-xl border border-white/15 bg-white/5 p-3 text-[#22D3EE] transition hover:border-[#22D3EE]/40 hover:bg-white/10 disabled:opacity-50"
            title="Refresh products"
            aria-label="Refresh products"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
          </motion.button>

          <motion.button
            type="button"
            onClick={openCreate}
            whileHover={
              reduceMotion
                ? undefined
                : { y: -2, scale: 1.02 }
            }
            whileTap={
              reduceMotion ? undefined : { scale: 0.97 }
            }
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7C3AED]/20 transition hover:shadow-[#7C3AED]/40"
          >
            <Plus size={18} />
            Add Product
          </motion.button>
        </div>
      </motion.div>

      {}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.label}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 22 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: reduceMotion ? 0 : index * 0.07,
              }}
              whileHover={
                reduceMotion
                  ? undefined
                  : { y: -5, scale: 1.01 }
              }
              className="group relative overflow-hidden rounded-[22px] border border-[#22D3EE]/15 bg-[#10182D]/85 p-5 shadow-[0_10px_35px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-colors hover:border-[#7C3AED]/50"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-3xl"
                style={{ backgroundColor: card.accent }}
              />

              <div className="relative flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-400">
                  {card.label}
                </span>

                <span
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5"
                  style={{ color: card.accent }}
                >
                  <Icon size={19} />
                </span>
              </div>

              <p className="relative mt-4 text-3xl font-bold text-white">
                {card.value}
              </p>

              <div className="mt-5 h-[2px] rounded-full bg-white/10">
                <div
                  className="h-full w-full rounded-full opacity-70"
                  style={{
                    background: `linear-gradient(90deg, ${card.accent}, #7C3AED)`,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {}

      <div className="rounded-[22px] border border-white/10 bg-[#10182D]/85 p-4 shadow-lg shadow-black/10 backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#22D3EE]"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products or categories..."
              aria-label="Search products"
              className={`${inputClass} pl-11`}
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter products"
            className={`${inputClass} md:w-52`}
          >
            <option value="all">All Products</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        <p className="mt-3 text-xs text-slate-400">
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>

      {}

      {error && !modalOpen && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      {}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
          <Loader2
            className="animate-spin text-[#22D3EE]"
            size={22}
          />
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[#7C3AED]/30 bg-[#10182D]/80 px-6 py-20 text-center">
          <Package
            size={42}
            className="mx-auto text-[#7C3AED]/60"
          />

          <h3 className="mt-4 text-lg font-semibold text-white">
            No products found
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            {products.length === 0
              ? "Add your first product to get started."
              : "Try changing your search or filters."}
          </p>

          {products.length === 0 && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-5 rounded-xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
            >
              Add First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product, index) => {
            const stock = Number(product.stock);

            const stockState =
              stock === 0
                ? "out"
                : stock <= 5
                ? "low"
                : "available";

            return (
              <motion.div
                key={product.id}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, y: 22 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion
                    ? 0
                    : Math.min(index * 0.04, 0.3),
                }}
                whileHover={
                  reduceMotion
                    ? undefined
                    : { y: -6 }
                }
                className="group relative overflow-hidden rounded-[24px] border border-[#22D3EE]/15 bg-[#10182D]/90 shadow-[0_12px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-[#7C3AED]/50 hover:shadow-[0_18px_45px_rgba(124,58,237,0.15)]"
              >
                {}
                <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br from-[#17213A] via-[#10182D] to-[#27194D]">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Package
                      size={52}
                      className="text-[#7C3AED]/50"
                    />
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-lg ${
                      product.is_active
                        ? "border-emerald-500/30 bg-[#080D1F]/80 text-emerald-400"
                        : "border-white/15 bg-[#080D1F]/80 text-slate-400"
                    }`}
                  >
                    {product.is_active
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                {}
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#22D3EE]">
                    {product.category || "Uncategorized"}
                  </p>

                  <h3 className="mt-2 truncate text-lg font-bold text-white">
                    {product.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-400">
                    {product.description ||
                      "No description provided."}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xl font-bold text-white">
                      {money(product.price)}
                    </p>

                    <span
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${stockStyles[stockState]}`}
                    >
                      {stock === 0
                        ? "Out of stock"
                        : stock <= 5
                        ? `Low stock: ${stock}`
                        : `Stock: ${stock}`}
                    </span>
                  </div>

                  {}
                  <div className="mt-5 flex gap-2 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/15 px-4 py-2.5 text-sm font-semibold text-[#C4B5FD] transition hover:bg-[#7C3AED]/25"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === product.id}
                      onClick={() => handleDelete(product)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {deletingId === product.id ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={15} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>

                <div
                  aria-hidden="true"
                  className="h-[2px] bg-gradient-to-r from-[#7C3AED]/60 via-[#22D3EE]/40 to-transparent"
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="product-modal"
            initial={
              reduceMotion ? false : { opacity: 0 }
            }
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-[#080D1F]/85 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 20, scale: 0.97 }
              }
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 12,
                scale: 0.98,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-modal-title"
              className="my-auto max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[24px] border border-[#7C3AED]/30 bg-[#10182D] p-6 text-white shadow-[0_25px_80px_rgba(0,0,0,0.5)] sm:p-8"
            >
              {}
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="product-modal-title"
                    className="text-xl font-bold text-white"
                  >
                    {editingId
                      ? "Edit Product"
                      : "Add New Product"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Enter your product details below.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={closeModal}
                  aria-label="Close product form"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              {}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="product-name"
                    className={labelClass}
                  >
                    Product Name *
                  </label>

                  <input
                    id="product-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    placeholder="e.g. Premium Perfume"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-description"
                    className={labelClass}
                  >
                    Description
                  </label>

                  <textarea
                    id="product-description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Product description..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-category"
                    className={labelClass}
                  >
                    Category
                  </label>

                  <input
                    id="product-category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    maxLength={100}
                    placeholder="e.g. Beauty"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="product-price"
                      className={labelClass}
                    >
                      Price (MAD) *
                    </label>

                    <input
                      id="product-price"
                      type="number"
                      name="price"
                      value={form.price}
                      onChange={handleChange}
                      required
                      min="0"
                      max="9999999999.99"
                      step="0.01"
                      placeholder="199.00"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="product-stock"
                      className={labelClass}
                    >
                      Stock *
                    </label>

                    <input
                      id="product-stock"
                      type="number"
                      name="stock"
                      value={form.stock}
                      onChange={handleChange}
                      required
                      min="0"
                      step="1"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="product-image"
                    className={labelClass}
                  >
                    Image URL
                  </label>

                  <input
                    id="product-image"
                    type="url"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/product.jpg"
                    className={inputClass}
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 accent-[#7C3AED]"
                  />

                  <span className="text-sm font-medium text-slate-200">
                    Product is active
                  </span>
                </label>

                {}
                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
                  >
                    {error}
                  </p>
                )}

                {}
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={closeModal}
                    className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7C3AED]/20 transition hover:brightness-110 disabled:opacity-50"
                  >
                    {saving && (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    )}

                    {saving
                      ? "Saving..."
                      : editingId
                      ? "Save Changes"
                      : "Create Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}