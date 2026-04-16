function Card({ card }) {
  return (
    <div className="bg-gray-100 p-2 mb-2 rounded">
      {card.title}
    </div>
  );
}

export default Card;