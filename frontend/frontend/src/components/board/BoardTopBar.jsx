function BoardTopBar({
  boardTitle = "Project",
  onBack,
  onInvite,
  onSettings,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 28,
      }}
    >
      <div>
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 14,
            marginBottom: 10,
          }}
        >
          ← Back to Dashboard
        </button>

        <h1
          style={{
            color: "#fff",
            fontSize: 34,
            margin: 0,
            fontWeight: 700,
          }}
        >
          {boardTitle}
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginTop: 8,
            fontSize: 14,
          }}
        >
          Organize tasks, collaborate with your team, and track progress.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
        }}
      >
        <button
          onClick={onInvite}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Invite
        </button>

        <button
          onClick={onSettings}
          style={{
            padding: "10px 18px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,.15)",
            background: "rgba(255,255,255,.05)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ⚙ Settings
        </button>
      </div>
    </div>
  );
}

export default BoardTopBar;