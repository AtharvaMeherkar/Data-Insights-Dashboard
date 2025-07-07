// src/App.js
import React, { useState, useEffect, useCallback, useRef } from "react"; // Added useRef
import "./App.css"; // For global styles and font import
import { Bar, Pie } from "react-chartjs-2"; // Import Pie chart as well
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, // Needed for Pie chart
  Title,
  Tooltip,
  Legend,
} from "chart.js";
// Import icons from Lucide React
import {
  RefreshCw,
  BarChart2,
  AlertCircle,
  Loader2,
  ListTodo,
  CheckCircle,
  XCircle,
  User,
  Quote,
  Clock, // Keep Clock for Latest Todos
  Award, // Keep Award for Todo of the Day
} from "lucide-react"; // Ensure lucide-react is installed: npm install lucide-react
import Particles from "react-tsparticles"; // For background particles
import { loadSlim } from "@tsparticles/slim"; // CORRECTED IMPORT PATH for loadSlim
import useWindowSize from "react-use/lib/useWindowSize"; // Correct import for useWindowSize
import Confetti from "react-confetti"; // For confetti

// Register the necessary Chart.js components. This is crucial for charts to render.
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, // Register ArcElement for Pie chart
  Title,
  Tooltip,
  Legend
);

function App() {
  // State for raw API data (all todos)
  const [todos, setTodos] = useState([]);
  // State for chart data (todos per user)
  const [todosPerUserChartData, setTodosPerUserChartData] = useState({
    labels: [],
    datasets: [],
  });
  // State for completion status chart data
  const [completionStatusChartData, setCompletionStatusChartData] = useState({
    labels: [],
    datasets: [],
  });
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState(null);
  // State for a dynamic quote
  const [quote, setQuote] = useState({ text: "", author: "" });
  // State for selected user filter
  const [selectedUser, setSelectedUser] = useState("all");
  // State for confetti
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  // Particles initialization
  const particlesInit = useCallback(async (engine) => {
    // This is the correct way to load the slim bundle
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {
    // console.log("Particles container loaded", container);
  }, []);

  // Function to fetch a random quote
  const fetchQuote = useCallback(async () => {
    try {
      const response = await fetch("https://api.quotable.io/random");
      if (!response.ok) throw new Error("Failed to fetch quote");
      const data = await response.json();
      setQuote({ text: data.content, author: data.author });
    } catch (err) {
      console.error("Error fetching quote:", err);
      setQuote({
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
      }); // Fallback quote
    }
  }, []);

  // Function to fetch and process todo data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true); // Indicate loading has started
      setError(null); // Clear any previous errors

      // Fetch data from the JSONPlaceholder API for todos
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const fetchedTodos = await response.json();
      setTodos(fetchedTodos); // Store raw todos

      // --- Process data for "Todos per User" Bar Chart ---
      const todosPerUser = fetchedTodos.reduce((acc, todo) => {
        acc[todo.userId] = (acc[todo.userId] || 0) + 1;
        return acc;
      }, {});
      const userLabels = Object.keys(todosPerUser).map((id) => `User ${id}`);
      const userData = Object.values(todosPerUser);

      const barColors = [
        "rgba(75, 192, 192, 0.8)",
        "rgba(153, 102, 255, 0.8)",
        "rgba(255, 159, 64, 0.8)",
        "rgba(255, 99, 132, 0.8)",
        "rgba(54, 162, 235, 0.8)",
        "rgba(201, 203, 207, 0.8)",
        "rgba(255, 205, 86, 0.8)",
        "rgba(100, 200, 100, 0.8)",
        "rgba(200, 100, 200, 0.8)",
        "rgba(100, 100, 200, 0.8)",
      ];
      const dynamicBarColors = userLabels.map(
        (_, index) => barColors[index % barColors.length]
      );

      setTodosPerUserChartData({
        labels: userLabels,
        datasets: [
          {
            label: "Number of Todos",
            data: userData,
            backgroundColor: dynamicBarColors,
            borderColor: dynamicBarColors.map((color) =>
              color.replace("0.8", "1")
            ),
            borderWidth: 1,
            borderRadius: 8,
          },
        ],
      });

      // --- Process data for "Completion Status" Pie Chart ---
      const completedCount = fetchedTodos.filter(
        (todo) => todo.completed
      ).length;
      const incompleteCount = fetchedTodos.length - completedCount;

      setCompletionStatusChartData({
        labels: ["Completed", "Incomplete"],
        datasets: [
          {
            label: "Todos",
            data: [completedCount, incompleteCount],
            backgroundColor: [
              "rgba(75, 192, 192, 0.8)", // Greenish for completed
              "rgba(255, 99, 132, 0.8)", // Reddish for incomplete
            ],
            borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
            borderWidth: 1,
          },
        ],
      });

      // Show confetti if all todos are completed (simulated success)
      if (fetchedTodos.length > 0 && completedCount === fetchedTodos.length) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Hide after 5 seconds
      }
    } catch (err) {
      setError("Failed to fetch data: " + err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false); // Indicate loading has finished
    }
  }, []); // Empty dependency array means fetchData itself doesn't depend on props/state

  // Initial data fetch on component mount
  useEffect(() => {
    fetchData();
    fetchQuote(); // Fetch quote on mount
  }, [fetchData, fetchQuote]);

  // Chart options for Bar Chart
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { font: { size: 14, family: "Inter" }, color: "#333" },
      },
      title: {
        display: true,
        text: "Distribution of Todos Across Users",
        font: { size: 20, family: "Inter", weight: "bold" },
        color: "#2C3E50",
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.7)",
        bodyFont: { family: "Inter" },
        titleFont: { family: "Inter", weight: "bold" },
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#555", font: { family: "Inter" } },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
          color: "#555",
          font: { family: "Inter" },
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  // Chart options for Pie Chart
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right", // Position legend to the right for pie chart
        labels: { font: { size: 14, family: "Inter" }, color: "#333" },
      },
      title: {
        display: true,
        text: "Overall Todo Completion Status",
        font: { size: 20, family: "Inter", weight: "bold" },
        color: "#2C3E50",
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.7)",
        bodyFont: { family: "Inter" },
        titleFont: { family: "Inter", weight: "bold" },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          // Custom tooltip to show percentage
          label: function (context) {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.dataset.data.reduce(
              (sum, current) => sum + current,
              0
            );
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Derived states for summary cards
  const totalTodos = todos.length;
  const completedTodos = todos.filter((todo) => todo.completed).length;
  const incompleteTodos = totalTodos - completedTodos;

  // Find user with most/least todos
  const todosPerUserCounts = todos.reduce((acc, todo) => {
    acc[todo.userId] = (acc[todo.userId] || 0) + 1;
    return acc;
  }, {});

  let userWithMostTodos = null;
  let maxTodos = -1;
  let userWithLeastTodos = null;
  let minTodos = Infinity;

  if (Object.keys(todosPerUserCounts).length > 0) {
    for (const userId in todosPerUserCounts) {
      const count = todosPerUserCounts[userId];
      if (count > maxTodos) {
        maxTodos = count;
        userWithMostTodos = `User ${userId}`;
      }
      if (count < minTodos) {
        minTodos = count;
        userWithLeastTodos = `User ${userId}`;
      }
    }
  }

  // Filtered todos for "Latest Todos" list based on selected user
  const filteredTodos =
    selectedUser === "all"
      ? todos.slice().sort((a, b) => b.id - a.id) // Sort by ID descending for latest
      : todos
          .filter((todo) => todo.userId === parseInt(selectedUser))
          .sort((a, b) => b.id - a.id);

  // Get unique user IDs for the filter dropdown
  const uniqueUserIds = [...new Set(todos.map((todo) => todo.userId))].sort(
    (a, b) => a - b
  );

  return (
    // Main container div:
    // min-h-screen: Ensures it takes at least the full viewport height
    // w-full: Ensures it takes full viewport width
    // bg-gradient-to-br from-blue-100 to-purple-100: A subtle, appealing background gradient
    // flex items-center justify-center: Centers content horizontally and vertically
    // p-4 sm:p-8: Responsive padding for smaller and larger screens
    // font-inter: Applies the Inter font
    <div className="App min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 via-indigo-50 flex items-center justify-center p-4 sm:p-8 font-inter relative">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={500}
          recycle={false}
        />
      )}
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: {
                enable: true,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "repulse",
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: ["#4A90E2", "#50E3C2", "#A663CC"], // Primary, Secondary, Accent colors
            },
            links: {
              color: "#ffffff",
              distance: 150,
              enable: true,
              opacity: 0.3,
              width: 1,
            },
            collisions: {
              enable: true,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 1,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 5 },
            },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* Main content card: */}
      <div className="main-dashboard-card bg-white rounded-3xl shadow-2xl p-6 sm:p-10 w-full max-w-screen-2xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.005] relative z-10 overflow-hidden">
        {/* Dashboard Header */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center mb-8 border-b pb-6">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-0 flex items-center gap-4">
            <BarChart2 size={48} className="text-blue-600 drop-shadow-md" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Data Insights Dashboard
            </span>
          </h1>
          <button
            onClick={fetchData}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 active:scale-95 text-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={24} className="animate-spin mr-3" />
                Refreshing Data...
              </>
            ) : (
              <>
                <RefreshCw size={24} className="mr-3" />
                Refresh Data
              </>
            )}
          </button>
        </div>

        {/* Conditional Rendering for Loading, Error, or Content Grid */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-[500px] text-blue-600 bg-blue-50 rounded-xl shadow-inner">
            <Loader2 size={64} className="animate-spin mb-6" />
            <p className="text-2xl font-semibold">
              Loading data, please wait...
            </p>
            <p className="text-md text-gray-600 mt-2">
              Fetching the latest insights for you.
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-[500px] text-red-600 bg-red-50 border border-red-200 rounded-xl p-8 shadow-inner">
            <AlertCircle size={64} className="mb-6" />
            <p className="text-2xl font-semibold mb-3">Error Loading Data!</p>
            <p className="text-center text-gray-700 text-lg">{error}</p>
            <p className="text-md mt-4 text-gray-500">
              Please check your internet connection or try refreshing the data.
            </p>
          </div>
        )}

        {!loading && !error && todos.length > 0 ? (
          <div className="relative z-10 dashboard-grid">
            {/* Main Charts & Metrics Column */}
            <div className="dashboard-main-column">
              {/* Summary Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                {/* Total Todos Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
                  <ListTodo
                    size={48}
                    className="text-purple-500 mb-3 drop-shadow-sm"
                  />
                  <h3 className="text-xl font-bold text-gray-800">
                    Total Todos
                  </h3>
                  <p className="text-5xl font-extrabold text-purple-600 mt-2">
                    {totalTodos}
                  </p>
                </div>

                {/* Completed Todos Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
                  <CheckCircle
                    size={48}
                    className="text-green-500 mb-3 drop-shadow-sm"
                  />
                  <h3 className="text-xl font-bold text-gray-800">Completed</h3>
                  <p className="text-5xl font-extrabold text-green-600 mt-2">
                    {completedTodos}
                  </p>
                </div>

                {/* Incomplete Todos Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
                  <XCircle
                    size={48}
                    className="text-red-500 mb-3 drop-shadow-sm"
                  />
                  <h3 className="text-xl font-bold text-gray-800">
                    Incomplete
                  </h3>
                  <p className="text-5xl font-extrabold text-red-600 mt-2">
                    {incompleteTodos}
                  </p>
                </div>

                {/* Quote of the Day Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-center transition-transform duration-200 hover:shadow-xl hover:scale-[1.005] xl:col-span-1">
                  <Quote
                    size={40}
                    className="text-indigo-500 mb-4 mx-auto drop-shadow-sm"
                  />
                  <p className="text-lg italic text-gray-700 mb-3 text-center">
                    "{quote.text}"
                  </p>
                  <p className="text-md font-semibold text-gray-600 text-right">
                    - {quote.author}
                  </p>
                </div>
              </div>

              {/* Main Bar Chart Card */}
              <div className="bar-chart-card bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col transition-transform duration-200 hover:shadow-xl hover:scale-[1.005] h-[450px]">
                <div className="chart-container flex-grow">
                  <Bar data={todosPerUserChartData} options={barChartOptions} />
                </div>
              </div>
            </div>

            {/* Sidebar Column (Pie Chart, User Stats, Latest Todos) */}
            <div className="dashboard-sidebar-column">
              {/* Completed/Incomplete Pie Chart Card */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[300px] transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
                <div className="chart-container flex-grow">
                  <Pie
                    data={completionStatusChartData}
                    options={pieChartOptions}
                  />
                </div>
              </div>

              {/* User with Most/Least Todos Cards in a sub-grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
                  <User
                    size={48}
                    className="text-teal-500 mb-3 drop-shadow-sm"
                  />
                  <h3 className="text-xl font-bold text-gray-800">
                    User with Most Todos
                  </h3>
                  <p className="text-3xl font-extrabold text-teal-600 mt-2">
                    {userWithMostTodos || "N/A"}
                  </p>
                  {userWithMostTodos && (
                    <p className="text-lg text-gray-600">({maxTodos} todos)</p>
                  )}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
                  <User
                    size={48}
                    className="text-orange-500 mb-3 drop-shadow-sm"
                  />
                  <h3 className="text-xl font-bold text-gray-800">
                    User with Least Todos
                  </h3>
                  <p className="text-3xl font-extrabold text-orange-600 mt-2">
                    {userWithLeastTodos || "N/A"}
                  </p>
                  {userWithLeastTodos && (
                    <p className="text-lg text-gray-600">({minTodos} todos)</p>
                  )}
                </div>
              </div>

              {/* Latest Todos List Card */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock size={24} className="text-blue-500" /> Latest Todos
                  <select
                    className="ml-auto p-1 border rounded-md text-sm bg-gray-100 text-gray-700 focus:ring-blue-300 focus:border-blue-300"
                    onChange={(e) => setSelectedUser(e.target.value)}
                    value={selectedUser}
                  >
                    <option value="all">All Users</option>
                    {uniqueUserIds.map((id) => (
                      <option key={id} value={id}>
                        User {id}
                      </option>
                    ))}
                  </select>
                </h3>
                <div className="latest-todos-list-container">
                  <ul className="space-y-2">
                    {filteredTodos.slice(0, 10).map(
                      (
                        todo // Show top 10 latest
                      ) => (
                        <li
                          key={todo.id}
                          className="flex items-center justify-between text-gray-700 text-sm bg-gray-50 p-2 rounded-md border border-gray-100"
                        >
                          <span className="truncate flex-grow mr-2">
                            {todo.title}
                          </span>
                          {todo.completed ? (
                            <CheckCircle
                              size={16}
                              className="text-green-500 flex-shrink-0"
                              title="Completed"
                            />
                          ) : (
                            <ListTodo
                              size={16}
                              className="text-gray-400 flex-shrink-0"
                              title="Incomplete"
                            />
                          )}
                        </li>
                      )
                    )}
                    {filteredTodos.length === 0 && (
                      <li className="text-center text-gray-500 italic">
                        No todos found for this filter.
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Todo of the Day / Highlighted Todo Card */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-center text-center transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
                <Award
                  size={40}
                  className="text-yellow-500 mb-4 mx-auto drop-shadow-sm"
                />
                <h3 className="text-xl font-bold text-gray-800">
                  Todo of the Day
                </h3>
                {todos.length > 0 ? (
                  <>
                    <p className="text-lg font-semibold text-gray-700 mt-2">
                      "{todos[Math.floor(Math.random() * todos.length)].title}"
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      (User{" "}
                      {todos[Math.floor(Math.random() * todos.length)].userId})
                    </p>
                  </>
                ) : (
                  <p className="text-lg text-gray-500 mt-2">
                    No todos available.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="flex flex-col items-center justify-center h-[500px] text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-inner">
              <BarChart2 size={64} className="mb-6" />
              <p className="text-2xl font-semibold">No data to display.</p>
              <p className="text-md mt-4 text-gray-500">
                The API might not have returned any data, or there was an issue
                processing it.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
