import React, { useState, useEffect } from 'react';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchAssignments();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/assignments/user');
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-root">
        <style>{css}</style>
        <div className="stars"></div>
        <p className="loading-text">Initializing Ranger Console...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <style>{css}</style>
      <div className="stars"></div>

      <div className="dashboard-wrapper">
        <header className="dashboard-header">
          <h1 className="glitch" data-text={`Welcome, ${user?.name}`}>
            Welcome, {user?.name}
          </h1>
          <p className="user-email">{user?.email}</p>
        </header>

        <div className="dashboard-stats">
          <div className="stat-card neon-card">
            <h3>Total Assignments</h3>
            <p className="stat-number">{assignments.length}</p>
          </div>
          <div className="stat-card neon-card">
            <h3>Completed</h3>
            <p className="stat-number">
              {assignments.filter((a) => a.status === 'completed').length}
            </p>
          </div>
          <div className="stat-card neon-card">
            <h3>In Progress</h3>
            <p className="stat-number">
              {assignments.filter((a) => a.status === 'in-progress').length}
            </p>
          </div>
        </div>

        <section className="assignments-section neon-card">
          <h2>Your Missions</h2>

          {assignments.length === 0 ? (
            <p className="empty-text">No active missions.</p>
          ) : (
            <div className="table-wrapper">
              <table className="assignments-table">
                <thead>
                  <tr>
                    <th>Mission</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>{assignment.title}</td>
                      <td>
                        <span className={`status-badge ${assignment.status}`}>
                          {assignment.status}
                        </span>
                      </td>
                      <td>
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </td>
                      <td>
                        <button className="btn-view">Open</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const css = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Orbitron', sans-serif;
}

/* Background */
.dashboard-root {
  min-height: 100vh;
  background: #050505;
  color: white;
  position: relative;
  overflow: hidden;
}

.stars {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: #000 url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1231630/stars.png') repeat;
  z-index: 0;
  animation: moveStars 100s linear infinite;
}

@keyframes moveStars {
  from { background-position: 0 0; }
  to { background-position: -10000px 5000px; }
}

/* Wrapper */
.dashboard-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: auto;
  padding: 50px 20px;
}

/* Header */
.dashboard-header h1 {
  font-size: 36px;
  font-weight: 900;
  text-shadow: 0 0 15px rgba(255,255,255,0.5);
}

.user-email {
  margin-top: 6px;
  color: #67e8f9;
  letter-spacing: 0.1em;
}

/* Glitch effect (same as signup) */
.glitch {
  position: relative;
}
.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
}
.glitch::before {
  left: 2px;
  text-shadow: -1px 0 #ff00c1;
}
.glitch::after {
  left: -2px;
  text-shadow: -1px 0 #00fff9;
}

/* Stats */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 40px;
}

.neon-card {
  background: rgba(0,0,0,0.8);
  border: 1px solid rgba(168,85,247,0.4);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 0 50px rgba(168, 85, 247, 0.25);
  backdrop-filter: blur(14px);
  transition: transform .3s ease, box-shadow .3s ease;
}

.neon-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 0 80px rgba(168, 85, 247, 0.45);
}

.stat-card h3 {
  font-size: 13px;
  letter-spacing: 0.2em;
  color: #94a3b8;
  margin-bottom: 10px;
}

.stat-number {
  font-size: 42px;
  font-weight: 900;
}

/* Assignments */
.assignments-section {
  margin-top: 50px;
}

.assignments-section h2 {
  font-size: 26px;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.table-wrapper {
  overflow-x: auto;
}

.assignments-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(0,0,0,0.75);
  border-radius: 16px;
  overflow: hidden;
}

.assignments-table th,
.assignments-table td {
  padding: 16px;
  text-align: left;
  font-size: 14px;
}

.assignments-table thead {
  background: rgba(168,85,247,0.15);
}

.assignments-table tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.assignments-table tbody tr:hover {
  background: rgba(255,255,255,0.05);
}

/* Status */
.status-badge {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.status-badge.completed {
  background: rgba(34,197,94,0.2);
  color: #4ade80;
  border: 1px solid #22c55e;
}

.status-badge.in-progress {
  background: rgba(234,179,8,0.2);
  color: #facc15;
  border: 1px solid #eab308;
}

/* Buttons */
.btn-view {
  background: linear-gradient(135deg, #06b6d4, #7c3aed);
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  cursor: pointer;
  transition: all .25s ease;
}

.btn-view:hover {
  box-shadow: 0 0 30px rgba(124,58,237,0.8);
  transform: translateY(-2px);
}

.loading-text {
  position: relative;
  z-index: 2;
  font-size: 22px;
  text-align: center;
  padding-top: 40vh;
  color: #67e8f9;
  letter-spacing: .2em;
}

.empty-text {
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header h1 { font-size: 26px; }
  .stat-number { font-size: 32px; }
}
`;

export default UserDashboard;
