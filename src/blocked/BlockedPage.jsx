import React, { useState, useEffect } from "react";
import dangGif from "/public/dang-dang-it.gif";

export const BlockedPage = () => {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("blockedPageTodos");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            text: "Take a deep breath",
            completed: false,
            category: "wellness",
          },
          {
            id: 2,
            text: "Stretch for 2 minutes",
            completed: false,
            category: "wellness",
          },
          {
            id: 3,
            text: "Drink some water",
            completed: false,
            category: "health",
          },
          {
            id: 4,
            text: "Write down your next task",
            completed: false,
            category: "productivity",
          },
        ];
  });
  const [newTodo, setNewTodo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [motivationalQuote] = useState(() => {
    const quotes = [
      "Take a mindful pause",
      "Reset and reflect",
      "Stay focused on what matters",
      "Small steps lead to big changes",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  });

  const categories = {
    wellness: "🧘‍♀️",
    health: "💪",
    productivity: "📈",
    custom: "✨",
  };

  useEffect(() => {
    localStorage.setItem("blockedPageTodos", JSON.stringify(todos));
  }, [todos]);

  const progress = Math.round(
    (todos.filter((t) => t.completed).length / todos.length) * 100
  );

  const addTodo = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        category: selectedCategory === "all" ? "custom" : selectedCategory,
      },
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

  const deleteTask = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#111111] p-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 50%, transparent 70%)",
            animation: "moveOrb 20s infinite linear",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        <div className="text-center mb-8">
          <p className="text-white/50 text-sm mb-4 animate-fade-in">
            {motivationalQuote}
          </p>
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-b from-neutral-800 to-neutral-900 
                        flex items-center justify-center border border-neutral-700/30
                        transform hover:scale-105 transition-all duration-300"
          >
            <span className="text-2xl animate-pulse">🔒</span>
          </div>
          <h1
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 
                       bg-clip-text text-transparent mb-2 animate-slide-up"
          >
            SITE LOCKED
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-white/50 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto py-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full text-sm transition-all ${
              selectedCategory === "all"
                ? "bg-white/10 text-white"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            All
          </button>
          {Object.entries(categories).map(([cat, emoji]) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-2 ${
                selectedCategory === cat
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {emoji} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={addTodo} className="mb-6">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task..."
            className="w-full px-4 py-2 bg-white/5 rounded-lg text-sm text-white
                     border border-white/10 focus:border-blue-500/50
                     focus:outline-none focus:bg-white/10 transition-all"
          />
        </form>

        <ul className="space-y-2">
          {todos
            .filter(
              (todo) =>
                selectedCategory === "all" || todo.category === selectedCategory
            )
            .map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center gap-3 p-3 bg-white/5 rounded-lg
                         hover:bg-white/10 transition-all duration-200"
              >
                <button
                  onClick={() =>
                    setTodos(
                      todos.map((t) =>
                        t.id === todo.id ? { ...t, completed: !t.completed } : t
                      )
                    )
                  }
                  className="flex items-center gap-3 flex-1"
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2
                                flex items-center justify-center transition-all duration-300
                                ${
                                  todo.completed
                                    ? "bg-gradient-to-r from-blue-500 to-purple-500 border-transparent"
                                    : "border-white/30"
                                }`}
                  >
                    {todo.completed && (
                      <span className="text-white text-xs animate-scale-in">
                        ✓
                      </span>
                    )}
                  </div>
                  <span
                    className={`flex-1 text-white/90 transition-all duration-200
                                ${
                                  todo.completed
                                    ? "line-through opacity-50"
                                    : ""
                                }`}
                  >
                    {todo.text}
                  </span>
                </button>
                <span className="text-white/30 text-sm">
                  {categories[todo.category]}
                </span>
                <button
                  onClick={() => deleteTask(todo.id)}
                  className="opacity-0 group-hover:opacity-100 px-2 text-white/30 
                           hover:text-red-400 transition-all duration-200"
                >
                  ×
                </button>
              </li>
            ))}
        </ul>
      </div>

      <style jsx>{`
        @keyframes moveOrb {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateY(0);
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) translateY(-30px);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
