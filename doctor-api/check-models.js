const mongoose = require('mongoose');
require('dotenv').config();

async function checkModels() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor-appointment');

        console.log('🔍 Checking User model schema...');

        // Try to get the schema from mongoose
        const User = require('./models/User');

        console.log('User model path names:', Object.keys(User.schema.paths));
        console.log('\nUser schema details:');

        for (const [pathName, schemaType] of Object.entries(User.schema.paths)) {
            console.log(`\n${pathName}:`);
            console.log('  Type:', schemaType.instance);
            console.log('  Required:', schemaType.isRequired);
            console.log('  Enum:', schemaType.enumValues);
            console.log('  Default:', schemaType.defaultValue);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkModels();