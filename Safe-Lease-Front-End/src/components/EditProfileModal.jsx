// src/components/EditProfileModal.jsx
import React, { useState } from "react";
import axiosbase from "../config/axios-config";
import toast from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

const PRESET_AVATARS = [
  // you can replace these with your assets or CDN-hosted images
  "https://placehold.co/200x200/7c3aed/ffffff?text=Funny+1",
  "https://placehold.co/200x200/06b6d4/ffffff?text=Funny+2",
  "https://placehold.co/200x200/f97316/ffffff?text=Funny+3",
  "https://placehold.co/200x200/ef4444/ffffff?text=Funny+4",
  "https://placehold.co/200x200/10b981/ffffff?text=Funny+5",
];

const EditProfileModal = ({ user, onClose, onSaved }) => {
  const { refreshUser } = useAuth?.() || {}; // optional
  const [name, setName] = useState(user.name || user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handlePickPreset = (url) => {
    setSelectedPreset(url);
    setFile(null);
  };

  const uploadAvatar = async (userId) => {
    if (!file) return selectedPreset || null;

    const fd = new FormData();
    fd.append("avatar", file);

    try {
      const res = await axiosbase.post(`/api/users/${userId}/avatar`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.profilePic || res.data.profilePicUrl || null;
    } catch (err) {
      console.error("avatar upload error", err);
      throw new Error("Avatar upload failed");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1) upload file if exists
      let avatarUrl = null;
      if (file) {
        avatarUrl = await uploadAvatar(user._id);
      } else if (selectedPreset) {
        // if preset chosen, we call backend to set that URL as profilePic
        // this requires a simple endpoint; else we'll PUT profile with preset url directly
        avatarUrl = selectedPreset;
      }

      // 2) update fields
      const payload = {
        name: name.trim(),
        bio: bio.trim(),
        profilePic: avatarUrl,
      };

      await axiosbase.put(`/api/users/${user._id}`, payload);

      // optionally refresh auth user in context
      refreshUser?.();

      onSaved(payload);
      onClose();
      toast.success("Profile saved");
    } catch (err) {
      console.error("save profile error", err);
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-2xl bg-[#0c1322] rounded-2xl border border-white/6 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">Edit Profile</h3>
          <button onClick={onClose} className="text-white/80"><FaTimes /></button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm text-slate-300">Display Avatar</label>

            <div className="mt-3">
              <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-white/6">
                <img
                  src={
                    file ? URL.createObjectURL(file) : (selectedPreset || user.profilePic || "https://placehold.co/300x300/111827/FFFFFF?text=No+Img")
                  }
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-3 space-y-2">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <div className="text-xs text-slate-400">Or pick a preset:</div>

                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {PRESET_AVATARS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePickPreset(p)}
                      className={`w-14 h-14 rounded-full overflow-hidden border-2 ${selectedPreset === p ? "border-cyan-400" : "border-white/6"}`}
                    >
                      <img src={p} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <label className="block text-sm text-slate-300">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-[#071028] border border-white/6 text-white" />

            <label className="block text-sm text-slate-300">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} className="w-full px-3 py-2 rounded-lg bg-[#071028] border border-white/6 text-white" />

            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700">
                {saving ? "Saving..." : "Save"}
              </button>
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/6 hover:bg-white/8">
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
