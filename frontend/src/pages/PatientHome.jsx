import React, { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

const PatientHome = () => {
    const [doctors, setDoctors] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await API.get("/doctors");
                setDoctors(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchDoctors();
    }, []);

    return (
        <div className="container mt-5">
            <h2>Doctors</h2>
            <div className="row">
                {doctors.map(doc => (
                    <div className="col-md-4 mb-4" key={doc._id}>
                        <div className="card h-100 p-3">
                            <img
                                src={`http://localhost:5000/uploads/${doc.profileImage}`}
                                alt={doc.name}
                                className="img-thumbnail mb-2"
                                style={{ height: "200px", objectFit: "cover" }}
                            />
                            <h5>{doc.name}</h5>
                            <p>{doc.specialization}</p>
                            <p>Rating: {doc.rating || "No rating"}</p>
                            <Link to={`/doctor/${doc._id}`} className="btn btn-primary mt-2">View Profile</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientHome;
