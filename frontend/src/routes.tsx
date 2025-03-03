import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLeader from "./pages/DashboardLeader";
import DashboardCollaborator from "./pages/DashboardCollaborator";
import PrivateRoute from "./components/PrivateRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública (Login) */}
      <Route path="/" element={<Login />} />

      {/* Rota protegida para Líderes */}
      <Route element={<PrivateRoute allowedRoles={["leader"]} />}>
        <Route path="/dashboard-leader" element={<DashboardLeader />} />
      </Route>

      {/* Rota protegida para Colaboradores */}
      <Route element={<PrivateRoute allowedRoles={["collaborator"]} />}>
        <Route
          path="/dashboard-collaborator"
          element={<DashboardCollaborator />}
        />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
