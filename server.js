const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin securely using Environment Variables
const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large payloads for AI processing

// Health check endpoint (Render uses this to know the server is alive)
app.get('/', (req, res) => {
    res.send('IFB Grading Backend is running securely.');
});

// Endpoint for AI Grading
app.post('/api/grade', async (req, res) => {
    try {
        const { studentId, scriptId, imageUrl, questionNum } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: "No image URL provided." });
        }

        // --- DEEPSEEK AI INTEGRATION WILL GO HERE ---
        // (We will add the actual grading logic in the next step)
        
        console.log(`Received grading request for Student: ${studentId}, Script: ${scriptId}, Q: ${questionNum}`);

        res.status(200).json({ 
            success: true, 
            message: "Image received. AI grading pipeline initiated.",
            studentId: studentId,
            imageUrl: imageUrl
        });

    } catch (error) {
        console.error("Grading Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});