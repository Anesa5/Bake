// seedCategories.js
const mongoose = require('mongoose');
const Category = require('./models/Category'); // Create this model
require('dotenv').config();

const categories = [
    { name: 'Cardiology', description: 'Heart specialists' },
    { name: 'Dermatology', description: 'Skin specialists' },
    { name: 'Orthopedics', description: 'Bone and joint specialists' },
    { name: 'Pediatrics', description: 'Child specialists' },
    { name: 'Neurology', description: 'Brain and nerve specialists' },
    { name: 'Gynecology', description: 'Women health specialists' },
    { name: 'Dentistry', description: 'Dental care specialists' },
    { name: 'Psychiatry', description: 'Mental health specialists' },
    // Yeh line add karo jab nai category add karni ho
    { name: 'Ophthalmology', description: 'Eye specialists' },
    { name: 'Gastroenterology', description: 'Digestive system specialists' },
    { name: 'Hypertension', description: 'High blood pressure' }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        let addedCount = 0;
        let existingCount = 0;

        for (const category of categories) {
            // Check if category already exists
            const existingCategory = await Category.findOne({
                name: { $regex: new RegExp(`^${category.name}$`, 'i') }
            });

            if (!existingCategory) {
                await Category.create(category);
                console.log(`➕ Added: ${category.name}`);
                addedCount++;
            } else {
                console.log(`⏭️ Skipped (already exists): ${category.name}`);
                existingCount++;
            }
        }

        console.log(`✅ Added ${addedCount} new categories`);
        console.log(`⏭️ Skipped ${existingCount} existing categories`);

        // Show what was inserted
        const allCategories = await Category.find();
        console.log('📋 Categories in database:');
        allCategories.forEach(cat => {
            console.log(`- ${cat.name} (${cat._id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seed();