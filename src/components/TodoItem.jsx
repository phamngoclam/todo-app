import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Icon from './Icon';

const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleEdit = () => {
        if (isEditing && editText.trim()) {
            onEdit(todo.id, editText);
        } else {
            setEditText(todo.text); // Reset if empty
        }
        setIsEditing(!isEditing);
    };

    const handleCancel = () => {
        setEditText(todo.text);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleEdit();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    return (
        <div ref={setNodeRef} style={style} className="todo-item">
            {/* Drag Handle */}
            <button
                className="todo-item__drag-handle"
                {...attributes}
                {...listeners}
                aria-label="Drag to reorder"
            >
                <Icon name="gripVertical" size={16} />
            </button>

            <label className="todo-item__label">
                <div className="todo-item__checkbox-wrapper">
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => onToggle(todo.id)}
                        className="todo-item__checkbox"
                        disabled={isEditing}
                    />
                    {todo.completed && (
                        <Icon name="checkThick" size={14} className="todo-item__checkmark" stroke="white" />
                    )}
                </div>

                {isEditing ? (
                    <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="todo-item__edit-input"
                        autoFocus
                    />
                ) : (
                    <span className={`todo-item__text ${todo.completed ? 'todo-item__text--completed' : ''}`}>
                        {todo.text}
                    </span>
                )}
            </label>

            {isEditing ? (
                <>
                    <button
                        onClick={handleEdit}
                        className="todo-item__action todo-item__action--save"
                        aria-label="Save"
                    >
                        <Icon name="check" />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="todo-item__action todo-item__action--cancel"
                        aria-label="Cancel"
                    >
                        <Icon name="x" />
                    </button>
                </>
            ) : (
                <>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="todo-item__action todo-item__action--edit"
                        aria-label="Edit task"
                        disabled={todo.completed}
                        style={{ opacity: todo.completed ? 0.5 : 1 }}
                    >
                        <Icon name="edit" />
                    </button>
                    <button
                        onClick={() => onDelete(todo.id)}
                        className="todo-item__action todo-item__action--delete"
                        aria-label="Delete task"
                    >
                        <Icon name="trash" />
                    </button>
                </>
            )}
        </div>
    );
};

export default TodoItem;
