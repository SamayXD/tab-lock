import React, { useState, useEffect } from "react";
import dangGif from "/public/dang-dang-it.gif";

export const BlockedPage = () => {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("blockedPageTodos");
    return saved
      ? JSON.parse(saved)
      : [
          { id: 1, text: "Take a deep breath", completed: false },
          { id: 2, text: "Stretch for 2 minutes", completed: false },
          { id: 3, text: "Drink some water", completed: false },
        ];
  });
  const [newTodo, setNewTodo] = useState("");

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("blockedPageTodos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setTodos([
      ...todos,
      { id: Date.now(), text: newTodo.trim(), completed: false },
    ]);
    setNewTodo("");
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/10">
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center p-[2px] rounded-md">
            <img
              src={chrome.runtime.getURL("dang-dang-it.gif")}
              alt="Blocked Site Animation"
              className="w-full h-full object-cover rounded-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "🔒";
              }}
            />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            This site is blocked
          </h1>
        </div>

        <form onSubmit={addTodo} className="mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="w-full px-4 py-2 bg-white/10 rounded-xl text-white text-sm
                     border-2 border-white/5 focus:border-blue-500/50
                     focus:outline-none focus:bg-white/20 transition-all"
          />
        </form>

        <ul className="space-y-2">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl 
                       hover:bg-white/10 transition-all group"
            >
              <div
                onClick={() => toggleTodo(todo.id)}
                className={`w-5 h-5 rounded-md border-2 cursor-pointer
                          flex items-center justify-center transition-all
                          ${
                            todo.completed
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 border-transparent"
                              : "border-white/30"
                          }`}
              >
                {todo.completed && (
                  <span className="text-white text-xs">✓</span>
                )}
              </div>
              <span
                className={`flex-1 text-white/90 ${
                  todo.completed ? "line-through opacity-50" : ""
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-red-400
                         hover:text-red-300 transition-all px-2 text-2xl"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
