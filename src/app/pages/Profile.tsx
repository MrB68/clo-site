import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { User, Mail, Calendar, ArrowLeft, LogOut, Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {
  getCustomerProfile,
  saveCustomerProfile,
  type CustomerProfileDetails,
} from "../utils/customerProfile";
import { nepalLocations } from "../utils/nepalLocations";

import { supabase } from "../../lib/supabase";
export function Profile() {
  const { user } = useAuth();
  const supabaseUser = user as any;
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [savedDetails, setSavedDetails] = useState<CustomerProfileDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    province: "",
    district: "",
    city: "",
    area: "",
    wardNumber: "",
    landmark: "",
    address: "",
    postalCode: "",
    profileImage: "",
  });

  const [profileName, setProfileName] = useState<string>("");
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    reviews: 0,
  });
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfileName = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (
        !error &&
        data?.full_name &&
        data.full_name !== user.email?.split("@")[0]
      ) {
        setProfileName(data.full_name);
      } else {
        // 🔥 fallback + AUTO SYNC to DB
        const fallback =
          authUser?.user_metadata?.full_name ||
          authUser?.user_metadata?.name ||
          supabaseUser?.user_metadata?.full_name ||
          supabaseUser?.user_metadata?.name ||
          `${derivedName.firstName} ${derivedName.lastName}`.trim() ||
          user.email?.split("@")[0];

        const finalName = fallback || "User";

        setProfileName(finalName);

        // ❗ only overwrite if DB is empty or junk (email-based)
        if (!data?.full_name || data.full_name === user.email?.split("@")[0]) {
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            full_name: finalName,
          });
        }
      }
    };

    fetchProfileName();

    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new?.full_name) {
            setProfileName(payload.new.full_name);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.email]);
  const [authUser, setAuthUser] = useState<any>(null);
useEffect(() => {
  const fetchAuthUser = async () => {
    const { data } = await supabase.auth.getUser();
    setAuthUser(data.user);

    // 🔥 sync avatar into state
    if (data.user?.user_metadata?.avatar_url) {
      setSavedDetails((prev) => ({
        ...prev,
        profileImage: data.user.user_metadata.avatar_url,
      }));
    }
  };

  fetchAuthUser();
}, []);


  const handleSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error(error);
      toast.error("Failed to sign out");
    }
    setIsSigningOut(false);
  };

  const derivedName = useMemo(() => {
    if (!supabaseUser) return { firstName: "", lastName: "" };
    const fullName = (supabaseUser?.user_metadata?.full_name || "").trim();
    const parts = fullName.split(/\s+/);
    return {
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
    };
  }, [supabaseUser?.user_metadata?.full_name]);

  const provinceOptions = Object.keys(nepalLocations);
  const districtOptions = savedDetails.province
    ? nepalLocations[savedDetails.province]?.districts ?? []
    : [];
  const cityOptions = savedDetails.province
    ? nepalLocations[savedDetails.province]?.cities ?? []
    : [];

  useEffect(() => {
    if (!user?.id) return;
    const storedProfile = getCustomerProfile(user.id);

    if (storedProfile) {
      setSavedDetails({
        ...storedProfile,
        profileImage:
          storedProfile.profileImage ||
          supabaseUser?.user_metadata?.avatar_url ||
          "",
      });
      return;
    }

    const fullName =
      supabaseUser?.user_metadata?.full_name ||
      `${derivedName.firstName} ${derivedName.lastName}`.trim();

    const parts = fullName.split(" ");

    setSavedDetails((current) => ({
      ...current,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
      email: user?.email || "",
      profileImage: supabaseUser?.user_metadata?.avatar_url || "",
    }));
  }, [derivedName.firstName, derivedName.lastName, user?.email, user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      try {
        // Orders count
        const { count: ordersCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Wishlist count
        const { count: wishlistCount } = await supabase
          .from("wishlist")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        // Reviews count (if table exists)
        let reviewsCount = 0;
        try {
          const { count } = await supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);
          reviewsCount = count || 0;
        } catch {
          reviewsCount = 0;
        }

        setStats({
          orders: ordersCount || 0,
          wishlist: wishlistCount || 0,
          reviews: reviewsCount,
        });
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };

    fetchStats();
  }, [user?.id]);

  const handleDetailsChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setSavedDetails((current) => {
      if (name === "province") {
        return {
          ...current,
          province: value,
          district: "",
          city: "",
          area: "",
        };
      }

      return { ...current, [name]: value };
    });
  };

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // 🔥 upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error(uploadError);
      toast.error("Upload failed");
      return;
    }

    // 🔥 get public URL
    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    // update state
    setSavedDetails((current) => ({
      ...current,
      profileImage: publicUrl,
    }));

    // save in Supabase user metadata
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    toast.success("Profile picture updated");
  };

  // 🔥 Add delete profile image handler
  const handleDeleteProfileImage = async () => {
    if (!user?.id) return;

    try {
      // extract file path from URL
      const url = savedDetails.profileImage;
      if (!url) return;

      const path = url.split("/avatars/")[1];

      if (path) {
        await supabase.storage.from("avatars").remove([`avatars/${path}`]);
      }

      // remove from metadata
      await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      // update UI
      setSavedDetails((prev) => ({
        ...prev,
        profileImage: "",
      }));

      toast.success("Profile picture removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove image");
    }
  };

  const handleSaveDetails = async () => {
    if (!user?.id) {
      toast.error("Please sign in again");
      return;
    }

    const fullName = `${savedDetails.firstName} ${savedDetails.lastName}`.trim();

    saveCustomerProfile(user.id, {
      ...savedDetails,
      email: savedDetails.email.trim() || user?.email || "",
    });

    // 🔥 persist to Supabase
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        avatar_url: savedDetails.profileImage,
      },
    });

    // 🔥 persist full_name to profiles table as well
    if (user?.id) {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          full_name: fullName,
        });

      if (profileError) {
        console.error("Profile upsert error:", profileError);
      }
    }

    if (error) {
      console.error("Metadata update error:", error);
      toast.error("Failed to update profile");
      return;
    }

    toast.success("Profile updated successfully");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="bg-gray-900 border border-gray-800 text-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 tracking-widest uppercase">
            Access Denied
          </h1>
          <p className="text-gray-400 mb-6 tracking-wider">
            Please sign in to view your profile.
          </p>
          <Link
            to="/signin"
            className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors tracking-widest uppercase text-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-black text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm tracking-wider uppercase">Back to Shop</span>
          </Link>
          <h1 className="text-2xl tracking-widest uppercase">My Profile</h1>
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-sm text-gray-300 hover:text-white transition-colors tracking-wider uppercase disabled:opacity-50"
          >
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6 tracking-widest uppercase">
                Account Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 overflow-hidden rounded-full bg-black flex items-center justify-center">
                      {savedDetails.profileImage || supabaseUser?.user_metadata?.avatar_url ? (
                        <img
                          src={savedDetails.profileImage || supabaseUser?.user_metadata?.avatar_url}
                          alt={profileName || `${savedDetails.firstName} ${savedDetails.lastName}`.trim() || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={28} className="text-white" />
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-900 border border-gray-800 text-white shadow-md transition hover:bg-gray-700">
                      <Camera size={14} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </label>
                    {(savedDetails.profileImage || supabaseUser?.user_metadata?.avatar_url) && (
                      <button
                        onClick={handleDeleteProfileImage}
                        className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow hover:bg-red-600"
                        title="Remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium tracking-wider">
                      {profileName || "User"}
                    </h3>
                    <p className="text-sm text-gray-400 tracking-wider uppercase">
                      Member since {authUser?.created_at ? formatDate(authUser.created_at) : "N/A"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 tracking-wider uppercase">
                  Click the camera icon to upload your profile picture.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-400">
                      Full Name
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                      <User size={16} className="text-gray-400" />
                      <span className="tracking-wider">{profileName || `${savedDetails.firstName} ${savedDetails.lastName}`.trim() || "User"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-400">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                      <Mail size={16} className="text-gray-400" />
                      <span className="tracking-wider break-all">{user?.email || ""}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-400">
                      Member Since
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="tracking-wider">
                        {authUser?.created_at ? formatDate(authUser.created_at) : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-400">
                      Account Status
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="tracking-wider text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-widest uppercase">
                    Checkout Details
                  </h2>
                  <p className="text-sm text-gray-400 tracking-wider">
                    Save your delivery information here to auto-fill checkout for this account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveDetails}
                  className="bg-black px-5 py-3 text-sm uppercase tracking-widest text-white transition-colors hover:bg-gray-800"
                >
                  Save Details
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={savedDetails.firstName}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={savedDetails.lastName}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={savedDetails.email}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={savedDetails.phone}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    Province
                  </label>
                  <select
                    name="province"
                    value={savedDetails.province}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  >
                    <option value="">Select Province</option>
                    {provinceOptions.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    District
                  </label>
                  <select
                    name="district"
                    value={savedDetails.district}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                    disabled={!savedDetails.province}
                  >
                    <option value="">Select District</option>
                    {districtOptions.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    City / Municipality
                  </label>
                  <select
                    name="city"
                    value={savedDetails.city}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                    disabled={!savedDetails.province}
                  >
                    <option value="">Select City / Municipality</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    Area / Tole
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={savedDetails.area}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    Ward Number
                  </label>
                  <input
                    type="text"
                    name="wardNumber"
                    value={savedDetails.wardNumber}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={savedDetails.landmark}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    House / Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={savedDetails.address}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 text-white px-4 py-3 tracking-wider focus:border-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-400">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={savedDetails.postalCode}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-700 bg-gray-800 text-white px-4 py-3 tracking-wider focus:border-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 tracking-widest uppercase">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="block w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 transition-colors tracking-wider uppercase text-sm"
                >
                  View Orders
                </Link>
                <Link
                  to="/shop"
                  className="block w-full text-left px-4 py-3 bg-gray-800 hover:bg-gray-700 transition-colors tracking-wider uppercase text-sm"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full text-left px-4 py-3 bg-red-900/30 hover:bg-red-900/50 text-red-600 transition-colors tracking-wider uppercase text-sm disabled:opacity-50"
                >
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 tracking-widest uppercase">
                Account Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 tracking-wider uppercase">
                    Total Orders
                  </span>
                  <span className="font-medium tracking-wider">{stats.orders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 tracking-wider uppercase">
                    Wishlist Items
                  </span>
                  <span className="font-medium tracking-wider">{stats.wishlist}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 tracking-wider uppercase">
                    Reviews Written
                  </span>
                  <span className="font-medium tracking-wider">{stats.reviews}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
