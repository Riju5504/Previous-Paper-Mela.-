require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// --------------------------------------------------
// BASIC SECURITY & MIDDLEWARE
// --------------------------------------------------

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// MONGODB CONNECTION
// --------------------------------------------------

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing.");
  console.error("Please create a .env file and add your MongoDB connection string.");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully.");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:");
    console.error(error.message);
    process.exit(1);
  });

// --------------------------------------------------
// PAPER SCHEMA
// --------------------------------------------------

const paperSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: true,
      min: 1
    },

    subject: {
      type: String,
      required: true,
      trim: true
    },

    year: {
      type: Number,
      required: true
    },

    fileName: {
      type: String,
      required: true,
      trim: true
    },

    filePath: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["previous", "live"],
      default: "previous"
    }
  },
  {
    timestamps: true
  }
);

const Paper = mongoose.model("Paper", paperSchema);

// --------------------------------------------------
// DOWNLOAD ACTIVITY SCHEMA
// --------------------------------------------------

const downloadActivitySchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },

    sessionId: {
      type: String,
      required: true,
      index: true
    },

    semester: {
      type: Number,
      required: true
    },

    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
      required: true
    },

    downloadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const DownloadActivity = mongoose.model(
  "DownloadActivity",
  downloadActivitySchema
);

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Previous Paper Mela Backend is running.",
    status: "online"
  });
});

// --------------------------------------------------
// GET ALL PAPERS
// --------------------------------------------------

app.get("/api/papers", async (req, res) => {
  try {
    const papers = await Paper.find()
      .sort({ semester: 1, year: -1, subject: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: papers.length,
      papers
    });
  } catch (error) {
    console.error("Error fetching papers:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch papers."
    });
  }
});

// --------------------------------------------------
// GET PAPERS BY SEMESTER
// --------------------------------------------------

app.get("/api/papers/semester/:semester", async (req, res) => {
  try {
    const semester = Number(req.params.semester);

    if (!Number.isInteger(semester) || semester < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid semester."
      });
    }

    const papers = await Paper.find({ semester })
      .sort({ year: -1, subject: 1 })
      .lean();

    res.status(200).json({
      success: true,
      semester,
      count: papers.length,
      papers
    });
  } catch (error) {
    console.error("Error fetching semester papers:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch semester papers."
    });
  }
});

// --------------------------------------------------
// GET SINGLE PAPER
// --------------------------------------------------

app.get("/api/papers/:id", async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id).lean();

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found."
      });
    }

    res.status(200).json({
      success: true,
      paper
    });
  } catch (error) {
    console.error("Error fetching paper:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch paper."
    });
  }
});

// --------------------------------------------------
// LOG PAPER DOWNLOAD
// --------------------------------------------------

app.post("/api/downloads/log", async (req, res) => {
  try {
    const {
      userName,
      email,
      sessionId,
      semester,
      paperId
    } = req.body;

    if (
      !userName ||
      !email ||
      !sessionId ||
      !semester ||
      !paperId
    ) {
      return res.status(400).json({
        success: false,
        message: "Required download information is missing."
      });
    }

    const paper = await Paper.findById(paperId);

    if (!paper) {
      return res.status(404).json({
        success: false,
        message: "Paper not found."
      });
    }

    const activity = await DownloadActivity.create({
      userName,
      email,
      sessionId,
      semester,
      paperId
    });

    res.status(201).json({
      success: true,
      message: "Download activity recorded successfully.",
      activityId: activity._id
    });
  } catch (error) {
    console.error("Error recording download:", error);

    res.status(500).json({
      success: false,
      message: "Unable to record download activity."
    });
  }
});

// --------------------------------------------------
// GET SESSION DOWNLOAD COUNT
// --------------------------------------------------

app.get("/api/downloads/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const downloads = await DownloadActivity.find({
      sessionId
    })
      .sort({ downloadedAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      sessionId,
      downloadCount: downloads.length,
      downloads
    });
  } catch (error) {
    console.error("Error fetching session downloads:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch session download information."
    });
  }
});

// --------------------------------------------------
// SERVE PDF FILES
// --------------------------------------------------

// Existing project structure:
// papers/
//   semester-1/
//   semester-2/
//   semester-3/
//   semester-4/

const papersDirectory = path.join(__dirname, "..", "papers");

app.use(
  "/papers",
  express.static(papersDirectory, {
    extensions: ["pdf"]
  })
);

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found."
  });
});

// --------------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------------

app.use((error, req, res, next) => {
  console.error("Unexpected server error:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 Previous Paper Mela Backend");
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📚 Papers directory: ${papersDirectory}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});