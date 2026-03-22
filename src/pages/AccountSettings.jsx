import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  updateProfile,
  updatePassword,
  deleteAccount,
} from "../services/authService";
import { useAuthUser } from "@/hooks/use-auth-user";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { UserRoundPen } from "lucide-react";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function AccountSettings() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const user = useAuthUser();

  useEffect(() => {
    if (user) {
      setUsername(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateDetails = async () => {
    try {
      await updateProfile({ username, email });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error?.response?.data || "Update failed!");
    }
  };

  const handleChangePasswordClick = async () => {
    try {
      await updatePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error?.response?.data || "Password change failed!");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      toast.success("Account deleted successfully!");
      localStorage.clear();
      window.location.href = "/login";
    } catch (error) {
      toast.error("Failed to delete account!");
    }
  };

  return (
    <>
      <Link
        to="/dashboard"
        className="absolute top-6 left-6 w-12 h-12 flex items-center justify-center rounded-full bg-teal-100 hover:bg-green-100 shadow-lg transition"
      >
        <FaArrowLeft className="h-6 w-6 text-teal-700" />
      </Link>
      <div className="min-h-screen bg-gradient-to-br from-[#E0F7FA] to-[#F1F5F9] py-14 px-4 flex justify-center">
        <div className="w-full max-w-3xl backdrop-blur-lg bg-white/70 shadow-2xl border border-white/40 rounded-3xl p-10">
          <h1 className="text-4xl font-extrabold text-[#0A1A2F] mb-10 text-center drop-shadow">
            Account Settings
          </h1>

          {/* PROFILE PHOTO */}
          <section className="p-6 bg-white/70 shadow-lg rounded-2xl border border-gray-200 mb-8 transition hover:shadow-xl">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-teal-200/50">
                <UserRoundPen className="w-12 h-12 text-teal-600" />
              </div>
              <h2 className="text-2xl font-semibold text-[#0A1A2F] mb-4">
                Admin Account
              </h2>
            </div>
          </section>

          {/* UPDATE PROFILE */}
          <section className="p-6 bg-white/70 shadow-lg rounded-2xl border border-gray-200 mb-8 transition hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-[#0A1A2F] mb-4">
              Update Profile Details
            </h2>

            <label className="font-medium text-gray-800">Username</label>
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <label className="font-medium text-gray-800">Email</label>
            <input
              className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className="w-full mt-5 bg-[#008080] text-white py-3 rounded-xl shadow-md hover:bg-[#006666] transition font-semibold"
              onClick={handleUpdateDetails}
            >
              Update Details
            </button>
          </section>

          {/* CHANGE PASSWORD */}
          <section className="p-6 bg-white/70 shadow-lg rounded-2xl border border-gray-200 mb-8 transition hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-[#0A1A2F] mb-4">
              Change Password
            </h2>
            <label className="font-medium text-gray-800">
              Current Password
            </label>
            <div className="relative mb-5">
              <input
                type={showCurrentPw ? "text" : "password"}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition pr-12"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
              >
                {showCurrentPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <label className="font-medium text-gray-800">New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? "text" : "password"}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition pr-12"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setShowNewPw(!showNewPw)}
              >
                {showNewPw ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              className="w-full mt-5 bg-[#008080] text-white py-3 rounded-xl shadow-md hover:bg-[#006666] transition font-semibold"
              onClick={handleChangePasswordClick}
            >
              Update Password
            </button>
          </section>

          {/* DELETE ACCOUNT */}
          {/* <section className="p-6 bg-white/70 shadow-lg rounded-2xl border border-red-200 transition hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-red-700 mb-3">
              Account Deletion
            </h2>

            <p className="text-gray-800 mb-4 text-sm">
              <strong>Warning:</strong> This action is{" "}
              <strong>permenent</strong> and cannot be undo.
            </p>

            <button
              className="w-full bg-red-600 text-white py-3 rounded-xl shadow-md hover:bg-red-700 transition font-semibold"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </button>
          </section> */}
        </div>
      </div>
      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          handleDeleteAccount();
        }}
        title="Delete Account"
        message="Are you sure you want to delete your account"

      />
    </>
  );
}
