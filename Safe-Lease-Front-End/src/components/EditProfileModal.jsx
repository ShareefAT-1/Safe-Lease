import React, { useState, useEffect } from "react";
import axiosbase from "../config/axios-config";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { getImageUrl } from "../utils/getImageUrl";

const PRESET_AVATARS = [
  "https://placehold.co/200x200/7c3aed/ffffff?text=Funny+1",
  "https://placehold.co/200x200/06b6d4/ffffff?text=Funny+2",
  "https://placehold.co/200x200/f97316/ffffff?text=Funny+3",
  "https://placehold.co/200x200/ef4444/ffffff?text=Funny+4",
  "https://placehold.co/200x200/10b981/ffffff?text=Funny+5",
];

const EditProfileModal = ({ user, onClose, onSaved }) => {
  const { refreshUser } = useAuth?.() || {};

  const [name, setName] = useState(user.name || "");
  const [bio, setBio] = useState(user.bio || "");
  const [file, setFile] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user.name || "");
    setBio(user.bio || "");
  }, [user]);

  useEffect(() => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [file]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setSelectedPreset(null);
    }
  };

  const handlePickPreset = (url) => {
    setSelectedPreset(url);
    setFile(null);
  };


  const uploadAvatar = async (userId) => {
    if (!file) return null;

    const fd = new FormData();
    fd.append("avatar", file);

    const res = await axiosbase.post(`/api/users/${userId}/avatar`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data.profilePic || null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = null;

      if (file) {
        avatarUrl = await uploadAvatar(user._id);
      } else if (selectedPreset) {
        avatarUrl = selectedPreset;
      }

      const payload = {};

      if (name.trim() && name.trim() !== user.name) {
        payload.name = name.trim();
      }

      if ((bio || "") !== (user.bio || "")) {
        payload.bio = bio.trim();
      }

      if (avatarUrl && avatarUrl !== user.profilePic) {
        payload.profilePic = avatarUrl;
      }

      if (Object.keys(payload).length === 0) {
        toast("Nothing changed");
        setSaving(false);
        return;
      }

      const res = await axiosbase.put(`/api/users/${user._id}`, payload);
      const updatedUser = res.data;


      refreshUser?.(updatedUser);
      onSaved?.(updatedUser);
      toast.success("Profile updated");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0c1322] border border-white/6 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Edit Profile</h3>
          <button onClick={onClose} className="text-white/80">
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Display Avatar
            </label>

            <label className="relative size-40 shrink-0 rounded-full overflow-hidden border-2 border-white/10 cursor-pointer group flex items-center justify-center mx-auto">

              <img
                src={
                  file
                    ? URL.createObjectURL(file)
                    : selectedPreset ||
                    getImageUrl(user.profilePic) ||
                    "https://placehold.co/300x300/111827/FFFFFF?text=No+Img"
                }
                alt="avatar"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/300x300/111827/FFFFFF?text=No+Img";
                }}
              />


              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-white text-sm">Change</span>
              </div>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>

            <div className="text-xs text-slate-400 mt-3 text-center">
              Click avatar or choose a preset
            </div>

            <div className="flex gap-2 mt-3 justify-center overflow-x-auto">
              {PRESET_AVATARS.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePickPreset(p)}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 ${selectedPreset === p
                    ? "border-cyan-400"
                    : "border-white/10"
                    }`}
                >
                  <img
                    src={p}
                    alt="preset"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm text-slate-300">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#071028] border border-white/6 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300">Bio</label>
              <textarea
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#071028] border border-white/6 text-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-white/6 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
