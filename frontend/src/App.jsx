import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./containers/Dashboard.jsx";
import NotFound from "./containers/NotFound";
import AuthProvider from "./provider/AuthProvider.jsx";
import ToastProvider from "./provider/ToastProvider.jsx";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { authAPI } from "./api.js";

const onLogin = async ({ email, password, signup = false }) => {
  const endpoint = signup ? authAPI.signup : authAPI.login;
  const response = await endpoint({ email, password });
  if (response.token) {
    localStorage.setItem('auth_token', response.token);
  }
  return response;
};

const onLogout = async () => {
  await authAPI.logout();
  localStorage.removeItem('auth_token');
};

const onFetchUser = async () => {
  const response = await authAPI.me();
  return response.user || response;
};

function App() {
  return (
    <AuthProvider onLogin={onLogin} onLogout={onLogout} onFetchUser={onFetchUser}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
