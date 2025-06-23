require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property-model'); 

async function migratePropertyOwners() {
  try {

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true, 
      useUnifiedTopology: true, 
    });
    console.log('MongoDB connected successfully for migration.');

    
    const rawCollection = mongoose.connection.collection('properties'); 
   
    const problematicProperties = await rawCollection.find({
      owner: { $type: 'string', $regex: /^ObjectId\(['"]([0-9a-fA-F]{24})['"]\)$/ }
    }).toArray(); 

    console.log(`Found ${problematicProperties.length} properties with problematic owner IDs.`);

    if (problematicProperties.length === 0) {
      console.log('No problematic owner IDs found. Exiting migration.');
      mongoose.disconnect();
      return;
    }

    let updatedCount = 0;
    for (const prop of problematicProperties) {

      const match = prop.owner.match(/^ObjectId\(['"]([0-9a-fA-F]{24})['"]\)$/);

      if (match && match[1]) {
        const actualIdString = match[1];
        try {

          const newObjectId = new mongoose.Types.ObjectId(actualIdString);

          await Property.updateOne(
            { _id: prop._id }, 
            { $set: { owner: newObjectId } } 
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

    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

migratePropertyOwners();