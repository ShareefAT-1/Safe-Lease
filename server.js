const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./Config/db');
const authRoutes = require('./Routes/auth-route');
const propertyRoutes = require('./Routes/property-route');
const agreementRoutes = require('./Routes/agreement-route');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('Uploads folder created!');
}

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
