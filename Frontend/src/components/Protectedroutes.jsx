import {
 Navigate,
 Outlet,
} from "react-router-dom";
import { useAppSelector } from "../redux/hooks";

const ProtectedRoute = () => {
  const token = useAppSelector((state) => state.auth.token);

  return token
    ? <Outlet />
    : <Navigate to="/Login" />;
};

export default ProtectedRoute;