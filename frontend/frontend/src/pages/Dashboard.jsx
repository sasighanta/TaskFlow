import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import WorkspaceSettings from "../WorkspaceSettings";

import StatCard from "../components/dashboard/StatCard";
import BoardCard from "../components/dashboard/BoardCard";
import RecentActivity from "../components/dashboard/RecentActivity";

import CreateBoardModal from "../components/modals/CreateBoardModal";
import EmptyState from "../components/common/EmptyState";

import {
  getBoards,
  createBoard,
  deleteBoard,
} from "../services/boardService";

function Dashboard({
  user,
  onOpenBoard,
  onLogout,
}) {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const avatarLetter =
    user?.username?.charAt(0).toUpperCase() || "?";

  const activeWorkspaceId = 1;

  const loadBoards = async () => {
    try {
      setLoading(true);

      const data = await getBoards(user.id);

      setBoards(data);
    } catch (err) {
      console.error(err);
      toast.error("Unable to load boards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoards();
  }, []);

  const totalCards = useMemo(() => {
    return boards.reduce(
      (sum, b) => sum + Number(b.card_count || 0),
      0
    );
  }, [boards]);

  const totalLists = useMemo(() => {
    return boards.reduce(
      (sum, b) => sum + Number(b.list_count || 0),
      0
    );
  }, [boards]);

  const handleCreateBoard = async (title) => {
    try {
      await createBoard(title, user.id);

      toast.success("Board created");

      loadBoards();
    } catch {
      toast.error("Unable to create board");
    }
  };

  const handleDeleteBoard = async (board) => {
    if (
      !window.confirm(
        `Delete "${board.title}"?`
      )
    )
      return;

    try {
      await deleteBoard(board.id);

      toast.success("Board deleted");

      loadBoards();
    } catch {
      toast.error("Unable to delete");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#0f172a,#1e293b,#111827)",
        fontFamily:
          "'Segoe UI',sans-serif",
      }}
    >
      <Toaster position="bottom-right" />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 40px",
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
            Welcome back,
            {" "}
            {user.username}
            👋
          </h1>

          <p
            style={{
              color:
                "rgba(255,255,255,.65)",
              marginTop: 8,
            }}
          >
            Manage your boards and projects.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() =>
              setShowSettings(true)
            }
          >
            ⚙ Workspace
          </button>

          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#2563eb,#7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {avatarLetter}
          </div>

          <button onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <div
        style={{
          padding: "0 40px",
          display: "grid",
          gridTemplateColumns:
            "repeat(3,1fr)",
          gap: 20,
          marginBottom: 36,
        }}
      >
        <StatCard
          title="Boards"
          value={boards.length}
          icon="📁"
          color="#2563eb"
        />

        <StatCard
          title="Lists"
          value={totalLists}
          icon="📋"
          color="#7c3aed"
        />

        <StatCard
          title="Cards"
          value={totalCards}
          icon="✅"
          color="#10b981"
        />
      </div>

      <div
        style={{
          padding: "0 40px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            color: "#fff",
          }}
        >
          My Boards
        </h2>

        <button
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          + Create Board
        </button>
      </div>

      <div
        style={{
          padding: "0 40px 40px",
        }}
      >
        {boards.length === 0 && !loading ? (
          <EmptyState
            title="No Boards Yet"
            subtitle="Create your first project board."
            buttonText="Create Board"
            onClick={() =>
              setShowCreateModal(true)
            }
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 20,
            }}
          >
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onOpen={() =>
                  onOpenBoard(board)
                }
                onDelete={handleDeleteBoard}
                onRename={() =>
                  toast("Rename coming next 🚀")
                }
              />
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          padding: "0 40px 40px",
        }}
      >
        <RecentActivity
          activities={[
            {
              message: "Welcome to TaskFlow",
              time: "Just now",
            },
            {
              message: "Multiple Boards enabled",
              time: "Today",
            },
          ]}
        />
      </div>

      <CreateBoardModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateBoard}
      />

      {showSettings && (
        <WorkspaceSettings
          workspaceId={activeWorkspaceId}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;