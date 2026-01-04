import { useEffect, useMemo, useState } from 'react';

const API = '/api/todos';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        setTodos(data);
        setError('');
      })
      .catch(() => setError('Không thể tải danh sách todo'))
      .finally(() => setLoading(false));
  }, []);

  const remaining = useMemo(() => todos.filter((t) => !t.completed).length, [todos]);

  const addTodo = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed })
      });
      if (!res.ok) throw new Error();
      const todo = await res.json();
      setTodos((prev) => [...prev, todo]);
      setText('');
      setError('');
    } catch (err) {
      setError('Không thể thêm todo mới');
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (todo) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setError('');
    } catch {
      setError('Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) throw new Error();
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setError('');
    } catch {
      setError('Không thể xoá todo');
    } finally {
      setLoading(false);
    }
  };

  const onEnter = (event) => {
    if (event.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="page">
      <div className="panel">
        <header className="header">
          <div>
            <p className="eyebrow">Node.js + React</p>
            <h1>Todo List</h1>
          </div>
          <span className="pill">
            {remaining} việc chưa hoàn thành
          </span>
        </header>

        <div className="input-row">
          <input
            type="text"
            placeholder="Nhập việc cần làm..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onEnter}
            disabled={loading}
          />
          <button onClick={addTodo} disabled={loading || !text.trim()}>
            Thêm
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <ul className="list">
          {todos.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'done' : ''}>
              <label>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                  disabled={loading}
                />
                <span>{todo.text}</span>
              </label>
              <button className="ghost" onClick={() => deleteTodo(todo.id)} disabled={loading}>
                Xoá
              </button>
            </li>
          ))}
        </ul>

        {loading && <div className="loading">Đang xử lý...</div>}
      </div>
    </div>
  );
}
