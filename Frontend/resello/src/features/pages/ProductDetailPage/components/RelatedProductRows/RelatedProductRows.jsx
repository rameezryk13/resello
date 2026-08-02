import Row from "../../../../../components/Row/Row.jsx";
import "./RelatedProductRows.css";

const RelatedProductRows = ({
  category,
  subCategory,
  relatedCat = [],
  relatedSub = [],
}) => (
  <div className="pdp-rows">
    <Row
      title={`Related category — ${category}`}
      products={relatedCat}
      showViewAll={false}
    />
    {subCategory ? (
      <Row
        title={`Subcategory — ${subCategory}`}
        products={relatedSub}
        showViewAll={false}
      />
    ) : null}
  </div>
);

export default RelatedProductRows;
