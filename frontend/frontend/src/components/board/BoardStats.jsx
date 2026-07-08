function BoardStats({
  totalLists = 0,
  totalCards = 0,
  completed = 0,
}) {
  const progress =
    totalCards === 0
      ? 0
      : Math.round((completed / totalCards) * 100);

  const Stat = ({ title, value, color }) => (
    <div
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div
        style={{
          color: "#94a3b8",
          fontSize: 13,
          marginBottom: 8,
        }}
      >
        {title}
      </div>

      <div
        style={{
          color,
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <Stat
          title="Lists"
          value={totalLists}
          color="#38bdf8"
        />

        <Stat
          title="Tasks"
          value={totalCards}
          color="#22c55e"
        />

        <Stat
          title="Completed"
          value={completed}
          color="#f59e0b"
        />
      </div>

      <div
        style={{
          background: "rgba(255,255,255,.05)",
          borderRadius: 14,
          padding: 18,
          marginBottom: 30,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#fff",
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          <span>Project Progress</span>

          <span>{progress}%</span>
        </div>

        <div
          style={{
            height: 10,
            borderRadius: 20,
            background: "rgba(255,255,255,.08)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background:
                "linear-gradient(90deg,#3b82f6,#8b5cf6)",
              borderRadius: 20,
              transition: "0.4s",
            }}
          />
        </div>
      </div>
    </>
  );
}

export default BoardStats;