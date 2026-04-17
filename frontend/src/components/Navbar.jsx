import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    };

    return (
        <nav style={{ background: "#3498db", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ color: "#fff" }}>DoctorPortal</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>Home</Link>

                {!token ? (
                    <>
                        <div style={{ position: "relative" }}>
                            <button style={{ background: "#2980b9", color: "#fff", border: "none", padding: "8px 15px", cursor: "pointer" }}>
                                Signup ▼
                            </button>
                            <div style={{
                                position: "absolute", top: "35px", left: 0, background: "#fff", minWidth: "180px",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.2)", display: "none", flexDirection: "column"
                            }} className="dropdown">
                                <Link to="/register-doctor" style={{ padding: "10px", textDecoration: "none", color: "#2c3e50" }}>Register as Doctor</Link>
                                <Link to="/register-patient" style={{ padding: "10px", textDecoration: "none", color: "#2c3e50" }}>Register as Patient</Link>
                            </div>
                        </div>

                        <Link to="/login" style={{ color: "#fff", textDecoration: "none" }}>Login</Link>
                    </>
                ) : (
                    <>
                        <span style={{ color: "#fff" }}>{role === "doctor" ? "Doctor" : "Patient"} Logged In</span>
                        <button onClick={handleLogout} style={{ background: "#e74c3c", color: "#fff", border: "none", padding: "5px 10px", cursor: "pointer" }}>Logout</button>
                    </>
                )}
            </div>

            <style>{`
        nav div:hover .dropdown {
          display: flex;
        }
        nav div .dropdown a:hover {
          background: #ecf0f1;
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
