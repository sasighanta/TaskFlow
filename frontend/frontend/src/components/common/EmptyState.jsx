function EmptyState({
  title,
  subtitle,
  buttonText,
  onClick,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        border: "2px dashed rgba(255,255,255,0.15)",
        borderRadius: 20,
        background: "rgba(255,255,255,0.05)",
      }}
    >
      <div
        style={{
          fontSize: 52,
          marginBottom: 18,
        }}
      >
        📁
      </div>

      <h2
        style={{
          color: "#fff",
          margin: 0,
          fontSize: 24,
        }}
      >
        {title}
      </h2>

      <p
        style={{
          color: "rgba(255,255,255,0.65)",
          marginTop: 10,
          marginBottom: 24,
        }}
      >
        {subtitle}
      </p>

      <button
        onClick={onClick}
        style={{
          background: "#2563eb",
          color: "#fff",
          border: "none",
          padding: "12px 24px",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default EmptyState;