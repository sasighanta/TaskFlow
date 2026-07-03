function StatCard({ icon, title, value, color }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 200,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: "22px",
        transition: "0.25s ease",
        cursor: "default",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow =
          "0 18px 45px rgba(0,0,0,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 10px 30px rgba(0,0,0,0.15)";
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          marginBottom: 18,
        }}
      >
        {icon}
      </div>

      <div
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: 13,
          marginBottom: 8,
          fontWeight: 500,
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#fff",
          fontSize: 30,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default StatCard;