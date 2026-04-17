const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/doctor-api")
.then(async () => {
    const doctors = await mongoose.connection.db.collection("doctors").find({}).toArray();
    
    console.log("Total doctors in database:", doctors.length);
    console.log("");
    
    if (doctors.length > 0) {
        doctors.forEach((doc, i) => {
            console.log(`Doctor ${i+1}:`);
            console.log("  Name:", doc.name || doc.fullName || "No name");
            console.log("  Email:", doc.email || "No email");
            console.log("  Profile Image:", doc.profileImage || "No image");
            console.log("  Category:", doc.specialization || doc.categoryName || "No category");
            console.log("");
        });
    } else {
        console.log("No doctors found in database");
    }
    
    mongoose.disconnect();
})
.catch(err => {
    console.error("Error:", err.message);
});
