import Header from "../Header/Header";
// Owns the sp-* styles for every page built on this layout (About,
// Dropshipping, Reseller, Terms, Privacy). Previously each of those pages
// shipped its own byte-identical copy of this stylesheet.
import "./StaticPages.css";

const StaticPageLayout = ({ children }) => (
  <>
    <Header />
    <main className="static-page">{children}</main>
  </>
);

export default StaticPageLayout;
