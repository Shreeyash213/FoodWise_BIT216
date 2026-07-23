"use client";

import { useEffect, useState } from "react";
import { HouseholdMember, seedHouseholdMembers } from "@/lib/data";
import ThemeToggle from "@/components/ThemeToggle";
import { UserPlus, Trash2, Edit2, Check, X, Shield, Users } from "lucide-react";

const initialPrivacySettings = [
  { label: "Share my inventory with the household", on: true },
  { label: "Share purchase history", on: true },
  { label: "Let others edit items I added", on: false },
  { label: "Include my usage in analytics", on: true },
];

const rolesList = ["Owner", "Member", "Chef", "Guest"];
const privacyOptions = ["Shares full inventory", "Shares purchases only", "Private"];

export default function SettingsPage() {
  const [members, setMembers] = useState<HouseholdMember[]>(seedHouseholdMembers);
  const [privacySettings, setPrivacySettings] = useState(initialPrivacySettings);
  const [loading, setLoading] = useState(true);

  // Form states for adding member
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    role: "Member",
    privacy: "Shares full inventory",
  });

  // Editing member state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    role: "Member",
    privacy: "Shares full inventory",
  });

  const loadMembers = () => {
    setLoading(true);
    fetch("/api/household")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data);
        }
      })
      .catch((err) => console.error("Failed to load household members:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const toggleSetting = (index: number) => {
    setPrivacySettings((current) =>
      current.map((setting, i) =>
        i === index ? { ...setting, on: !setting.on } : setting
      )
    );
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    try {
      const res = await fetch("/api/household", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });
      const data = await res.json();

      if (res.ok && data.member) {
        setMembers((prev) => [...prev, data.member]);
        setNewMember({ name: "", role: "Member", privacy: "Shares full inventory" });
        setShowAddForm(false);
      } else {
        alert(data.error || "Failed to add member");
      }
    } catch (err) {
      console.error("Failed to add member:", err);
      alert("Error adding household member.");
    }
  };

  const startEdit = (m: HouseholdMember) => {
    setEditingId(m.id || m.name);
    setEditForm({
      role: m.role || "Member",
      privacy: m.privacy || "Shares full inventory",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (member: HouseholdMember) => {
    const targetId = member.id || member.name;
    try {
      const res = await fetch("/api/household", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: member.id,
          name: member.name,
          role: editForm.role,
          privacy: editForm.privacy,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) =>
            (m.id === member.id || m.name === member.name)
              ? { ...m, role: editForm.role, privacy: editForm.privacy }
              : m
          )
        );
        setEditingId(null);
      } else {
        alert(data.error || "Failed to update member");
      }
    } catch (err) {
      console.error("Failed to update member:", err);
      alert("Error updating member.");
    }
  };

  const handleDeleteMember = async (member: HouseholdMember) => {
    if (!confirm(`Are you sure you want to remove ${member.name} from the household?`)) {
      return;
    }

    const idOrName = member.id || member.name;
    try {
      const res = await fetch(`/api/household?id=${encodeURIComponent(idOrName)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMembers((prev) => prev.filter((m) => (m.id ? m.id !== member.id : m.name !== member.name)));
      } else {
        alert("Failed to delete household member.");
      }
    } catch (err) {
      console.error("Failed to delete member:", err);
      alert("Error removing household member.");
    }
  };

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 max-w-3xl">
      <header className="mb-8">
        <p className="label-stamp font-mono text-[11px] text-sage-dim">Settings</p>
        <h1 className="font-display text-3xl md:text-4xl mt-1 text-paper">Settings</h1>
        <p className="text-sage mt-2">
          Manage household members, privacy preferences, and app options.
        </p>
      </header>

      {/* Household members section */}
      <section className="rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-gold" />
            <h2 className="font-display text-lg text-paper">Household members</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold rounded-full bg-gold/10 text-gold hover:bg-gold/20 px-3 py-1.5 transition"
          >
            <UserPlus size={14} />
            {showAddForm ? "Cancel" : "Add Member"}
          </button>
        </div>

        {/* Add member form */}
        {showAddForm && (
          <form
            onSubmit={handleAddMember}
            className="mb-5 p-4 rounded-xl bg-shelf/50 border border-sage-dim/20 space-y-3"
          >
            <p className="text-xs font-mono uppercase tracking-wider text-sage-dim">
              New Household Member
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs text-sage block mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full text-sm rounded-lg bg-surface border border-sage-dim/20 px-3 py-2 text-paper outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="text-xs text-sage block mb-1">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full text-sm rounded-lg bg-surface border border-sage-dim/20 px-3 py-2 text-paper outline-none focus:border-gold"
                >
                  {rolesList.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-sage block mb-1">Privacy Level</label>
                <select
                  value={newMember.privacy}
                  onChange={(e) => setNewMember({ ...newMember, privacy: e.target.value })}
                  className="w-full text-sm rounded-lg bg-surface border border-sage-dim/20 px-3 py-2 text-paper outline-none focus:border-gold"
                >
                  {privacyOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 text-xs text-sage hover:text-paper"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gold text-shelf hover:brightness-110"
              >
                Save Member
              </button>
            </div>
          </form>
        )}

        {/* Member list */}
        {loading ? (
          <p className="text-sm text-sage-dim py-4">Loading household members...</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-sage-dim py-4">No household members added yet.</p>
        ) : (
          <ul className="divide-y divide-sage-dim/10">
            {members.map((m) => {
              const memberKey = m.id || m.name;
              const isEditing = editingId === memberKey;

              return (
                <li key={memberKey} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-paper text-sm font-medium">{m.name}</p>
                      {!isEditing && (
                        <span className="text-[10px] font-mono uppercase bg-gold/10 text-gold px-2 py-0.5 rounded-md">
                          {m.role}
                        </span>
                      )}
                    </div>
                    {!isEditing && (
                      <p className="text-sage-dim text-xs mt-0.5">{m.privacy}</p>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="text-xs rounded-lg bg-shelf border border-sage-dim/20 px-2 py-1 text-paper"
                      >
                        {rolesList.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editForm.privacy}
                        onChange={(e) => setEditForm({ ...editForm, privacy: e.target.value })}
                        className="text-xs rounded-lg bg-shelf border border-sage-dim/20 px-2 py-1 text-paper"
                      >
                        {privacyOptions.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(m)}
                        className="p-1 rounded bg-gold text-shelf hover:brightness-110"
                        title="Save"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="p-1 rounded bg-shelf text-sage hover:text-paper"
                        title="Cancel"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        className="p-1.5 text-sage-dim hover:text-gold transition"
                        title="Edit Member"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(m)}
                        className="p-1.5 text-sage-dim hover:text-red-400 transition"
                        title="Remove Member"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Privacy settings section */}
      <section className="rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={20} className="text-gold" />
            <h2 className="font-display text-lg text-paper">Privacy preferences</h2>
          </div>
          <span className="text-sm text-sage-dim">Tap to toggle</span>
        </div>
        <div className="space-y-4">
          {privacySettings.map((row, index) => (
            <button
              key={row.label}
              type="button"
              onClick={() => toggleSetting(index)}
              className="flex w-full items-center justify-between rounded-2xl bg-shelf/70 px-4 py-4 text-left transition hover:bg-shelf"
            >
              <div>
                <p className="text-sm text-paper">{row.label}</p>
              </div>
              <div
                className={`h-6 w-10 rounded-full p-0.5 flex transition ${
                  row.on ? "bg-gold justify-end" : "bg-shelf justify-start ring-1 ring-sage-dim/30"
                }`}
              >
                <span
                  className="h-5 w-5 rounded-full bg-shelf block transition"
                  style={row.on ? { backgroundColor: "#1F2A22" } : { backgroundColor: "#8FA38C" }}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Appearance section */}
      <section className="rounded-2xl bg-surface ring-1 ring-sage-dim/15 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg text-paper">Appearance</h2>
          <span className="text-sm text-sage-dim">Theme</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-paper">Dark / Light mode</p>
          <ThemeToggle />
        </div>
      </section>
    </div>
  );
}
