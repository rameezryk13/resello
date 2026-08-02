const LegalSections = ({ sections }) => (
  <div className="sp-card">
    {sections.map((section) => (
      <section key={section.title} className="sp-legal-section">
        <h2>{section.title}</h2>
        {section.prefix && <p>{section.prefix}</p>}
        {section.content && <p>{section.content}</p>}
        {section.list && <ul>{section.list.map((item) => <li key={item}>{item}</li>)}</ul>}
        {section.footer && <p className="sp-legal-footer">{section.footer}</p>}
      </section>
    ))}
  </div>
);

export default LegalSections;
