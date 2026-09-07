import AuthPage from "./AuthPage";

// Thin wrappers so routeConfig can lazy-import a page per path while the shell,
// brand pane and form logic live once in AuthPage.
const LoginPage = () => <AuthPage mode="login" />;

export default LoginPage;
