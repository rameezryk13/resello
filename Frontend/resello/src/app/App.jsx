import { BrowserRouter as Router, useLocation } from "react-router-dom";
import Footer from "@/components/layout/Footer/Footer";
import ScrollToTop from "@/components/layout/ScrollToTop";
import AppRoutes from "./routes/AppRoutes";

// Auth is a focused, single-task screen: the site footer's link farm — half of
// which bounces a signed-out visitor straight back to /login — is only in the
// way there. Those two pages carry their own logo link home instead.
const CHROME_FREE_PATHS = ["/login", "/signup"];

const SiteFooter = () => {
  const { pathname } = useLocation();
  return CHROME_FREE_PATHS.includes(pathname) ? null : <Footer />;
};

// The app shell: router, the route table, and the chrome that persists across
// every route. Header is deliberately not here — the five static/legal pages
// render their own hero instead, so each page brings its own header.
const App = () => (
  <Router>
    <ScrollToTop />
    <div className="app-shell">
      <AppRoutes />
      <SiteFooter />
    </div>
  </Router>
);

export default App;
