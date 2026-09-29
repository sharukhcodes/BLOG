// routes/blogRoutes.js
// All REST API routes for blog posts. server.js mounts this file at /api/posts,
// so router.get('/') below really means GET /api/posts.

const express = require('express');
const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');

const router = express.Router();

// ---------- Helper functions ----------

// Returns true when the value is a non-empty string (spaces only = empty).
function isFilled(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

// Checks title, author and content. Returns an error message, or null if all is fine.
function validatePost(body) {
  if (!isFilled(body.title)) return 'Title is required';
  if (!isFilled(body.author)) return 'Author is required';
  if (!isFilled(body.content)) return 'Content is required';
  return null;
}

// Checks that the :id in the URL looks like a real MongoDB ObjectId.
function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

// ---------- Routes ----------

// GET /api/posts  -> list all posts, newest first
router.get('/', async (req, res, next) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    next(err); // hand the error to the error handler in server.js
  }
});

// GET /api/posts/:id  -> get one post
router.get('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts  -> create a new post
router.post('/', async (req, res, next) => {
  try {
    const problem = validatePost(req.body);
    if (problem) {
      return res.status(400).json({ message: problem });
    }
    // Only take the three fields we expect (ignore anything else in the body).
    const { title, author, content } = req.body;
    const post = await BlogPost.create({ title, author, content });
    res.status(201).json(post); // 201 = Created
  } catch (err) {
    next(err);
  }
});

// PUT /api/posts/:id  -> update an existing post
router.put('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const problem = validatePost(req.body);
    if (problem) {
      return res.status(400).json({ message: problem });
    }
    const { title, author, content } = req.body;
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { title, author, content },
      { new: true, runValidators: true } // new: return the updated document
    );
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:id  -> delete a post
router.delete('/:id', async (req, res, next) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
