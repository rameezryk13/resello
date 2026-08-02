import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Events.css";

const Events = ({ posters = [] }) => {
  const navigate = useNavigate();
  const [currentPoster, setCurrentPoster] = useState(0);

  useEffect(() => {
    setCurrentPoster((index) => (index < posters.length ? index : 0));
  }, [posters.length]);

  useEffect(() => {
    if (posters.length < 2) return undefined;
    const timer = window.setInterval(
      () => setCurrentPoster((index) => (index + 1) % posters.length),
      4000
    );
    return () => window.clearInterval(timer);
  }, [posters.length]);

  const poster = posters[currentPoster];
  if (!poster) return null;

  const goToEvent = () => {
    if (poster.id !== undefined && poster.id !== null) {
      navigate(`/event/${poster.id}`);
    }
  };

  return (
    <section className="events" aria-label="Featured events">
      <div
        className="events__banner"
        style={{ backgroundImage: `url(${poster.img})`, cursor: "pointer" }}
        role="button"
        tabIndex={0}
        aria-label={`Open ${poster.btnText} event`}
        onClick={goToEvent}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToEvent();
          }
        }}
      >
        <div className="events__content" key={currentPoster}>
          <h2>{poster.title.split("\n").map((line) => <span key={line}>{line}<br /></span>)}</h2>
          <p>{poster.desc}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToEvent();
            }}
          >
            {poster.btnText}
          </button>
        </div>
        <div className="events__dots" aria-label="Choose event">
          {posters.map((item, index) => (
            <button
              type="button"
              key={item.id || index}
              aria-label={`Show event ${index + 1}`}
              aria-current={index === currentPoster}
              className={index === currentPoster ? "is-active" : ""}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPoster(index);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Events;
