function DashboardHeader({
  username,
  avatarLetter,
  onLogout,
  onWorkspace,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 34px",
        background: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: 30,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-1px",
          cursor: "pointer",
        }}
      >
        <span style={{ color: "#60a5fa" }}>Task</span>
        <span>Flow</span>
      </div>

      {/* Right Side */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <button
          onClick={onWorkspace}
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "10px 18px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
            transition: "0.2s",
          }}
        >
          ⚙ Workspace
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#2563eb,#7c3aed)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            {avatarLetter}
          </div>

          <span
            style={{
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {username}
          </span>
        </div>

        <button
          onClick={onLogout}
          style={{
            background: "#ef4444",
            color: "#fff",
            border: "none",
            padding: "10px 18px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;