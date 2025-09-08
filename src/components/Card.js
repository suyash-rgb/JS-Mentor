import './Card.css';

const Card = ({ heading, links }) => {
  
  if (!links || !Array.isArray(links)) {
    return <div className="card">Error: Invalid links data</div>;
  }

  return (
    <div className="card">
      {heading && <h3 className="card-heading">{heading}</h3>}
      <div className="card-links">
        {links.map((link, index) => (
          <a 
            key={index}
            href={link.url} 
            className="card-link"
          >
            {link.text}
          </a>
        ))}
      </div>
    </div>
  );
};

export default Card;


