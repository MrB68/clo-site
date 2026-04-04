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

export function Profile() {
  const { user, signOut } = useAuth();
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

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white text-black p-8 rounded-lg shadow-lg max-w-md w-full text-center"
        >
          <h1 className="text-2xl font-bold mb-4 tracking-widest uppercase">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-6 tracking-wider">
            Please sign in to view your profile.
          </p>
          <Link
            to="/signin"
            className="inline-block bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors tracking-widest uppercase text-sm"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  const handleSignOut = () => {
    setIsSigningOut(true);
    setTimeout(() => {
      signOut();
    }, 500);
  };

  const derivedName = useMemo(() => {
    const fullName = (user.name || "").trim();
    const parts = fullName.split(/\s+/);

    return {
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
    };
  }, [user.name]);

  const provinceOptions = Object.keys(nepalLocations);
  const districtOptions = savedDetails.province
    ? nepalLocations[savedDetails.province]?.districts ?? []
    : [];
  const cityOptions = savedDetails.province
    ? nepalLocations[savedDetails.province]?.cities ?? []
    : [];

  useEffect(() => {
    const storedProfile = getCustomerProfile(user.id);

    if (storedProfile) {
      setSavedDetails(storedProfile);
      return;
    }

    setSavedDetails((current) => ({
      ...current,
      firstName: derivedName.firstName,
      lastName: derivedName.lastName,
      email: user.email,
    }));
  }, [derivedName.firstName, derivedName.lastName, user.email, user.id]);

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

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSavedDetails((current) => ({
        ...current,
        profileImage: typeof reader.result === "string" ? reader.result : "",
      }));
      toast.success("Profile picture added");
    };
    reader.onerror = () => {
      toast.error("Unable to read the selected image");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDetails = () => {
    saveCustomerProfile(user.id, {
      ...savedDetails,
      email: savedDetails.email.trim() || user.email,
    });
    toast.success("Profile details saved for checkout");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6 tracking-widest uppercase">
                Account Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 overflow-hidden rounded-full bg-black flex items-center justify-center">
                      {savedDetails.profileImage ? (
                        <img
                          src={savedDetails.profileImage}
                          alt={user.name || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={28} className="text-white" />
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-md transition hover:bg-gray-100">
                      <Camera size={14} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-medium tracking-wider">{user.name || "User"}</h3>
                    <p className="text-sm text-gray-500 tracking-wider uppercase">
                      Member since N/A
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 tracking-wider uppercase">
                  Click the camera icon to upload your profile picture.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-500">
                      Full Name
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <User size={16} className="text-gray-400" />
                      <span className="tracking-wider">{user.name || "User"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-500">
                      Email Address
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <Mail size={16} className="text-gray-400" />
                      <span className="tracking-wider">{user.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-500">
                      Member Since
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="tracking-wider">N/A</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 tracking-wider uppercase text-gray-500">
                      Account Status
                    </label>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="tracking-wider text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-widest uppercase">
                    Checkout Details
                  </h2>
                  <p className="text-sm text-gray-600 tracking-wider">
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
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={savedDetails.firstName}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={savedDetails.lastName}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={savedDetails.email}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={savedDetails.phone}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    Province
                  </label>
                  <select
                    name="province"
                    value={savedDetails.province}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
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
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    District
                  </label>
                  <select
                    name="district"
                    value={savedDetails.district}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
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
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    City / Municipality
                  </label>
                  <select
                    name="city"
                    value={savedDetails.city}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
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
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    Area / Tole
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={savedDetails.area}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    Ward Number
                  </label>
                  <input
                    type="text"
                    name="wardNumber"
                    value={savedDetails.wardNumber}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={savedDetails.landmark}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    House / Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={savedDetails.address}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium uppercase tracking-wider text-gray-500">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={savedDetails.postalCode}
                    onChange={handleDetailsChange}
                    className="w-full rounded border border-gray-300 px-4 py-3 tracking-wider focus:border-black focus:outline-none"
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 tracking-widest uppercase">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  to="/orders"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors tracking-wider uppercase text-sm"
                >
                  View Orders
                </Link>
                <Link
                  to="/shop"
                  className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors tracking-wider uppercase text-sm"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 transition-colors tracking-wider uppercase text-sm disabled:opacity-50"
                >
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
                </button>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold mb-4 tracking-widest uppercase">
                Account Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 tracking-wider uppercase">
                    Total Orders
                  </span>
                  <span className="font-medium tracking-wider">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 tracking-wider uppercase">
                    Wishlist Items
                  </span>
                  <span className="font-medium tracking-wider">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 tracking-wider uppercase">
                    Reviews Written
                  </span>
                  <span className="font-medium tracking-wider">0</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
