function LoadingScreen({ message = "Loading..." }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg,#0f172a,#1e293b)",
        color: "#fff",
        fontSize: 18,
        fontWeight: 600,
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {message}
    </div>
  );
}

export default LoadingScreen;