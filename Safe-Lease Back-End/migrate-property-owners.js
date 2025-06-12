require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const Property = require('./models/Property-model'); // Adjust path if your models are elsewhere

async function migratePropertyOwners() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // This warning is okay, it's just deprecated since Mongoose 4.0
      useUnifiedTopology: true, // This warning is okay, it's just deprecated since Mongoose 4.0
    });
    console.log('MongoDB connected successfully for migration.');

    // --- CRUCIAL CHANGE HERE ---
    // Access the raw MongoDB collection directly to bypass Mongoose's schema casting for the find query.
    // 'properties' is the default pluralized, lowercase name Mongoose gives to the 'Property' model's collection.
    const rawCollection = mongoose.connection.collection('properties'); 
    // If your collection name is different (e.g., you explicitly named it something else in your schema options),
    // replace 'properties' with your actual collection name.
    // --- END CRUCIAL CHANGE ---


    // 2. Find properties where 'owner' is a string and matches the problematic pattern
    //    We use a regex to find strings that start with "ObjectId(" and end with ")"
    const problematicProperties = await rawCollection.find({
      owner: { $type: 'string', $regex: /^ObjectId\(['"]([0-9a-fA-F]{24})['"]\)$/ }
    }).toArray(); // .toArray() is necessary when using the raw collection's find method

    console.log(`Found ${problematicProperties.length} properties with problematic owner IDs.`);

    if (problematicProperties.length === 0) {
      console.log('No problematic owner IDs found. Exiting migration.');
      mongoose.disconnect();
      return;
    }

    let updatedCount = 0;
    for (const prop of problematicProperties) {
      // Extract the actual ID string using regex capture group
      const match = prop.owner.match(/^ObjectId\(['"]([0-9a-fA-F]{24})['"]\)$/);

      if (match && match[1]) {
        const actualIdString = match[1];
        try {
          // Convert the extracted ID string to a proper Mongoose ObjectId
          const newObjectId = new mongoose.Types.ObjectId(actualIdString);

          // Update the document in the database using the Mongoose model (for type safety on update)
          await Property.updateOne(
            { _id: prop._id }, // Query by the document's _id
            { $set: { owner: newObjectId } } // Set the owner to the correct ObjectId type
          );
          updatedCount++;
          console.log(`Updated property ${prop._id}: owner changed from "${prop.owner}" to ${newObjectId}`);
        } catch (idError) {
          console.error(`Error converting or updating owner for property ${prop._id} (ID: ${actualIdString}):`, idError.message);
        }
      } else {
        console.warn(`Could not parse owner ID string for property ${prop._id}: "${prop.owner}"`);
      }
    }

    console.log(`Migration complete! Successfully updated ${updatedCount} properties.`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // 3. Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

// Run the migration function
migratePropertyOwners();