import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "../api/axios";
import "./Home.css";

const Home = () => {
  const { userDetails } = useSelector((state) => state.user);
  const [summary, setSummary] = useState({ total: 0, count: 0 });
  const [recent, setRecent] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ amount: "", description: "" });
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    try {
      const res = await axios.get("/expenses", { withCredentials: true });
      const data = res.data;

      const total = data.reduce((acc, item) => acc + Number(item.amount || 0), 0);
      const count = data.length;

      const sorted = [...data].sort((a, b) => b.id - a.id);
      const recentItems = sorted.slice(0, 5);

      setSummary({ total, count });
      setRecent(recentItems);
      setAllExpenses(sorted);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setError("");

    if (!newExpense.description || !newExpense.amount) {
      setError("Please enter both description and amount.");
      return;
    }

    try {
      await axios.post(
        "/expenses/add",
        {
          username: userDetails?.username,
          amount: Number(newExpense.amount),
          description: newExpense.description,
        },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      setShowAddModal(false);
      setNewExpense({ amount: "", description: "" });
      fetchSummary();
    } catch (err) {
      console.error("Error adding expense:", err);
      setError("Failed to add expense. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="home-container">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <h1>Welcome, {userDetails?.username || "User"} 👋</h1>
      <p className="subtitle">Here’s a quick review at your expenses.</p>

      <div className="dashboard-cards">
        <div className="card total-card">
          <h3>Amount spent</h3>
          <p className={`amount ${summary.total >= 0 ? "positive" : "negative"}`}>
            ${summary.total.toFixed(2)}
          </p>
        </div>
        <div className="card count-card">
          <h3>Total Entries</h3>
          <p className="count">{summary.count}</p>
        </div>
      </div>

      <div className="recent-header">
        <h2>Recent Entries</h2>
        <button className="btn link-btn" onClick={() => setShowAllModal(true)}>
          View All →
        </button>
      </div>

      {recent.length > 0 ? (
        <ul className="recent-list">
          {recent.map((item) => (
            <li key={item.id} className="recent-item">
              <span>{item.description}</span>
              <span
                className={`recent-amount ${item.amount >= 0 ? "positive" : "negative"}`}
              >
                ${item.amount}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No recent entries yet.</p>
      )}

      <div className="actions">
        <button onClick={() => setShowAddModal(true)} className="btn primary">
          + Add New Expense
        </button>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Expense</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleAddExpense}>
              <input
                type="text"
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, description: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, amount: e.target.value })
                }
              />
              <div className="modal-actions">
                <button type="submit" className="btn primary">Save</button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View All Modal */}
      {showAllModal && (
        <div className="modal-overlay" onClick={() => setShowAllModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            {/* ✅ Replaced bottom close button with top-right × */}
            <button
              className="close-btn"
              onClick={() => setShowAllModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2>All Expenses</h2>
            <div className="all-list">
              {allExpenses.map((item) => (
                <div key={item.id} className="all-item">
                  <span>{item.description}</span>
                  <span
                    className={`recent-amount ${item.amount >= 0 ? "positive" : "negative"}`}
                  >
                    ${item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
