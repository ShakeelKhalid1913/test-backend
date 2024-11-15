const mongoose = require('mongoose');

// Check if the model already exists to avoid overwriting
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  class: { type: String, required: true },
  subjects: [String],
  attendance: { type: Number, required: true },
});

module.exports = mongoose.model('Employee', employeeSchema);
