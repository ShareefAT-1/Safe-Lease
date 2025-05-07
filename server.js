const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./Config/db');
const authRoutes = require('./Routes/auth-route');
const propertyRoutes = require('./Routes/property-route');
const agreementRoutes = require('./Routes/agreement-route');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/auth', authRoutes); 
app.use('/properties', propertyRoutes); 
app.use('/agreements', agreementRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ⚙️... ${PORT}`);
});
