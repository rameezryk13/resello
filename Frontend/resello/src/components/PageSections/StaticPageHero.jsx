const StaticPageHero = ({ tag, title, description }) => (
  <div className="sp-hero">
    <div className="sp-hero-tag">{tag}</div>
    <h1>{title}</h1>
    <p>{description}</p>
  </div>
);

export default StaticPageHero;
