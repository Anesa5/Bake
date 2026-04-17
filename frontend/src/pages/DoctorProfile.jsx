import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../Context/AuthContext";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const DoctorProfile = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [doctor, setDoctor] = useState(null);
    const [review, setReview] = useState({ rating: 5, comment: "" });

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await API.get(`/doctors/${id}`);
                setDoctor(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchDoctor();
    }, [id]);

    const handleReviewSubmit = async () => {
        try {
            await API.post(`/doctors/${id}/reviews`, review);
            alert("Review submitted!");
            setReview({ rating: 5, comment: "" });
        } catch (err) {
            console.error(err);
            alert("Error submitting review");
        }
    };

    if (!doctor) return <div className="container mt-5">Loading...</div>;

    const mapContainerStyle = { width: "100%", height: "300px" };
    const center = doctor.clinics?.[0]?.location || { lat: 0, lng: 0 };

    return (
        <div className="container mt-5">
            <div className="row">
                {/* Doctor Info */}
                <div className="col-md-4">
                    <img
                        src={`http://localhost:5000/uploads/${doctor.profileImage}`}
                        alt={doctor.name}
                        className="img-thumbnail mb-3"
                        style={{ width: "100%", objectFit: "cover" }}
                    />
                    <h4>{doctor.name}</h4>
                    <p><strong>Email:</strong> {doctor.email}</p>
                    <p><strong>Specialization:</strong> {doctor.specialization}</p>
                    <p><strong>Qualification:</strong> {doctor.qualification}</p>
                    <p><strong>Experience:</strong> {doctor.experience} years</p>
                    <p><strong>Rating:</strong> {doctor.rating || "No rating yet"}</p>
                </div>

                {/* Clinics & Map */}
                <div className="col-md-8">
                    <h5>Clinics</h5>
                    {doctor.clinics?.map((clinic, idx) => (
                        <div key={idx} className="mb-2 p-2 border rounded">
                            <p><strong>{clinic.name}</strong></p>
                            <p>{clinic.address}</p>
                            <p>Slots: {clinic.slots?.join(", ")}</p>
                        </div>
                    ))}

                    <h5 className="mt-4">Clinics Map</h5>
                    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12}>
                            {doctor.clinics?.map((clinic, idx) => (
                                <Marker key={idx} position={clinic.location} label={clinic.name} />
                            ))}
                        </GoogleMap>
                    </LoadScript>

                    {/* Submit Review */}
                    {user && user.role === "patient" && (
                        <div className="mt-4">
                            <h5>Submit Review</h5>
                            <select
                                className="form-select mb-2"
                                value={review.rating}
                                onChange={(e) => setReview({ ...review, rating: parseInt(e.target.value) })}
                            >
                                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                            </select>
                            <textarea
                                className="form-control mb-2"
                                placeholder="Comment"
                                value={review.comment}
                                onChange={(e) => setReview({ ...review, comment: e.target.value })}
                            />
                            <button className="btn btn-primary" onClick={handleReviewSubmit}>Submit</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
