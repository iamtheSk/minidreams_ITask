const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const connection = require("./db")
const bcrypt = require("bcrypt");
const cors = require("cors"); 
const app = express();


const PORT = 3000;
app.use(bodyParser.json());


app.use(cors());

connection(
    
)

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// Define Note Schema
const noteSchema = new mongoose.Schema({
  entries: [
    {
      title: String,
      description: String,
    },
  ],
});

const Note = mongoose.model("Note", noteSchema);


// Register a new user by username , password
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, password: hashedPassword });
    const savedUser = await user.save();

    res.status(201).json(savedUser);
  } catch (error) {
    console.error("Error registering user:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// Login using user name password
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Username not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Unauthorized: Incorrect password' });
    }

    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// Logout just null the user
app.post('/api/logout', (req, res) => {
   req.user = null;
  res.json({ message: 'Logout successful' });
});

// Create a new note provide the postman 
app.post("/api/notes", async (req, res) => {
  try {
    const { entries } = req.body;

    if (!entries || entries.length === 0) {
      return res
        .status(400)
        .json({ error: "Entries must be a non-empty array" });
    }

    const note = new Note({ entries });
    const savedNote = await note.save();

    res.status(201).json(savedNote);
  } catch (error) {
    console.error("Error saving note:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});



// Get all notes 
app.get("/api/notes",  async (req, res) => {
  try {
    const notes = await Note.find();
    res.json({ notes });
  } catch (error) {
    console.error("Error fetching notes:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// and get specific note also get using id
app.get("/api/notes/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ notes: [note] });
  } catch (error) {
    console.error("Error fetching note:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// Update a note by ID , provide value in postman body raw json 
app.put("/api/notes/:id", async (req, res) => {
  try {
    const { entries } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { entries },
      { new: true }
    );
    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ notes: [updatedNote] });
  } catch (error) {
    console.error("Error updating note:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// Partially update a note by ID , add or update specific note
app.patch('/api/notes/:id', async (req, res) => {
  try {
    const { entries } = req.body;
    
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Entries must be a non-empty array' });
    }

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, { $push: { entries } }, { new: true });
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(updatedNote);
  } catch (error) {
    console.error('Error partially updating note:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});


// Delete a note by ID , it delete one note
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const deletedNote = await Note.findByIdAndDelete(req.params.id);
    if (!deletedNote) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ notes: [deletedNote] });
  } catch (error) {
    console.error("Error deleting note:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});