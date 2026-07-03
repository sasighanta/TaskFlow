function StatCard({ title, value, icon, color }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 22,
        minWidth: 220,
        flex: 1,
        transition: "0.25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.background = "rgba(255,255,255,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            {title}
          </div>

          <div
            style={{
              color: "#fff",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            {value}
          </div>
        </div>

        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 16,
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;