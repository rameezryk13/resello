import { BrowserRouter as Router } from "react-router-dom";
import Footer from "@/components/layout/Footer/Footer";
import AppRoutes from "./routes/AppRoutes";

// The app shell: router, the route table, and the chrome that persists across
// every route. Header is deliberately not here — the five static/legal pages
// render their own hero instead, so each page brings its own header.
const App = () => (
  <Router>
    <div className="app-shell">
      <AppRoutes />
      <Footer />
    </div>
  </Router>
);

export default App;
