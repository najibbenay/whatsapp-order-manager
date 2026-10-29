import { useEffect, useMemo, useState } from "react";
import {
  motion,
  useReducedMotion,
} from "motion/react";

import {
  Store,
  MessageCircle,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Eye,
  Info,
} from "lucide-react";

import {
  getSettings,
  updateSettings,
} from "../services/api";

const initialSettings = {
  store_name: "",
  store_phone: "",
  store_email: "",
  store_address: "",
  whatsapp_message: "",
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#080D1F]/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-[#22D3EE]/60 focus:ring-2 focus:ring-[#7C3AED]/20 disabled:cursor-not-allowed disabled:opacity-50";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-300";

const sectionClass =
  "relative overflow-hidden rounded-[24px] border border-[#22D3EE]/15 bg-[#10182D]/90 p-6 shadow-[0_15px_50px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition-colors duration-300 hover:border-[#7C3AED]/35";


export default function Settings({ onSettingsSaved }) {
  const reduceMotion = useReducedMotion();

  const [form, setForm] = useState({
    ...initialSettings,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await getSettings();

      setForm({
        ...initialSettings,
        ...response.data,
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          "Failed to load business settings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSuccess("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await updateSettings({
        store_name: form.store_name,
        store_phone: form.store_phone,
        store_email: form.store_email,
        store_address: form.store_address,
        whatsapp_message: form.whatsapp_message,
      });

      setForm({
        ...initialSettings,
        ...response.data,
      });

      onSettingsSaved?.(response.data);

      setSuccess("Settings saved successfully!");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.error ||
          "Failed to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const messagePreview = useMemo(() => {
    const template = form.whatsapp_message || "";

    const variables = {
      customer: "Ahmed",
      order_id: "1024",
      product: "Premium Product",
      quantity: "2",
      total: "399.00 MAD",
      address: "Agadir, Morocco",
      store_name: form.store_name || "My Store",
    };

    return template.replace(
      /\{(customer|order_id|product|quantity|total|address|store_name)\}/g,
      (_, key) => variables[key]
    );
  }, [form.whatsapp_message, form.store_name]);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-slate-400">
        <Loader2
          className="animate-spin text-[#22D3EE]"
          size={24}
        />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-10 text-white">
      {}

      <motion.div
        initial={
          reduceMotion
            ? false
            : { opacity: 0, y: 18 }
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles
              size={16}
              className="text-[#22D3EE]"
            />

            <p className="text-sm font-medium text-[#22D3EE]">
              Store Configuration
            </p>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Business Settings
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your business and WhatsApp preferences.
          </p>
        </div>

        <motion.button
          type="button"
          onClick={loadSettings}
          disabled={saving}
          whileHover={
            reduceMotion ? undefined : { scale: 1.05 }
          }
          whileTap={
            reduceMotion ? undefined : { scale: 0.95 }
          }
          className="rounded-xl border border-white/15 bg-white/5 p-3 text-[#22D3EE] transition hover:border-[#22D3EE]/40 hover:bg-white/10 disabled:opacity-50"
          title="Refresh settings"
          aria-label="Refresh settings"
        >
          <RefreshCw size={19} />
        </motion.button>
      </motion.div>

      {}

      {error && (
        <motion.div
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: -8 }
          }
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300"
        >
          <AlertCircle
            size={19}
            className="shrink-0"
          />

          <span>{error}</span>
        </motion.div>
      )}

      {}

      {success && (
        <motion.div
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: -8 }
          }
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300"
        >
          <CheckCircle2
            size={19}
            className="shrink-0"
          />

          <span>{success}</span>
        </motion.div>
      )}

      {}

      <form
        onSubmit={handleSave}
        className="space-y-6"
      >
        {}

        <motion.section
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 20 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.08,
          }}
          className={sectionClass}
        >
          {}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#7C3AED]/15 blur-3xl"
          />

          <div className="relative mb-6 flex items-center gap-3">
            <div className="rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/15 p-3 text-[#C4B5FD]">
              <Store size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Business Information
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Your store details
              </p>
            </div>
          </div>

          <div className="relative grid gap-5 sm:grid-cols-2">
            {[
              [
                "store_name",
                "Store Name",
                "text",
              ],
              [
                "store_phone",
                "Business Phone",
                "tel",
              ],
              [
                "store_email",
                "Business Email",
                "email",
              ],
            ].map(([name, label, type]) => (
              <div key={name}>
                <label
                  htmlFor={name}
                  className={labelClass}
                >
                  {label}
                  {name === "store_name" && (
                    <span className="ml-1 text-[#22D3EE]">
                      *
                    </span>
                  )}
                </label>

                <input
                  id={name}
                  name={name}
                  type={type}
                  value={form[name] || ""}
                  onChange={handleChange}
                  required={
                    name === "store_name"
                  }
                  maxLength={
                    name === "store_name" ||
                    name === "store_email"
                      ? 150
                      : 30
                  }
                  className={inputClass}
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label
                htmlFor="store_address"
                className={labelClass}
              >
                Store Address
              </label>

              <textarea
                id="store_address"
                name="store_address"
                rows={3}
                value={form.store_address || ""}
                onChange={handleChange}
                placeholder="Enter your business address..."
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>

          <div className="mt-6 h-[2px] bg-gradient-to-r from-[#7C3AED]/50 via-[#22D3EE]/30 to-transparent" />
        </motion.section>

        {}

        <motion.section
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 20 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.16,
          }}
          className={sectionClass}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#22D3EE]/10 blur-3xl"
          />

          <div className="relative mb-6 flex items-center gap-3">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-emerald-400">
              <MessageCircle size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                WhatsApp Settings
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Customize the order confirmation message
              </p>
            </div>
          </div>

          {}

          <div className="relative">
            <label
              htmlFor="whatsapp_message"
              className={labelClass}
            >
              Confirmation Message
              <span className="ml-1 text-[#22D3EE]">
                *
              </span>
            </label>

            <textarea
              id="whatsapp_message"
              name="whatsapp_message"
              rows={7}
              value={form.whatsapp_message || ""}
              onChange={handleChange}
              required
              placeholder="Bonjour {customer}, merci pour votre commande #{order_id}..."
              className={`${inputClass} resize-y leading-relaxed`}
            />
          </div>

          {}

          <div className="mt-4 rounded-xl border border-[#22D3EE]/15 bg-[#22D3EE]/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#22D3EE]">
              <Info size={16} />
              Available Message Variables
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                "{customer}",
                "{order_id}",
                "{product}",
                "{quantity}",
                "{total}",
                "{address}",
                "{store_name}",
              ].map((variable) => (
                <span
                  key={variable}
                  className="rounded-lg border border-[#7C3AED]/25 bg-[#7C3AED]/10 px-2.5 py-1.5 font-mono text-xs text-[#C4B5FD]"
                >
                  {variable}
                </span>
              ))}
            </div>

            <p className="mt-3 text-xs text-slate-400">
              These variables are automatically replaced
              with the customer's order information when
              you send a WhatsApp message.
            </p>
          </div>

          {}

          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Eye
                size={17}
                className="text-[#22D3EE]"
              />

              <h3 className="text-sm font-semibold text-white">
                Live Message Preview
              </h3>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080D1F]/70">
              <div className="flex items-center gap-3 border-b border-white/10 bg-[#17213A]/80 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <MessageCircle size={18} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    WhatsApp Preview
                  </p>

                  <p className="text-xs text-slate-400">
                    Sample customer message
                  </p>
                </div>
              </div>

              <div className="p-4">
                <div className="ml-auto max-w-[95%] rounded-2xl rounded-tr-sm border border-emerald-500/15 bg-emerald-500/10 px-4 py-3 shadow-sm sm:max-w-[85%]">
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-200">
                    {messagePreview ||
                      "Your WhatsApp message preview will appear here."}
                  </p>

                  <p className="mt-2 text-right text-[10px] text-emerald-400/70">
                    Preview only
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Preview uses example order details. No
              message is sent.
            </p>
          </div>

          <div className="mt-6 h-[2px] bg-gradient-to-r from-[#7C3AED]/50 via-[#22D3EE]/30 to-transparent" />
        </motion.section>

        {}

        <motion.div
          initial={
            reduceMotion
              ? false
              : { opacity: 0, y: 12 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: 0.2,
          }}
          className="flex justify-end"
        >
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={
              reduceMotion || saving
                ? undefined
                : { y: -2, scale: 1.02 }
            }
            whileTap={
              reduceMotion || saving
                ? undefined
                : { scale: 0.97 }
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] px-7 py-3 font-semibold text-white shadow-lg shadow-[#7C3AED]/20 transition hover:shadow-[#7C3AED]/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2
                size={19}
                className="animate-spin"
              />
            ) : (
              <Save size={19} />
            )}

            {saving
              ? "Saving..."
              : "Save Settings"}
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
}