import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/axios";

const RegisterPatient = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await API.post("/patients/register", formData);
            setMessage(res.data.message);
            setLoading(false);

            setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });

            navigate("/login"); // redirect to login
        } catch (err) {
            console.error("Patient Register error:", err);
            setMessage(err.response?.data?.message || "Something went wrong");
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
            <h2 style={{ textAlign: "center" }}>Patient Registration</h2>
            {message && <p style={{ color: "red", textAlign: "center" }}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <label>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />

                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />

                <label>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />

                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />

                <button type="submit" disabled={loading} style={{ marginTop: "10px", padding: "10px 20px" }}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    );
};

export default RegisterPatient;
