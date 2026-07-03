function RecentActivity({ activities = [] }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(14px)",
        borderRadius: 18,
        padding: 24,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <h3
        style={{
          color: "#fff",
          marginTop: 0,
          marginBottom: 18,
        }}
      >
        Recent Activity
      </h3>

      {activities.length === 0 ? (
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
          }}
        >
          No recent activity
        </div>
      ) : (
        activities.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom:
                index !== activities.length - 1
                  ? "1px solid rgba(255,255,255,.08)"
                  : "none",
            }}
          >
            <span style={{ color: "#fff" }}>
              {item.message}
            </span>

            <span
              style={{
                color: "rgba(255,255,255,.5)",
                fontSize: 12,
              }}
            >
              {item.time}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

export default RecentActivity;