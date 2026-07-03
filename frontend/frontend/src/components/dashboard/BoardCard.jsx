function BoardCard({ title, taskCount, onOpen }) {
  return (
    <div
      onClick={onOpen}
      style={{
        width: 260,
        height: 170,
        borderRadius: 20,
        padding: 22,
        cursor: "pointer",
        background: "linear-gradient(135deg,#2563eb,#4f46e5)",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        transition: "0.25s ease",
        boxShadow: "0 12px 30px rgba(37,99,235,0.35)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
        e.currentTarget.style.boxShadow =
          "0 22px 45px rgba(37,99,235,0.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.boxShadow =
          "0 12px 30px rgba(37,99,235,0.35)";
      }}
    >
      {/* Background circles */}
      <div
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          top: -30,
          right: -30,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
          bottom: -80,
          right: -60,
        }}
      />

      <div style={{ zIndex: 2 }}>
        <div
          style={{
            fontSize: 32,
            marginBottom: 16,
          }}
        >
          📁
        </div>

        <div
          style={{
            fontSize: 21,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {title}
        </div>

        <div
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: 14,
          }}
        >
          {taskCount} Tasks
        </div>
      </div>

      <div
        style={{
          zIndex: 2,
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        Open Board →
      </div>
    </div>
  );
}

export default BoardCard;