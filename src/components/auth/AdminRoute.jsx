import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const AdminRoute = ({ children }) => {
  const { currentUser, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // if (!currentUser || !isAdmin()) {
  //   return <Navigate to="/login" />
  // }

  return children
}

export default AdminRoute