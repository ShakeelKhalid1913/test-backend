const express = require('express');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const authRoutes = require('./routes/auth'); // Import authentication routes
const employeeRoutes = require('./routes/employee'); // Import employee routes
const app = express();
const schema = require('./schema');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/employeeDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Use authentication and employee routes
app.use('/auth', authRoutes);
app.use('/employee', employeeRoutes);
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true, // Enables the GraphiQL interface
  })
);

// Start server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
