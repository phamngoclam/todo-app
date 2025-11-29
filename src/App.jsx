import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import * as api from './api';

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');

  // Fetch todos from API on mount
  useEffect(() => {
    api.fetchTodos()
      .then(data => setTodos(data))
      .catch(err => console.error('Error fetching todos:', err));
  }, []);

  const addTodo = async (text) => {
    try {
      const newTodo = await api.addTodo(text);
      setTodos([newTodo, ...todos]);
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const updatedTodo = await api.toggleTodo(id);
      setTodos(
        todos.map((todo) =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (err) {
      console.error('Error toggling todo:', err);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  const editTodo = async (id, newText) => {
    try {
      const updatedTodo = await api.updateTodo(id, newText);
      setTodos(
        todos.map((todo) =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (err) {
      console.error('Error editing todo:', err);
    }
  };

  const reorderTodos = async (newTodos) => {
    try {
      await api.reorderTodos(newTodos);
      setTodos(newTodos);
    } catch (err) {
      console.error('Error reordering todos:', err);
    }
  };

  const clearAll = async () => {
    try {
      await api.clearAllTodos();
      setTodos([]);
    } catch (err) {
      console.error('Error clearing todos:', err);
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="app">
      <Header />
      <AddTodo onAdd={addTodo} />

      <div className="app__filter">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`app__filter-btn ${filter === f ? 'app__filter-btn--active' : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      <TodoList
        todos={filteredTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEdit={editTodo}
        onReorder={reorderTodos}
      />

      <div className="app__footer">
        <p>{todos.filter(t => !t.completed).length} items left</p>
        {todos.length > 0 && (
          <button
            onClick={clearAll}
            className="app__clear-btn"
            onMouseOver={(e) => e.target.style.color = 'var(--danger-color)'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
