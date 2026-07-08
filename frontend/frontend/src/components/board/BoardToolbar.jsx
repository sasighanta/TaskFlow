import { useState } from "react";

function BoardToolbar({
  onSearch,
  onAddTask,
}) {
  const [search, setSearch] = useState("");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 28,
        gap: 18,
      }}
    >
      <input
        type="text"
        placeholder="🔍 Search tasks..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onSearch(e.target.value);
        }}
        style={{
          flex: 1,
          padding: "12px 18px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,.08)",
          background: "rgba(255,255,255,.06)",
          color: "#fff",
          fontSize: 14,
          outline: "none",
        }}
      />

      <button
        style={{
          padding: "12px 18px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,.08)",
          background: "rgba(255,255,255,.06)",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        🏷 Filter
      </button>

      <button
        onClick={onAddTask}
        style={{
          padding: "12px 22px",
          borderRadius: 12,
          border: "none",
          background:
            "linear-gradient(135deg,#2563eb,#7c3aed)",
          color: "#fff",
          cursor: "pointer",
          fontWeight: 700,
          boxShadow:
            "0 8px 20px rgba(59,130,246,.25)",
        }}
      >
        + Add Task
      </button>
    </div>
  );
}

export default BoardToolbar;