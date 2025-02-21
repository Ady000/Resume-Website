const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Connect to MongoDB
// Connect to MongoDB (Replace 'YOUR_MONGODB_URI_HERE' with your actual connection string)
mongoose
  .connect("mongodb+srv://adnana45696:hIfiKsttZIy2lphH@visitortrackerdb.2jxhs.mongodb.net/?retryWrites=true&w=majority&appName=VisitorTrackerDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));


// Define Visitor Schema
const visitorSchema = new mongoose.Schema({
  ip: String,
  timestamp: { type: Date, default: Date.now },
  visits: { type: Number, default: 1 }
});

const Visitor = mongoose.model("Visitor", visitorSchema);

// Track Visitor
app.post("/track", async (req, res) => {
  const { name } = req.body; // Get name from request body
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  
  try {
    let visitor = await Visitor.findOne({ ip });

    if (visitor) {
      visitor.visits += 1;
      visitor.name = name || visitor.name; // Update name if provided
      await visitor.save();
    } else {
      visitor = new Visitor({ ip, name, visits: 1 });
      await visitor.save();
    }

    res.json({ message: "Visit tracked", ip, name, visits: visitor.visits });
  } catch (error) {
    res.status(500).json({ error: "Error tracking visit" });
  }
});

// Get Visit Count
app.get("/visits", async (req, res) => {
  try {
    const totalVisits = await Visitor.countDocuments();
    res.json({ totalVisits });
  } catch (error) {
    res.status(500).json({ error: "Error fetching visits" });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
