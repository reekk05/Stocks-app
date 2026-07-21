import {BrowserRouter, Routes, Route} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Trade from "./pages/Trade";
import History from "./pages/History";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return(
    <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
      <Route path="/portfolio" element={
        <ProtectedRoute><Portfolio /></ProtectedRoute>
        } />
      <Route path="/trade" element={<ProtectedRoute><Trade /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
    </Routes>
    </BrowserRouter>
  );
}

export default App;