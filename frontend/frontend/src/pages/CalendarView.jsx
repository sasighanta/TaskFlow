import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

function CalendarView({
  cards,
  onBack,
  onCardClick,
}) {
  const events = cards
    .filter((card) => card.due_date)
    .map((card) => ({
      id: card.id,
      title: card.title,
      date: card.due_date,
      extendedProps: {
        card,
      },
    }));

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#0f172a,#1e293b,#111827)",
        padding: 30,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}
      >
        <div>
          <h1
            style={{
              color: "#fff",
              margin: 0,
              fontSize: 34,
            }}
          >
            Calendar View
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginTop: 8,
            }}
          >
            View tasks by due date.
          </p>
        </div>

        <button
          onClick={onBack}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ← Back to Board
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 20,
        }}
      >
        <FullCalendar
          plugins={[
            dayGridPlugin,
            interactionPlugin,
          ]}
          initialView="dayGridMonth"
          height="80vh"
          events={events}
          eventClick={(info) =>
            onCardClick(info.event.extendedProps.card)
          }
        />
      </div>
    </div>
  );
}

export default CalendarView;