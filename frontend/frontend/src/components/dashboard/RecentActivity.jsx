function RecentActivity() {
  const activities = [
    {
      icon: "✅",
      title: "Completed Login Module",
      time: "5 mins ago",
    },
    {
      icon: "📋",
      title: "Created Backend API",
      time: "18 mins ago",
    },
    {
      icon: "🚀",
      title: "Updated Analytics",
      time: "1 hour ago",
    },
    {
      icon: "📝",
      title: "Added New Task",
      time: "Today",
    },
  ];

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: 24,
        marginTop: 40,
      }}
    >
      <h2
        style={{
          color: "#fff",
          margin: 0,
          marginBottom: 20,
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        Recent Activity
      </h2>

      {activities.map((item, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 0",
            borderBottom:
              index !== activities.length - 1
                ? "1px solid rgba(255,255,255,0.08)"
                : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              {item.icon}
            </div>

            <span
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              {item.title}
            </span>
          </div>

          <span
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
            }}
          >
            {item.time}
          </span>
        </div>
      ))}
    </div>
  );
}

export default RecentActivity;