import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Register from "./pages/Register";
import RegisterDoctor from "./pages/RegisterDoctor";
import RegisterPatient from "./pages/RegisterPatient";
import Login from "./pages/Login";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientHome from "./pages/PatientHome";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorProfile from "./components/DoctorProfile";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./Context/AuthContext";
import CategoryDoctors from './pages/CategoryDoctors';
import DoctorLogin from './components/DoctorLogin';
import AdminLogin from './components/AdminLogin';
import AdminSetup from './pages/AdminSetup';
import AdminCreate from './components/AdminCreate';
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import axios from "axios";

// ✅ Review components ko comment kar diya jab tak use na karo
// import ReviewList from "./components/ReviewsList";
// import ReviewForm from "./components/ReviewForm";
// import RatingStars from "./components/RatingStars";

// Protected Route for Admin
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  return token ? children : <Navigate to="/admin/login" />;
};

const App = () => {
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentSearchParams, setCurrentSearchParams] = useState({});

  const handleSearch = async (searchParams) => {
    setLoading(true);
    setCurrentSearchParams(searchParams);
    try {
      const response = await axios.get('http://localhost:5000/api/doctors/search', {
        params: searchParams
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/doctors/search', {
        params: {
          ...currentSearchParams,
          page: newPage
        }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Pagination error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-doctor" element={<RegisterDoctor />} />
          <Route path="/register-patient" element={<RegisterPatient />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doctor/:id" element={<DoctorProfile />} />
          <Route path="/category/:categoryName" element={<CategoryDoctors />} />
          <Route path="/doctor-profile/:id" element={<DoctorProfile />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/admin/create" element={<AdminCreate />} />

          {/* Search Page Route */}
          <Route
            path="/search-doctors"
            element={
              <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl font-bold text-center mb-8">
                    Find a Doctor
                  </h1>

                  {/* Search Bar */}
                  <SearchBar onSearch={handleSearch} />

                  {/* Loading State */}
                  {loading && (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                      <p className="text-gray-500">Searching for doctors...</p>
                    </div>
                  )}

                  {/* Search Results */}
                  {!loading && (
                    <SearchResults
                      results={searchResults}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              </div>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute role="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/patient-home"
            element={
              <ProtectedRoute role="patient">
                <PatientHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;