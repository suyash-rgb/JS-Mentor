import './Card.css';
import LockIcon from '@mui/icons-material/Lock';

const Card = ({ heading, links, isLocked }) => {
  
  if (!links || !Array.isArray(links)) {
    return <div className="card">Error: Invalid links data</div>;
  }

  return (
    <div className={`card ${isLocked ? 'locked' : ''}`}>
      {isLocked && (
        <div className="card-lock-overlay">
          <LockIcon sx={{ fontSize: 40, color: '#94a3b8' }} />
          <span>Locked</span>
        </div>
      )}
      {heading && <h3 className="card-heading">{heading}</h3>}
      <div className="card-links">
        {links.map((link, index) => (
          isLocked ? (
            <span key={index} className="card-link disabled-link">
              {link.text}
            </span>
          ) : (
            <a 
              key={index}
              href={link.url} 
              className="card-link"
            >
              {link.text}
            </a>
          )
        ))}
      </div>
    </div>
  );
};

export default Card;


