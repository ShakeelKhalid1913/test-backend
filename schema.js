const graphql = require('graphql');
const Employee = require('./models/employee'); // Employee model for MongoDB

const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
} = graphql;

// Define Employee Type for GraphQL
const EmployeeType = new GraphQLObjectType({
  name: 'Employee',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    class: { type: GraphQLString },
    subjects: { type: new GraphQLList(GraphQLString) },
    attendance: { type: GraphQLInt },
  }),
});

// Root query for fetching employees
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // Query to get all employees with optional filters, pagination, and sorting
    employees: {
      type: new GraphQLList(EmployeeType),
      args: {
        limit: { type: GraphQLInt },
        skip: { type: GraphQLInt },
        sortField: { type: GraphQLString },
        sortOrder: { type: GraphQLString },
        name: { type: GraphQLString },
        class: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const query = {};

        // Apply filtering
        if (args.name) query.name = { $regex: args.name, $options: 'i' }; // Case-insensitive regex search
        if (args.class) query.class = args.class;

        // Set up sorting
        const sort = {};
        if (args.sortField) {
          sort[args.sortField] = args.sortOrder === 'desc' ? -1 : 1; // Ascending by default
        }

        // Return the employees from MongoDB
        return Employee.find(query)
          .sort(sort)
          .skip(args.skip || 0) // Skip records for pagination
          .limit(args.limit || 10); // Default to 10 records if no limit specified
      },
    },

    // Query to get a single employee by ID
    employee: {
      type: EmployeeType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args) {
        return Employee.findById(args.id);
      },
    },

    // Query to fetch employees by name (case-insensitive partial match)
    fetchUserByName: {
      type: new GraphQLList(EmployeeType),
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        // Case-insensitive search for name
        return Employee.find({ name: { $regex: args.name, $options: 'i' } });
      },
    },
  },
});

// Mutation for adding and updating employees
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Mutation to add a new employee
    addEmployee: {
      type: EmployeeType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        class: { type: new GraphQLNonNull(GraphQLString) },
        subjects: { type: new GraphQLList(GraphQLString) },
        attendance: { type: new GraphQLNonNull(GraphQLInt) },
      },
      async resolve(parent, args) {
        const newEmployee = new Employee({
          name: args.name,
          age: args.age,
          class: args.class,
          subjects: args.subjects,
          attendance: args.attendance,
        });

        await newEmployee.save();
        return newEmployee;
      },
    },

    // Mutation to update an existing employee
    updateEmployee: {
      type: EmployeeType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        class: { type: GraphQLString },
        subjects: { type: new GraphQLList(GraphQLString) },
        attendance: { type: GraphQLInt },
      },
      async resolve(parent, args) {
        const updatedEmployee = await Employee.findByIdAndUpdate(
          args.id,
          {
            $set: args,
          },
          { new: true }
        );

        return updatedEmployee;
      },
    },
  },
});

// Define GraphQL schema with the root query and mutation
module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
