const express = require('express');
const Employee = require('../models/employee');
const { verifyToken, authorizeRole, getUserFromToken } = require('../middleware/auth');
const router = express.Router();

// Get all employees
router.get('/employees', verifyToken, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single employee by ID
router.get('/employees/:id', verifyToken, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new employee
router.post('/employees', verifyToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { name, age, class: empClass, subjects, attendance } = req.body;
    const newEmployee = new Employee({
      name,
      age,
      class: empClass,
      subjects,
      attendance,
    });
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(400).json({ message: 'Error adding employee', error });
  }
});

// Update an employee
router.put('/employees/:id', verifyToken, authorizeRole('admin'), async (req, res) => {
  try {
    const updatedData = req.body;
    const employee = await Employee.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: 'Error updating employee', error });
  }
});

// Delete an employee
router.delete('/employees/:id', verifyToken, authorizeRole('admin'), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndRemove(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
