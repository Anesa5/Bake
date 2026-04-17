import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/axios";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "",
    });

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 👉 PATIENT FLOW
        if (formData.role === "patient") {
            try {
                await API.post("/patients/register", formData);
                navigate("/");
            } catch (err) {
                alert("Patient register failed");
            }
        }

        // 👉 DOCTOR FLOW
        if (formData.role === "doctor") {
            navigate("/register-doctor", { state: formData });
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto" }}>
            <h2>Register</h2>

            <input
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
            />

            <input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
            />

            <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
            />

            <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
            >
                <option value="">Register as</option>
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
            </select>

            <button onClick={handleSubmit}>Sign Up</button>
        </div>
    );
};

export default Register;
