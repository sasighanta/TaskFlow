function CardItem({ card }) {
  const priorityColor = {
    High: "#ef4444",
    Medium: "#f59e0b",
    Low: "#22c55e",
  };

  const priority = card.priority || "Medium";

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: 14,
        padding: 16,
        cursor: "pointer",
        transition: "all .25s ease",
        boxShadow: "0 8px 20px rgba(15,23,42,.08)",
        border: "1px solid #e5e7eb",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 14px 30px rgba(15,23,42,.16)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 8px 20px rgba(15,23,42,.08)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <span
          style={{
            background: priorityColor[priority],
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {priority}
        </span>

        <span
          style={{
            color: "#9ca3af",
            fontSize: 12,
          }}
        >
          #{card.id}
        </span>
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: 16,
          color: "#111827",
          marginBottom: 10,
        }}
      >
        {card.title}
      </div>

      {card.description && (
        <div
          style={{
            color: "#6b7280",
            fontSize: 13,
            lineHeight: 1.5,
            marginBottom: 14,
          }}
        >
          {card.description}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
        }}
      >
        <span
          style={{
            color: "#64748b",
          }}
        >
          📅 {card.due_date ? "Due Soon" : "No Due Date"}
        </span>

        <span
          style={{
            color: "#2563eb",
            fontWeight: 600,
          }}
        >
          {card.tag_label || "Task"}
        </span>
      </div>
    </div>
  );
}

export default CardItem;