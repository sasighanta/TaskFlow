import { useState } from "react";

function BoardCard({
  board,
  onOpen,
  onDelete,
  onRename,
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 260,
        height: 165,
        borderRadius: 18,
        padding: 20,
        cursor: "pointer",
        background: hovered
          ? "linear-gradient(135deg,#2563eb,#7c3aed)"
          : "rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "0.25s",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 34,
            marginBottom: 12,
          }}
        >
          📋
        </div>

        <div
          style={{
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 8,
          }}
        >
          {board.title}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,.65)",
            fontSize: 13,
          }}
        >
          {board.card_count || 0} Cards • {board.list_count || 0} Lists
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => onOpen(board)}
          style={{
            background: "#fff",
            color: "#111827",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Open
        </button>

        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={() => onRename(board)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ✏️
          </button>

          <button
            onClick={() => onDelete(board)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoardCard;