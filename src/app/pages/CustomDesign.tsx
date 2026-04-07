import { motion } from "motion/react";
import { Upload, X, Check, Minus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

interface DesignForm {
  name: string;
  email: string;
  phone: string;
  productType: string;
  quantity: string;
  message: string;
  files: File[];
}

export function CustomDesign() {
  const [dragActive, setDragActive] = useState(false);
  const [form, setForm] = useState<DesignForm>({
    name: "",
    email: "",
    phone: "",
    productType: "",
    quantity: "",
    message: "",
    files: [],
  });
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();

  // 🔥 Autofill user data when available
  useEffect(() => {
    if (user) {
      const metadata = (user as any)?.user_metadata || {};

      setForm((prev) => ({
        ...prev,
        email: user.email || "",
        name:
          metadata.full_name ||
          metadata.name ||
          prev.name,
        phone:
          metadata.phone ||
          prev.phone,
      }));
    }
  }, [user]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setForm({ ...form, files: Array.from(e.dataTransfer.files) });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setForm({ ...form, files: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.files.length === 0) {
      toast.error("Please upload at least one design file");
      return;
    }

    if (!user) {
      toast.error("Please login first");
      return;
    }

    try {
      const uploadedUrls: string[] = [];

      for (const file of form.files) {
        const safeFileName = file.name.replace(/\s+/g, "_").replace(/[^\w.-]/g, "");
        const filePath = `designs/${user.id}/${Date.now()}-${safeFileName}`;

        const { data, error: uploadError } = await supabase.storage
          .from("custom-designs")
          .upload(filePath, file);

        if (uploadError) {
          console.error(uploadError);
          toast.error("Failed to upload one of the files");
          return;
        }

        const { data: urlData } = supabase.storage
          .from("custom-designs")
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase.from("custom_designs").insert([
        {
          user_id: user.id,
          customer_email: form.email.trim(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          product_type: form.productType,
          quantity: Number(form.quantity),
          message: form.message.trim(),
          image_urls: uploadedUrls,
          status: "pending",
        },
      ]);

      // ✅ Do NOT create order here
      // Order will be created only after admin approves the design

      if (error) {
        console.error(error);
        toast.error("Failed to submit design");
        return;
      }

      setSubmitted(true);
      toast.success("Design submitted successfully");

      setTimeout(() => {
        setSubmitted(false);
        setForm({
          name: "",
          email: "",
          phone: "",
          productType: "",
          quantity: "",
          message: "",
          files: [],
        });
      }, 3000);
    } catch {
      toast.error("Failed to submit design");
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-px bg-white"></div>
              <Minus size={16} className="opacity-50" />
              <div className="w-12 h-px bg-white"></div>
            </div>
            <h1 className="text-4xl md:text-6xl tracking-[0.3em] uppercase">
              Custom Prints
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Bring your vision to life. Submit your design and we'll create a
              unique piece tailored to your specifications.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-12"
          >
            {/* File Upload */}
            <div className="space-y-4">
              <label className="block text-sm tracking-[0.2em] uppercase">
                Upload Your Design *
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed transition-colors ${
                  dragActive
                    ? "border-black bg-gray-50"
                    : "border-gray-300 hover:border-gray-400"
                } p-12 text-center`}
              >
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.ai,.psd"
                  multiple
                  className="hidden"
                />
                {form.files.length > 0 ? (
                  <div className="space-y-4">
                    <Check size={40} className="mx-auto" />
                    <div className="space-y-1">
                      {form.files.map((file, index) => (
                        <p key={index} className="text-sm tracking-wider">
                          {file.name}
                        </p>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, files: [] })}
                      className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase hover:opacity-70"
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload size={40} className="mx-auto opacity-30" />
                    <div className="space-y-2">
                      <p className="text-sm tracking-wider">
                        Drag and drop your design here
                      </p>
                      <p className="text-xs text-gray-500 uppercase tracking-[0.2em]">
                        or
                      </p>
                      <label
                        htmlFor="file-upload"
                        className="inline-block cursor-pointer border-2 border-black px-8 py-3 hover:bg-black hover:text-white transition-all uppercase tracking-[0.2em] text-xs"
                      >
                        Browse Files
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Accepted formats: JPG, PNG, PDF, AI, PSD (Max 50MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="block text-sm tracking-[0.2em] uppercase">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-2 border-gray-300 px-6 py-4 focus:outline-none focus:border-black transition-colors uppercase tracking-wider text-sm"
                  placeholder="JOHN DOE"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm tracking-[0.2em] uppercase">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border-2 border-gray-300 px-6 py-4 focus:outline-none focus:border-black transition-colors tracking-wider text-sm"
                  placeholder="hello@example.com"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm tracking-[0.2em] uppercase">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border-2 border-gray-300 px-6 py-4 focus:outline-none focus:border-black transition-colors tracking-wider text-sm"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm tracking-[0.2em] uppercase">
                  Product Type *
                </label>
                <select
                  required
                  value={form.productType}
                  onChange={(e) =>
                    setForm({ ...form, productType: e.target.value })
                  }
                  className="w-full border-2 border-gray-300 px-6 py-4 focus:outline-none focus:border-black transition-colors uppercase tracking-wider text-sm bg-white"
                >
                  <option value="">SELECT</option>
                  <option value="tshirt">T-Shirt</option>
                  <option value="hoodie">Hoodie</option>
                  <option value="sweatshirt">Sweatshirt</option>
                  <option value="jacket">Jacket</option>
                  <option value="bag">Bag</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="block text-sm tracking-[0.2em] uppercase">
                Quantity *
              </label>
              <input
                type="number"
                required
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full md:w-1/2 border-2 border-gray-300 px-6 py-4 focus:outline-none focus:border-black transition-colors tracking-wider text-sm"
                placeholder="1"
              />
            </div>

            {/* Additional Message */}
            <div className="space-y-3">
              <label className="block text-sm tracking-[0.2em] uppercase">
                Additional Details
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={6}
                className="w-full border-2 border-gray-300 px-6 py-4 focus:outline-none focus:border-black transition-colors tracking-wider text-sm resize-none"
                placeholder="Tell us more about your vision, preferred colors, placement, sizing requirements, or any other details..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <button
                type="submit"
                disabled={submitted}
                className="w-full sm:w-auto px-12 py-5 bg-black text-white hover:bg-gray-800 transition-colors uppercase tracking-[0.2em] text-sm disabled:bg-gray-400"
              >
                {submitted ? "Submitted!" : "Submit Design"}
              </button>
              <p className="text-xs text-gray-500 tracking-wider">
                We'll review your submission and contact you within 48 hours
              </p>
            </div>
          </motion.form>

          {/* Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-20 pt-20 border-t border-gray-200"
          >
            <h2 className="text-2xl tracking-[0.2em] uppercase mb-12 text-center">
              Design Guidelines
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                  <Minus size={20} />
                </div>
                <h3 className="text-sm tracking-[0.2em] uppercase">
                  High Resolution
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Submit designs at 300 DPI minimum for optimal print quality.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                  <Minus size={20} />
                </div>
                <h3 className="text-sm tracking-[0.2em] uppercase">
                  Color Modes
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Use CMYK for prints. RGB files will be converted.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 border-2 border-black flex items-center justify-center">
                  <Minus size={20} />
                </div>
                <h3 className="text-sm tracking-[0.2em] uppercase">
                  Rights & Licensing
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ensure you own all rights to submitted designs.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
