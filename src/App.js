// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import './App.css'; // For global styles and font import
import { Bar, Pie } from 'react-chartjs-2'; // Import Pie chart as well
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement, // Needed for Pie chart
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// Import more icons from Lucide React
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
} from 'lucide-react';

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
  const [todosPerUserChartData, setTodosPerUserChartData] = useState({ labels: [], datasets: [] });
  // State for completion status chart data
  const [completionStatusChartData, setCompletionStatusChartData] = useState({ labels: [], datasets: [] });
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState(null);
  // State for a dynamic quote
  const [quote, setQuote] = useState({ text: '', author: '' });

  // Function to fetch a random quote
  const fetchQuote = useCallback(async () => {
    try {
      const response = await fetch('https://api.quotable.io/random');
      if (!response.ok) throw new Error('Failed to fetch quote');
      const data = await response.json();
      setQuote({ text: data.content, author: data.author });
    } catch (err) {
      console.error('Error fetching quote:', err);
      setQuote({ text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' }); // Fallback quote
    }
  }, []);

  // Function to fetch and process todo data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('https://jsonplaceholder.typicode.com/todos');
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
      const userLabels = Object.keys(todosPerUser).map(id => `User ${id}`);
      const userData = Object.values(todosPerUser);

      const barColors = [
        'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)',
        'rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(201, 203, 207, 0.8)',
        'rgba(255, 205, 86, 0.8)', 'rgba(100, 200, 100, 0.8)', 'rgba(200, 100, 200, 0.8)',
        'rgba(100, 100, 200, 0.8)',
      ];
      const dynamicBarColors = userLabels.map((_, index) => barColors[index % barColors.length]);

      setTodosPerUserChartData({
        labels: userLabels,
        datasets: [
          {
            label: 'Number of Todos',
            data: userData,
            backgroundColor: dynamicBarColors,
            borderColor: dynamicBarColors.map(color => color.replace('0.8', '1')),
            borderWidth: 1,
            borderRadius: 8,
          },
        ],
      });

      // --- Process data for "Completion Status" Pie Chart ---
      const completedCount = fetchedTodos.filter(todo => todo.completed).length;
      const incompleteCount = fetchedTodos.length - completedCount;

      setCompletionStatusChartData({
        labels: ['Completed', 'Incomplete'],
        datasets: [
          {
            label: 'Todos',
            data: [completedCount, incompleteCount],
            backgroundColor: [
              'rgba(75, 192, 192, 0.8)', // Greenish for completed
              'rgba(255, 99, 132, 0.8)', // Reddish for incomplete
            ],
            borderColor: [
              'rgba(75, 192, 192, 1)',
              'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
          },
        ],
      });
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
        position: 'top',
        labels: { font: { size: 14, family: 'Inter' }, color: '#333' },
      },
      title: {
        display: true,
        text: 'Distribution of Todos Across Users',
        font: { size: 20, family: 'Inter', weight: 'bold' },
        color: '#2C3E50',
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)', bodyFont: { family: 'Inter' },
        titleFont: { family: 'Inter', weight: 'bold' }, padding: 10, cornerRadius: 6,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#555', font: { family: 'Inter' } } },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5,
          color: '#555',
          font: { family: 'Inter' },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  // Chart options for Pie Chart
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', // Position legend to the right for pie chart
        labels: { font: { size: 14, family: 'Inter' }, color: '#333' },
      },
      title: {
        display: true,
        text: 'Overall Todo Completion Status',
        font: { size: 20, family: 'Inter', weight: 'bold' },
        color: '#2C3E50',
        padding: { top: 10, bottom: 20 },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)', bodyFont: { family: 'Inter' },
        titleFont: { family: 'Inter', weight: 'bold' }, padding: 10, cornerRadius: 6,
        callbacks: { // Custom tooltip to show percentage
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum, current) => sum + current, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  // Derived states for summary cards
  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
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


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 via-indigo-50 flex items-center justify-center p-4 sm:p-8 font-inter">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 w-full max-w-6xl border border-gray-100 transform transition-all duration-300 hover:scale-[1.005] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>


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
            <p className="text-2xl font-semibold">Loading data, please wait...</p>
            <p className="text-md text-gray-600 mt-2">Fetching the latest insights for you.</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-[500px] text-red-600 bg-red-50 border border-red-200 rounded-xl p-8 shadow-inner">
            <AlertCircle size={64} className="mb-6" />
            <p className="text-2xl font-semibold mb-3">Error Loading Data!</p>
            <p className="text-center text-gray-700 text-lg">{error}</p>
            <p className="text-md mt-4 text-gray-500">Please check your internet connection or try refreshing the data.</p>
          </div>
        )}

        {!loading && !error && todos.length > 0 ? (
          // THIS IS THE CRUCIAL CHANGE: Apply grid classes here
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Main Chart Card (Bar Chart) - now spans 2 columns on medium/large screens */}
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col transition-transform duration-200 hover:shadow-xl hover:scale-[1.005] h-[450px]">
              <div className="chart-container flex-grow">
                <Bar data={todosPerUserChartData} options={barChartOptions} />
              </div>
            </div>

            {/* Right Sidebar - Stats and Secondary Chart */}
            {/* This div itself is now a grid item, and its children will be its own grid */}
            <div className="grid grid-cols-1 gap-6"> {/* This inner grid ensures these items stack vertically */}
              {/* Total Todos Card */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
                <ListTodo size={48} className="text-purple-500 mb-3 drop-shadow-sm" />
                <h3 className="text-xl font-bold text-gray-800">Total Todos</h3>
                <p className="text-5xl font-extrabold text-purple-600 mt-2">{totalTodos}</p>
              </div>

              {/* Completed/Incomplete Pie Chart Card */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[300px] transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
                <div className="chart-container flex-grow">
                  <Pie data={completionStatusChartData} options={pieChartOptions} />
                </div>
              </div>
            </div>

            {/* Additional Cards - Now placed outside the "Right Sidebar" to allow more flexible layout */}
            {/* These will naturally flow into the grid based on the main grid-cols setting */}

            {/* User with Most Todos Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
              <User size={48} className="text-teal-500 mb-3 drop-shadow-sm" />
              <h3 className="text-xl font-bold text-gray-800">User with Most Todos</h3>
              <p className="text-3xl font-extrabold text-teal-600 mt-2">{userWithMostTodos || 'N/A'}</p>
              {userWithMostTodos && <p className="text-lg text-gray-600">({maxTodos} todos)</p>}
            </div>

            {/* User with Least Todos Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center transition-transform duration-200 hover:shadow-xl hover:scale-[1.005]">
              <User size={48} className="text-orange-500 mb-3 drop-shadow-sm" />
              <h3 className="text-xl font-bold text-gray-800">User with Least Todos</h3>
              <p className="text-3xl font-extrabold text-orange-600 mt-2">{userWithLeastTodos || 'N/A'}</p>
              {userWithLeastTodos && <p className="text-lg text-gray-600">({minTodos} todos)</p>}
            </div>

            {/* Quote of the Day Card */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-center transition-transform duration-200 hover:shadow-xl hover:scale-[1.005] lg:col-span-1">
              <Quote size={40} className="text-indigo-500 mb-4 mx-auto drop-shadow-sm" />
              <p className="text-lg italic text-gray-700 mb-3 text-center">"{quote.text}"</p>
              <p className="text-md font-semibold text-gray-600 text-right">- {quote.author}</p>
            </div>
          </div>
        ) : (
          !loading && !error && (
            <div className="flex flex-col items-center justify-center h-[500px] text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-inner">
              <BarChart2 size={64} className="mb-6" />
              <p className="text-2xl font-semibold">No data to display.</p>
              <p className="text-md mt-4 text-gray-500">The API might not have returned any data, or there was an issue processing it.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;