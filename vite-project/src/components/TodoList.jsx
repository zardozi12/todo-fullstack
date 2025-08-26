import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newReminderAt, setNewReminderAt] = useState('');
  const { logout } = useAuth();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); 
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editReminderAt, setEditReminderAt] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error);
      if (error.response?.status === 401) {
        logout(); // Logout if the token is invalid
      }
    }
  };

  const createTodo = async (e) => {
    e.preventDefault();
    try {
      await api.post('/todos', {
        title: newTitle,
        description: newDescription,
        reminder_at: newReminderAt ? new Date(newReminderAt).toISOString() : null,
      });
      setNewTitle('');
      setNewDescription('');
      setNewReminderAt('');
      fetchTodos();
    } catch (error) {
      console.error('Error creating todo:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const updateTodoStatus = async (todo) => {
    try {
      await api.patch(`/todos/${todo.id}`, { done: !todo.done });
      fetchTodos();
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const updateReminder = async (todo, value) => {
    try {
      await api.patch(`/todos/${todo.id}`, {
        reminder_at: value ? new Date(value).toISOString() : null,
      });
      fetchTodos();
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const beginEdit = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title || '');
    setEditDescription(todo.description || '');
    setEditReminderAt(
      todo.reminder_at ? new Date(todo.reminder_at).toISOString().slice(0, 16) : ''
    );
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditReminderAt('');
  };

  const saveEdit = async (original) => {
    try {
      await api.put(`/todos/${original.id}`, {
        title: editTitle,
        description: editDescription,
        done: !!original.done,
        reminder_at: editReminderAt ? new Date(editReminderAt).toISOString() : null,
      });
      cancelEdit();
      fetchTodos();
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const clearCompleted = async () => {
    try {
      const completed = todos.filter((t) => t.done);
      await Promise.all(completed.map((t) => api.delete(`/todos/${t.id}`)));
      fetchTodos();
    } catch (error) {
      console.error('Error clearing completed:', error);
    }
  };

  const filtered = todos
    .filter((t) => (filter === 'all' ? true : filter === 'completed' ? t.done : !t.done))
    .filter((t) =>
      [t.title || '', t.description || ''].join(' ').toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div className="container mx-auto p-4 max-w-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Todos</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <button
          onClick={clearCompleted}
          className="p-2 border rounded bg-gray-100 hover:bg-gray-200"
        >
          Clear Completed
        </button>
      </div>
      
      <form onSubmit={createTodo} className="mb-6 bg-gray-200 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Create New Todo</h2>
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <textarea
          placeholder="Description (Optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        ></textarea>
        <input
          type="datetime-local"
          value={newReminderAt}
          onChange={(e) => setNewReminderAt(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Add Todo
        </button>
      </form>

      <ul className="space-y-4">
        {filtered.map((todo) => (
          <li key={todo.id} className="p-4 bg-white rounded shadow">
            <div className="flex items-start justify-between">
              <div className="pr-4">
                {editingId === todo.id ? (
                  <>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2 mb-2 border rounded"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full p-2 mb-2 border rounded"
                    />
                    <input
                      type="datetime-local"
                      value={editReminderAt}
                      onChange={(e) => setEditReminderAt(e.target.value)}
                      className="w-full p-2 mb-2 border rounded"
                    />
                  </>
                ) : (
                  <>
                    <h3 className={`text-lg font-bold ${todo.done ? 'line-through text-gray-500' : ''}`}>
                      {todo.title}
                    </h3>
                    <p className={`text-sm text-gray-600 ${todo.done ? 'line-through' : ''}`}>
                      {todo.description}
                    </p>
                  </>
                )}
                {todo.reminder_at && (
                  <p className="inline-flex items-center text-xs text-purple-700 mt-1 bg-purple-50 px-2 py-1 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-2" />
                    Reminder: {new Date(todo.reminder_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 min-w-[220px]">
                <button
                  onClick={() => updateTodoStatus(todo)}
                  className={`py-1 px-3 rounded text-white ${
                    todo.done ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {todo.done ? 'Undo' : 'Done'}
                </button>
                {editingId === todo.id ? (
                  <>
                    <button
                      onClick={() => saveEdit(todo)}
                      className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="border py-1 px-3 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => beginEdit(todo)}
                    className="border py-1 px-3 rounded hover:bg-gray-50"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-sm text-gray-700 mr-2">Set/Update Reminder:</label>
              <input
                type="datetime-local"
                defaultValue={todo.reminder_at ? new Date(todo.reminder_at).toISOString().slice(0,16) : ''}
                onBlur={(e) => updateReminder(todo, e.target.value)}
                className="p-2 border rounded"
              />
              {todo.reminder_at && (
                <button
                  onClick={() => updateReminder(todo, '')}
                  className="ml-2 py-1 px-3 rounded border border-purple-600 text-purple-700 hover:bg-purple-50"
                >
                  Clear Reminder
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;