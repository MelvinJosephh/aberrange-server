const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const Blog = require("../models/Blog"); // Assuming Blog model is in models directory
const router = express.Router();

// Set up multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configure CORS for this router
const corsOptions = {
    origin: ["https://aberrange-server.netlify.app", "http://localhost:5000", "http://localhost:3000", "http://localhost:3001"],
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
};
router.use(cors(corsOptions));

// Function to resize an image buffer
const resizeImage = async (buffer, width, height) => {
    return await sharp(buffer)
        .resize(width, height)
        .toBuffer();
};

// CREATE a new blog post with file upload and image resizing
router.post("/", upload.fields([{ name: "featuredImage" }, { name: "authorImage" }]), async (req, res) => {
    try {
        const blogData = {
            title: req.body.title,
            content: req.body.content,
            permalink: req.body.permalink,
            category: req.body.category,
            tags: JSON.parse(req.body.tags),
            status: req.body.status,
            excerpt: req.body.excerpt,
            author: {
                name: req.body.authorName,
                profileImage: req.files["authorImage"]
                    ? await resizeImage(req.files["authorImage"][0].buffer, 150, 150)
                    : null,
            },
            featuredImage: req.files["featuredImage"]
                ? await resizeImage(req.files["featuredImage"][0].buffer, 800, 600)
                : null,
        };

        const blog = new Blog(blogData);
        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// UPDATE a blog post by permalink with file upload and image resizing
router.put("/:permalink", upload.fields([{ name: "featuredImage" }, { name: "authorImage" }]), async (req, res) => {
  try {
    const existingBlog = await Blog.findOne({ permalink: req.params.permalink });
    if (!existingBlog) return res.status(404).json({ message: "Blog not found" });

    const updateData = {
      ...existingBlog._doc, // Preserve existing data
      title: req.body.title || existingBlog.title,
      content: req.body.content || existingBlog.content,
      category: req.body.category || existingBlog.category,
      tags: req.body.tags ? JSON.parse(req.body.tags) : existingBlog.tags,
      status: req.body.status || existingBlog.status,
      excerpt: req.body.excerpt || existingBlog.excerpt,
      author: {
        name: req.body.authorName || existingBlog.author.name,
        profileImage: req.files["authorImage"]
          ? await resizeImage(req.files["authorImage"][0].buffer, 150, 150)
          : existingBlog.author.profileImage,
      },
      featuredImage: req.files["featuredImage"]
        ? await resizeImage(req.files["featuredImage"][0].buffer, 800, 600)
        : existingBlog.featuredImage,
      publishDate: req.body.publishDate || existingBlog.publishDate,
      readTime: req.body.readTime || existingBlog.readTime,
    };

    const updatedBlog = await Blog.findOneAndUpdate(
      { permalink: req.params.permalink },
      updateData,
      { new: true }
    );

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Add this route to handle fetching all blogs
router.get("/", async (req, res) => {
  try {
    const { lastFetchedAt } = req.query;
    const filter = lastFetchedAt ? { updatedAt: { $gt: new Date(lastFetchedAt) } } : {};
    const blogs = await Blog.find(filter);

    const blogsWithBase64Images = blogs.map((blog) => ({
      ...blog._doc,
      featuredImage: blog.featuredImage ? blog.featuredImage.toString("base64") : null,
      author: {
        ...blog.author,
        profileImage: blog.author.profileImage
          ? blog.author.profileImage.toString("base64")
          : null,
      },
    }));

    res.status(200).json(blogsWithBase64Images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// GET a single blog post by permalink
router.get("/:permalink", async (req, res) => {
  try {
    const blog = await Blog.findOne({ permalink: req.params.permalink });
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const blogWithBase64Images = {
      ...blog._doc,
      featuredImage: blog.featuredImage ? blog.featuredImage.toString("base64") : null,
      author: {
        ...blog.author,
        profileImage: blog.author.profileImage
          ? blog.author.profileImage.toString("base64")
          : null,
      },
    };

    res.status(200).json(blogWithBase64Images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE a blog post by ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) return res.status(404).json({ message: "Blog not found" });

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
