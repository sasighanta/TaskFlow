import { useState } from "react";

function CreateBoardModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState("");

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          background: "#fff",
          borderRadius: 18,
          padding: 24,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 18,
          }}
        >
          Create Board
        </h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Board name"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ddd",
            marginBottom: 20,
            boxSizing: "border-box",
            fontSize: 15,
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={() => {
              if (!title.trim()) return;

              onCreate(title);

              setTitle("");

              onClose();
            }}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateBoardModal;