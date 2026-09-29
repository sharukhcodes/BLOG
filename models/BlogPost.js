// models/BlogPost.js
// A Mongoose "schema" describes the shape of a document stored in MongoDB.
// A Mongoose "model" gives us ready-made methods (find, create, update, delete).

const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true, // removes spaces at the start and end
      maxlength: [150, 'Title cannot be longer than 150 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [80, 'Author name cannot be longer than 80 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
  },
  {
    // timestamps: true makes Mongoose add "createdAt" and "updatedAt"
    // automatically, so we never have to set the date ourselves.
    timestamps: true,
  }
);

// 'BlogPost' becomes the collection "blogposts" in MongoDB.
module.exports = mongoose.model('BlogPost', blogPostSchema);
