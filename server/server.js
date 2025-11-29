const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'todos.json');

// Helper functions for file storage
const loadTodos = () => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error loading todos:', err);
    }
    return [];
};

const saveTodos = (todos) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving todos:', err);
    }
};

// Initialize todos from file
let todos = loadTodos();

// GET /api/todos - Fetch all todos
app.get('/api/todos', (req, res) => {
    res.json(todos);
});

// POST /api/todos - Add a new todo
app.post('/api/todos', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }
    const newTodo = {
        id: Date.now(),
        text,
        completed: false
    };
    todos.unshift(newTodo);
    saveTodos(todos);
    res.status(201).json(newTodo);
});

// PATCH /api/todos/:id - Toggle completion
app.patch('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    const todoIndex = todos.findIndex(t => t.id === parseInt(id));

    if (todoIndex === -1) {
        console.log('Todo not found....');
        return res.status(404).json({ error: 'Todo not found' });
    }

    todos[todoIndex].completed = !todos[todoIndex].completed;
    saveTodos(todos);
    res.json(todos[todoIndex]);
});

// PUT /api/todos/:id - Update todo text
app.put('/api/todos', (req, res) => {
    const { id } = req.query;
    console.log('ID: ' + id);
    const { text } = req.body;
    console.log('Text: ' + text);
    const todoIndex = todos.findIndex(t => t.id === parseInt(id));

    if (todoIndex === -1) {
        return res.status(404).json({ error: 'Todo not found..' });
    }

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    todos[todoIndex].text = text;
    saveTodos(todos);
    res.json(todos[todoIndex]);
});

// PUT /api/todos/reorder - Reorder todos
app.put('/api/todos/reorder', (req, res) => {
    const { todos: newTodos } = req.body;
    if (!newTodos || !Array.isArray(newTodos)) {
        return res.status(400).json({ error: 'Invalid todos array' });
    }
    todos = newTodos;
    saveTodos(todos);
    res.json(todos);
});

// DELETE /api/todos/:id - Delete a todo
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    todos = todos.filter(t => t.id !== parseInt(id));
    saveTodos(todos);
    res.status(204).send();
});

// DELETE /api/todos - Clear all todos
app.delete('/api/todos', (req, res) => {
    todos = [];
    saveTodos(todos);
    res.status(204).send();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Data stored in: ${DATA_FILE}`);
});
