const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
let db;
let firebaseInitialized = false;

try {
    // For Vercel/production, use environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log('Using FIREBASE_SERVICE_ACCOUNT from environment');
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        firebaseInitialized = true;
        console.log('Firebase initialized successfully from environment variable');
    } else {
        // Fallback to local file for development
        try {
            const serviceAccount = require('./firebase-service-account.json');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            db = admin.firestore();
            firebaseInitialized = true;
            console.log('Firebase initialized successfully from local file');
        } catch (fileError) {
            console.error('Firebase service account file not found. Please set FIREBASE_SERVICE_ACCOUNT environment variable.');
        }
    }
} catch (error) {
    console.error('Error initializing Firebase:', error.message);
}

// Middleware to check Firebase initialization
const checkFirebase = (req, res, next) => {
    if (!firebaseInitialized || !db) {
        return res.status(503).json({
            error: 'Firebase not initialized. Please configure FIREBASE_SERVICE_ACCOUNT environment variable in Vercel dashboard.'
        });
    }
    next();
};

const COLLECTION_NAME = 'todos';

// GET /api/todos - Fetch all todos
app.get('/api/todos', checkFirebase, async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION_NAME)
            .orderBy('createdAt', 'desc')
            .get();

        const todos = [];
        snapshot.forEach(doc => {
            todos.push({
                id: parseInt(doc.id),
                ...doc.data()
            });
        });

        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

// POST /api/todos - Add a new todo
app.post('/api/todos', checkFirebase, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const id = Date.now();
        const newTodo = {
            text,
            completed: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection(COLLECTION_NAME).doc(id.toString()).set(newTodo);

        res.status(201).json({
            id,
            ...newTodo,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(500).json({ error: 'Failed to create todo' });
    }
});

// PATCH /api/todos/:id - Toggle completion
app.patch('/api/todos/:id', checkFirebase, async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.log('Todo not found....');
            return res.status(404).json({ error: 'Todo not found' });
        }

        const currentData = doc.data();
        const updatedCompleted = !currentData.completed;

        await docRef.update({
            completed: updatedCompleted
        });

        res.json({
            id: parseInt(id),
            ...currentData,
            completed: updatedCompleted
        });
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(500).json({ error: 'Failed to update todo' });
    }
});

// PUT /api/todos - Update todo text
app.put('/api/todos', checkFirebase, async (req, res) => {
    try {
        const { id } = req.query;
        console.log('ID: ' + id);
        const { text } = req.body;
        console.log('Text: ' + text);

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Todo not found..' });
        }

        await docRef.update({ text });

        const updatedDoc = await docRef.get();
        res.json({
            id: parseInt(id),
            ...updatedDoc.data()
        });
    } catch (error) {
        console.error('Error updating todo text:', error);
        res.status(500).json({ error: 'Failed to update todo text' });
    }
});

// PUT /api/todos/reorder - Reorder todos
app.put('/api/todos/reorder', checkFirebase, async (req, res) => {
    try {
        const { todos: newTodos } = req.body;
        if (!newTodos || !Array.isArray(newTodos)) {
            return res.status(400).json({ error: 'Invalid todos array' });
        }

        // Use batch write for atomic updates
        const batch = db.batch();

        // Delete all existing todos
        const snapshot = await db.collection(COLLECTION_NAME).get();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        // Add reordered todos
        newTodos.forEach(todo => {
            const docRef = db.collection(COLLECTION_NAME).doc(todo.id.toString());
            batch.set(docRef, {
                text: todo.text,
                completed: todo.completed,
                createdAt: admin.firestore.Timestamp.now()
            });
        });

        await batch.commit();
        res.json(newTodos);
    } catch (error) {
        console.error('Error reordering todos:', error);
        res.status(500).json({ error: 'Failed to reorder todos' });
    }
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', checkFirebase, async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection(COLLECTION_NAME).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        await docRef.delete();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});

// DELETE /api/todos - Clear all todos
app.delete('/api/todos', checkFirebase, async (req, res) => {
    try {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const batch = db.batch();

        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        res.status(204).send();
    } catch (error) {
        console.error('Error clearing todos:', error);
        res.status(500).json({ error: 'Failed to clear todos' });
    }
});

// Only start the server if not in Vercel environment
if (process.env.VERCEL !== '1') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log(`Using Firebase Firestore for data storage`);
    });
}

// Export for Vercel serverless
module.exports = app;
