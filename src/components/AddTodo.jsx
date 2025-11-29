import React, { useState } from 'react';
import Icon from './Icon';

const AddTodo = ({ onAdd }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAdd(text);
        setText('');
    };

    return (
        <form onSubmit={handleSubmit} className="add-todo">
            <input
                type="text"
                placeholder="Add a new task..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="add-todo__input"
            />
            <button
                type="submit"
                className="add-todo__submit"
                aria-label="Add task"
            >
                <Icon name="plus" size={20} />
            </button>
        </form>
    );
};

export default AddTodo;
