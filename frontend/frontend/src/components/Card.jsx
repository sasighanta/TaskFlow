function Card({ card }) {
  return (
    <div className="card-item">
      <span className="card-title">{card.title}</span>
      {card.tag && <span className="card-tag">{card.tag}</span>}
    </div>
  );
}

export default Card;