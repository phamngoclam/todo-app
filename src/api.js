const API_BASE_URL = 'http://localhost:3001/api';

// Fetch all todos
export const fetchTodos = async () => {
    const response = await fetch(`${API_BASE_URL}/todos`);
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
};

// Add a new todo
export const addTodo = async (text) => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to add todo');
    return response.json();
};

// Toggle todo completion
export const toggleTodo = async (id) => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to toggle todo');
    return response.json();
};

// Update todo text
export const updateTodo = async (id, text) => {
    const response = await fetch(`${API_BASE_URL}/todos?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to update todo');
    return response.json();
};

// Reorder todos
export const reorderTodos = async (todos) => {
    const response = await fetch(`${API_BASE_URL}/todos/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todos }),
    });
    if (!response.ok) throw new Error('Failed to reorder todos');
    return response.json();
};

// Delete a todo
export const deleteTodo = async (id) => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete todo');
};

// Clear all todos
export const clearAllTodos = async () => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to clear todos');
};
