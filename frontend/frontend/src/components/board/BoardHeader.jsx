function BoardHeader({
  boardTitle,
  username,
  onBack,
  onLogout,
  onShowAnalytics,
  onShowActivity,
  children,
}) {
  const avatarLetter = username?.charAt(0).toUpperCase() || "?";

  const buttonStyle = {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#fff",
    padding: "8px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    transition: "0.2s",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 28px",
        background: "rgba(15,23,42,0.75)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <button onClick={onBack} style={buttonStyle}>
          ← Dashboard
        </button>

        <div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#fff",
            }}
          >
            {boardTitle}
          </div>

          <div
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 13,
            }}
          >
            Project Board
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button onClick={onShowAnalytics} style={buttonStyle}>
          📊 Analytics
        </button>

        <button onClick={onShowActivity} style={buttonStyle}>
          📋 Activity
        </button>

        {children}

        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {avatarLetter}
        </div>

        <button
          onClick={onLogout}
          style={{
            ...buttonStyle,
            background: "#ef4444",
            border: "none",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default BoardHeader;