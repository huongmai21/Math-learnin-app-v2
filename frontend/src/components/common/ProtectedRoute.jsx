import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import Spinner from "../ui/Spinner" // Giả sử bạn có component Spinner

const ProtectedRoute = ({ children, adminOnly  }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth)

  if (loading) {
    return <Spinner />
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
