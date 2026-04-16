import Card from "./Card";

function List({ list, cards }) {
  const listCards = cards.filter((card) => card.list_id === list.id);

  return (
    <div className="list-col">
      {/* Column Header */}
      <div className="list-header">
        <span className="list-title">{list.title}</span>
        <span className="list-count">{listCards.length}</span>
      </div>

      {/* Cards */}
      <div className="list-body">
        {listCards.length === 0 ? (
          <p className="no-cards">No cards yet</p>
        ) : (
          listCards.map((card) => <Card key={card.id} card={card} />)
        )}
      </div>

      {/* Add card */}
      <button className="add-card-btn">+ Add a card</button>
    </div>
  );
}

export default List;