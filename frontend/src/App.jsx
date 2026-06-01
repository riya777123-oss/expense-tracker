import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import './App.css';

const API_URL = "https://expense-tracker-backend-1js4.onrender.com/api/expenses";
const COLORS = ['#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#B983FF', '#6C757D'];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  
  // Auth states (Mocked for UI demonstration)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Budget settings
  const budgetLimit = 20000; 

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(API_URL);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchExpenses();
  }, [isLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) return alert('Please fill in all fields');

    try {
      await axios.post(API_URL, { title, amount: parseFloat(amount), category });
      setTitle(''); setAmount('');
      fetchExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  // --- DATA PROCESSING FOR CHARTS ---
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const budgetPercentage = (totalSpent / budgetLimit) * 100;

  // 1. Group data by category for the Pie/Donut Chart
  const categoryDataObj = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const pieChartData = Object.keys(categoryDataObj).map(cat => ({
    name: cat,
    value: categoryDataObj[cat]
  }));

  // 2. Group data by date for Line Graph trend (showing chronological flow)
  const lineChartData = [...expenses]
    .reverse() // show oldest to newest
    .map(item => ({
      date: new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      Amount: item.amount
    }));

  // Render Login/Signup Gatehouse
  if (!isLoggedIn) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <h2>{isSignUp ? '✨ Create Account' : '🔒 Secure Login'}</h2>
          <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="auth-form">
            <input type="email" placeholder="Email Address" required value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
            <input type="password" placeholder="Password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)} />
            <button type="submit" className="btn-primary">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
          </form>
          <p onClick={() => setIsSignUp(!isSignUp)} className="auth-toggle">
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header navigation element */}
      <header className="dash-header">
        <h1>📊 FinInsight <span className="logo-sub">Tracker</span></h1>
        <button className="btn-logout" onClick={() => setIsLoggedIn(false)}>Logout</button>
      </header>

      <div className="dashboard-grid">
        {/* LEFT COLUMN: Input Form & History */}
        <div className="dash-column">
          {/* Card 1: Dynamic Alert Card */}
          <div className={`status-card ${budgetPercentage >= 100 ? 'danger' : budgetPercentage >= 80 ? 'warning' : 'normal'}`}>
            <h3>Monthly Spending Status</h3>
            <div className="status-flex">
              <div>
                <p className="label">Total Spent</p>
                <p className="main-val">₹{totalSpent.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="label">Budget Limit</p>
                <p className="limit-val">₹{budgetLimit.toLocaleString('en-IN')}</p>
              </div>
            </div>
            {budgetPercentage >= 100 && <div className="alert-msg">🚨 Alert: You have breached your monthly budget limit!</div>}
            {budgetPercentage >= 80 && budgetPercentage < 100 && <div className="alert-msg">⚠️ Warning: You've consumed over 80% of your budget!</div>}
          </div>

          {/* Card 2: Entry Form */}
          <div className="glass-card">
            <h3>Add Transaction</h3>
            <form onSubmit={handleSubmit} className="expense-form">
              <input type="text" placeholder="Expense description..." value={title} onChange={(e) => setTitle(e.target.value)} />
              <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Food">Food</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>
              <button type="submit" className="btn-primary">Track Expense</button>
            </form>
          </div>

          {/* Card 3: History Ledger */}
          <div className="glass-card history-card">
            <h3>Transaction History</h3>
            <ul className="expense-list">
              {expenses.map((expense) => (
                <li key={expense._id} className="expense-item">
                  <div className="item-details">
                    <span className="item-title">{expense.title}</span>
                    <span className="item-tag">{expense.category}</span>
                  </div>
                  <div className="item-actions">
                    <span className="item-cost">₹{expense.amount.toFixed(2)}</span>
                    <button onClick={() => handleDelete(expense._id)} className="delete-btn">🗑️</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Financial Analytics */}
        <div className="dash-column visual-column">
          {/* Donut Chart Card */}
          <div className="glass-card chart-wrapper">
            <h3>Category Distribution</h3>
            {pieChartData.length === 0 ? <p className="no-data">No data available to render charts.</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieChartData} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Line Graph Card */}
          <div className="glass-card chart-wrapper">
            <h3>Spending Trend Over Time</h3>
            {lineChartData.length === 0 ? <p className="no-data">Add items to chart progress timelines.</p> : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={lineChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2e45" />
                  <XAxis dataKey="date" stroke="#a0aec0" fontSize={11} />
                  <YAxis stroke="#a0aec0" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1f36', borderColor: '#2d3748', color: '#fff' }} />
                  <Line type="monotone" dataKey="Amount" stroke="#4D96FF" strokeWidth={3} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;