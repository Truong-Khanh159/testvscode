const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Simple in-memory store; swap with DB for persistence.
let todos = [
  { id: 1, text: 'Learn React', completed: false },
  { id: 2, text: 'Build a Node API', completed: true }
];
let nextId = todos.length + 1;

app.use(cors());
app.use(express.json());

app.get('/api/todos', (req, res) => {
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) {
    return res.status(400).json({ error: 'Todo text is required' });
  }
  const todo = { id: nextId++, text, completed: false };
  todos.push(todo);
  res.status(201).json(todo);
});

app.patch('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const todo = todos.find((item) => item.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  if (typeof req.body.text === 'string') {
    const trimmed = req.body.text.trim();
    if (!trimmed) {
      return res.status(400).json({ error: 'Todo text is required' });
    }
    todo.text = trimmed;
  }
  if (typeof req.body.completed === 'boolean') {
    todo.completed = req.body.completed;
  }
  res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const existingLength = todos.length;
  todos = todos.filter((item) => item.id !== id);
  if (todos.length === existingLength) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Todo API listening on http://localhost:${PORT}`);
});
