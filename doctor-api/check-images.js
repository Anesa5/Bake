const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/specialistDB")
.then(async () => {
    const doctors = await mongoose.connection.db.collection("doctors").find({}).toArray();
    
    console.log("Checking doctor images:");
    console.log("");
    
    doctors.forEach((doc, i) => {
        if (doc.profileImage) {
            console.log(`Doctor ${i+1}: ${doc.name}`);
            console.log("  Database path:", doc.profileImage);
            console.log("  Should be:", "/uploads/doctors/" + doc.profileImage.split("/").pop());
            console.log("");
        }
    });
    
    mongoose.disconnect();
})
.catch(err => {
    console.error("Error:", err.message);
});
