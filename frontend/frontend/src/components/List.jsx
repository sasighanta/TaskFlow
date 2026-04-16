import Card from "./Card";

function List({ list, cards }) {
  return (
    <div className="bg-white p-4 rounded w-64 shadow">
      <h2 className="font-bold mb-3">{list.title}</h2>

      {cards
        .filter((card) => card.list_id === list.id)
        .map((card) => (
          <Card key={card.id} card={card} />
        ))}
    </div>
  );
}

export default List;