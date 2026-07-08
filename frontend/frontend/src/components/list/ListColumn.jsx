import CardItem from "../card/CardItem";

function ListColumn({ list, cards }) {
  const listCards = cards.filter(
    (card) => card.list_id === list.id
  );

  return (
    <div
      style={{
        width: 320,
        minWidth: 320,
        background: "rgba(255,255,255,.06)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 18,
        padding: 18,
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "#fff",
            fontSize: 17,
          }}
        >
          {list.title}
        </h3>

        <div
          style={{
            background: "#2563eb",
            color: "#fff",
            borderRadius: 30,
            minWidth: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {listCards.length}
        </div>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          minHeight: 80,
        }}
      >
        {listCards.length === 0 ? (
          <div
            style={{
              color: "#94a3b8",
              textAlign: "center",
              padding: 20,
            }}
          >
            No tasks
          </div>
        ) : (
          listCards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
            />
          ))
        )}
      </div>

      <button
        style={{
          marginTop: 18,
          width: "100%",
          padding: 12,
          borderRadius: 12,
          border: "1px dashed rgba(255,255,255,.15)",
          background: "transparent",
          color: "#cbd5e1",
          cursor: "pointer",
          fontWeight: 600,
          transition: ".2s",
        }}
      >
        + Add Task
      </button>
    </div>
  );
}

export default ListColumn;