import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token'); // SAME key

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default AdminProtectedRoute;
