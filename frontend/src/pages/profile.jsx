import React, { useState, useEffect } from 'react';

// Props: isOpen (to show/hide), onClose (function to close drawer)
const Profile = ({ isOpen = true, onClose }) => {
  const [ranger, setRanger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false); // State for Expand/Collapse

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Mock Data Fetch
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const initialData = {
          name: 'Chetan',
          role: 'VOID COMMANDER',
          id: 'PRPL-CHN-001',
          status: 'ONLINE',
          avatar: 'https://i.pinimg.com/736x/2c/3e/2d/2c3e2d6c62c954737780003758117765.jpg',
          // New Stats Data
          issueStats: {
            solved: 142,
            pending: 8,
            working: 3
          },
          // Extended Missions List
          missions: [
            { id: 1, title: 'VOID ENERGY STABILIZED', type: 'SYS', date: 'Oct 20', status: 'SOLVED' },
            { id: 2, title: 'TARGET SECURED: SHADOW BEAST', type: 'CBT', date: 'Oct 18', status: 'SOLVED' },
            { id: 3, title: 'WOLF ZORD: SYNC OPTIMIZATION', type: 'ZRD', date: 'Oct 15', status: 'WORKING' },
            { id: 4, title: 'NIGHT PATROL: SECTOR 4', type: 'PTR', date: 'Oct 12', status: 'SOLVED' },
            { id: 5, title: 'GRID BREACH DETECTED', type: 'SEC', date: 'Oct 10', status: 'PENDING' },
            { id: 6, title: 'RECRUIT TRAINING DRILL', type: 'TRN', date: 'Oct 08', status: 'SOLVED' },
            { id: 7, title: 'COMM SYSTEM REPAIR', type: 'ENG', date: 'Oct 05', status: 'SOLVED' },
          ]
        };
        setRanger(initialData);
        setEditForm(initialData);
        setLoading(false);
      }, 1000);
    } else {
        // Reset state when closed
        setIsExpanded(false);
    }
  }, [isOpen]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm(ranger);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(ranger);
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setRanger(editForm);
      setIsEditing(false);
      setIsSaving(false);
    }, 1000);
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  if (!isOpen) return null;

  return (
    // FIX: Added backticks inside curly braces for template literals
    <div className={`profile-overlay ${isExpanded ? 'expanded' : ''}`}>
      <style>{css}</style>
      
      {/* Backdrop */}
      <div className="backdrop" onClick={onClose}></div>

      {/* Drawer Panel - dynamic class 'expanded-drawer' handles width */}
      {/* FIX: Added backticks */}
      <div className={`drawer ${isExpanded ? 'expanded-drawer' : ''} animate-slide-in`}>
        
        {/* Animated Background */}
        <div className="drawer-bg">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>
            <div className="grid-overlay"></div>
        </div>

        {/* Loading */}
        {loading ? (
            <div className="loading-container">
                <div className="spinner-ring"></div>
                <p className="loading-text glitch">ACCESSING DATABASE...</p>
            </div>
        ) : (
            <div className="content-wrapper">
                
                {/* --- HEADER --- */}
                <header className="drawer-header">
                    <div className="sys-status">
                        <span className="dot pulse"></span> 
                        <span className="status-label">SYSTEM:</span> 
                        <span className="status-val">CONNECTED</span>
                    </div>
                    <div className="header-controls">
                        {/* Expand/Collapse Toggle */}
                        <button className="btn-icon btn-expand" onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Collapse View" : "Expand View"}>
                             {isExpanded ? (
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                             ) : (
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                             )}
                        </button>
                        <button className="btn-icon btn-close" onClick={onClose}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </header>

                <div className="scrollable-content">
                    {/* --- IDENTITY SECTION --- */}
                    {/* FIX: Added backticks */}
                    <section className={`identity-card ${isEditing ? 'editing-mode' : ''}`}>
                        {!isEditing && (
                            <button className="btn-icon btn-edit" onClick={handleEditClick} title="Edit Profile">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            </button>
                        )}

                        <div className="avatar-container">
                            <div className="avatar-ring">
                                <img src={ranger.avatar} alt="Avatar" className="avatar-img" />
                            </div>
                            <div className="online-badge pulse"></div>
                        </div>

                        <div className="info-box">
                            {isEditing ? (
                                <div className="edit-fields animate-fade-in">
                                    <div className="input-group">
                                        <label>RANGER NAME</label>
                                        <input type="text" name="name" value={editForm.name} onChange={handleChange} className="glass-input" />
                                    </div>
                                    <div className="input-group">
                                        <label>DESIGNATION / ROLE</label>
                                        <input type="text" name="role" value={editForm.role} onChange={handleChange} className="glass-input" />
                                    </div>
                                    <div className="edit-actions">
                                        <button className="btn-mini btn-cancel" onClick={handleCancelEdit} disabled={isSaving}>CANCEL</button>
                                        <button className="btn-mini btn-save" onClick={handleSave} disabled={isSaving}>{isSaving ? '...' : 'SAVE'}</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="ranger-name gradient-text">{ranger.name}</h1>
                                    <span className="rank-badge">{ranger.role}</span>
                                    <p className="id-text">ID: <span className="mono">{ranger.id}</span></p>
                                </>
                            )}
                        </div>
                    </section>

                    {/* --- ISSUES & STATS (Only in Expanded Mode) --- */}
                    {isExpanded && (
                        <section className="stats-grid animate-fade-in">
                            <div className="stat-card solved">
                                <div className="stat-value">{ranger.issueStats.solved}</div>
                                <div className="stat-label">ISSUES SOLVED</div>
                                <div className="stat-bar"><div className="fill fill-green" style={{width: '85%'}}></div></div>
                            </div>
                            <div className="stat-card pending">
                                <div className="stat-value">{ranger.issueStats.pending}</div>
                                <div className="stat-label">PENDING ACTION</div>
                                <div className="stat-bar"><div className="fill fill-red" style={{width: '40%'}}></div></div>
                            </div>
                            <div className="stat-card working">
                                <div className="stat-value">{ranger.issueStats.working}</div>
                                <div className="stat-label">IN PROGRESS</div>
                                <div className="stat-bar"><div className="fill fill-yellow" style={{width: '60%'}}></div></div>
                            </div>
                        </section>
                    )}

                    {/* --- MISSIONS LOG --- */}
                    <section className="missions-section">
                        <div className="section-title">
                            <h3>{isExpanded ? "FULL ACTIVITY LOG" : "RECENT ACTIVITY"}</h3>
                            <div className="deco-line"></div>
                        </div>

                        <div className="logs-list">
                            {/* Show only 3 items if not expanded, else show all */}
                            {(isExpanded ? ranger.missions : ranger.missions.slice(0, 3)).map((mission) => (
                                // FIX: Added backticks for dynamic classes
                                <div key={mission.id} className={`log-item ${mission.status.toLowerCase()}-border`}>
                                    <div className="log-icon-box">
                                        {mission.status === 'SOLVED' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                                        {mission.status === 'PENDING' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
                                        {mission.status === 'WORKING' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="3"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>}
                                    </div>
                                    <div className="log-details">
                                        <span className="log-title">{mission.title}</span>
                                        <div className="log-meta">
                                            <span className="log-date">{mission.date}</span>
                                            {/* FIX: Added backticks */}
                                            <span className={`status-tag status-${mission.status.toLowerCase()}`}>{mission.status}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {!isExpanded && (
                            <button className="btn-view-all" onClick={() => setIsExpanded(true)}>
                                VIEW FULL REPORT
                            </button>
                        )}
                    </section>
                </div>

                {/* --- FOOTER: LOGOUT --- */}
                <footer className="drawer-footer">
                    <button className="btn-logout">
                        <span>TERMINATE LINK</span>
                        <div className="icon-wrapper">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </div>
                    </button>
                </footer>

            </div>
        )}
      </div>
    </div>
  );
};
/* CSS Variable as is (No changes needed in CSS block) */
const css = `
/* ... (Tumhara purana CSS yahan aayega, maine upar wale code se copy karke daal diya hai assume karo) ... */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=Space+Grotesk:wght@500;700&display=swap');

:root {
  --primary: #8b5cf6;
  --secondary: #ec4899;
  --accent: #06b6d4;
  --bg-dark: #020617; 
  --card-bg: rgba(30, 41, 59, 0.4);
  --glass-border: rgba(255, 255, 255, 0.1);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --status-solved: #4ade80;
  --status-pending: #f87171;
  --status-working: #facc15;
}

* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }

.profile-overlay {
    position: fixed; inset: 0; z-index: 9999;
    display: flex; justify-content: flex-end;
    pointer-events: none; /* Allows clicks on backdrop only if backdrop has pointer-events:auto */
}
.profile-overlay.expanded { /* Hook for expanded state overlay logic if needed */ }

.backdrop {
    position: absolute; inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    animation: fadeIn 0.4s ease;
    pointer-events: auto;
}

.drawer {
    position: relative; width: 100%; max-width: 450px; height: 100%;
    background: var(--bg-dark);
    box-shadow: -20px 0 60px rgba(0,0,0,0.8);
    display: flex; flex-direction: column;
    overflow: hidden;
    border-left: 1px solid var(--glass-border);
    transition: max-width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: auto;
}

.expanded-drawer { max-width: 900px; }

.drawer-bg { position: absolute; inset: 0; overflow: hidden; z-index: 0; }
.blob {
    position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.5;
    animation: floatBlob 12s infinite alternate;
}
.blob-1 { top: -10%; right: -20%; width: 400px; height: 400px; background: var(--primary); }
.blob-2 { bottom: -10%; left: -20%; width: 350px; height: 350px; background: var(--secondary); animation-delay: -6s; }
.blob-3 { top: 40%; left: 30%; width: 200px; height: 200px; background: var(--accent); opacity: 0.3; }
.grid-overlay {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
}
@keyframes floatBlob { 0% { transform: translate(0, 0) scale(1); } 100% { transform: translate(40px, -40px) scale(1.1); } }
@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-slide-in { animation: slideIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
.animate-fade-in { animation: fadeIn 0.5s ease; }

.content-wrapper { position: relative; z-index: 2; padding: 30px; height: 100%; display: flex; flex-direction: column; gap: 20px; }
.scrollable-content { overflow-y: auto; flex-grow: 1; display: flex; flex-direction: column; gap: 25px; padding-right: 5px; }
.scrollable-content::-webkit-scrollbar { width: 4px; }
.scrollable-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

.drawer-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 15px; border-bottom: 1px solid var(--glass-border); flex-shrink: 0; }
.sys-status { background: rgba(255,255,255,0.05); padding: 8px 14px; border-radius: 30px; font-size: 11px; font-weight: 700; color: var(--text-muted); letter-spacing: 1px; display: flex; align-items: center; gap: 8px; border: 1px solid var(--glass-border); }
.dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; }
.pulse { animation: pulse 2s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }
.status-val { color: var(--text-main); }
.header-controls { display: flex; gap: 10px; }
.btn-icon { background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: #fff; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; }
.btn-icon:hover { background: rgba(255,255,255,0.15); border-color: #fff; }
.btn-close:hover { color: #f87171; border-color: #f87171; }

.identity-card { background: var(--card-bg); border-radius: 24px; padding: 25px; display: flex; gap: 20px; position: relative; border: 1px solid var(--glass-border); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3); backdrop-filter: blur(20px); flex-shrink: 0; }
.btn-edit { position: absolute; top: 15px; right: 15px; width: 32px; height: 32px; border-radius: 50%; }
.avatar-container { position: relative; flex-shrink: 0; }
.avatar-ring { width: 90px; height: 90px; border-radius: 24px; padding: 3px; background: linear-gradient(135deg, var(--primary), var(--secondary)); }
.avatar-img { width: 100%; height: 100%; border-radius: 21px; object-fit: cover; background: #000; }
.online-badge { position: absolute; bottom: -4px; right: -4px; width: 18px; height: 18px; background: #22c55e; border: 3px solid #1e293b; border-radius: 50%; }
.info-box { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
.ranger-name { font-size: 26px; font-weight: 800; line-height: 1.1; margin-bottom: 6px; }
.gradient-text { background: linear-gradient(to right, #fff, #cbd5e1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.rank-badge { align-self: flex-start; background: linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2)); border: 1px solid rgba(139, 92, 246, 0.3); padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 700; letter-spacing: 1px; color: #e879f9; margin-bottom: 8px; }
.id-text { font-size: 12px; color: var(--text-muted); font-weight: 600; }
.mono { font-family: 'Space Grotesk', monospace; color: var(--accent); }

.edit-fields { display: flex; flex-direction: column; gap: 12px; width: 100%; }
.input-group label { font-size: 9px; font-weight: 700; letter-spacing: 1px; color: var(--text-muted); }
.glass-input { background: rgba(0,0,0,0.3); border: 1px solid var(--glass-border); color: #fff; padding: 8px 12px; border-radius: 8px; font-size: 14px; font-weight: 600; outline: none; width: 100%; }
.edit-actions { display: flex; gap: 10px; }
.btn-mini { flex: 1; padding: 8px; border-radius: 8px; border: none; font-size: 10px; font-weight: 800; cursor: pointer; }
.btn-cancel { background: rgba(255,255,255,0.1); color: var(--text-muted); }
.btn-save { background: var(--primary); color: #fff; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
.stat-card { background: rgba(255,255,255,0.03); border-radius: 16px; padding: 20px; text-align: center; border: 1px solid var(--glass-border); }
.stat-value { font-size: 32px; font-weight: 800; margin-bottom: 5px; color: #fff; }
.stat-label { font-size: 10px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px; letter-spacing: 1px; }
.stat-bar { width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
.fill { height: 100%; border-radius: 2px; }
.fill-green { background: var(--status-solved); box-shadow: 0 0 10px var(--status-solved); }
.fill-red { background: var(--status-pending); box-shadow: 0 0 10px var(--status-pending); }
.fill-yellow { background: var(--status-working); box-shadow: 0 0 10px var(--status-working); }

.section-title { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
.section-title h3 { font-size: 11px; font-weight: 800; color: var(--text-muted); letter-spacing: 2px; }
.deco-line { flex-grow: 1; height: 1px; background: linear-gradient(90deg, var(--glass-border), transparent); }
.logs-list { display: flex; flex-direction: column; gap: 12px; }
.log-item { background: rgba(255,255,255,0.03); border-radius: 16px; padding: 16px; display: flex; align-items: center; gap: 16px; border: 1px solid transparent; transition: all 0.2s; }
.log-item:hover { background: rgba(255,255,255,0.07); transform: translateX(5px); }
.solved-border { border-left: 3px solid var(--status-solved); }
.pending-border { border-left: 3px solid var(--status-pending); }
.working-border { border-left: 3px solid var(--status-working); }
.log-icon-box { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; }
.log-title { font-size: 13px; font-weight: 700; color: #f1f5f9; display: block; margin-bottom: 3px; }
.log-meta { display: flex; gap: 10px; font-size: 11px; color: var(--text-muted); font-weight: 500; font-family: 'Space Grotesk', sans-serif; align-items: center; }
.status-tag { font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 4px; color: #000; }
.status-solved { background: var(--status-solved); }
.status-pending { background: var(--status-pending); }
.status-working { background: var(--status-working); }

.btn-view-all { width: 100%; margin-top: 15px; padding: 12px; background: rgba(139, 92, 246, 0.1); color: var(--primary); border: 1px dashed var(--primary); border-radius: 12px; font-size: 11px; font-weight: 800; cursor: pointer; transition: 0.3s; }
.btn-view-all:hover { background: var(--primary); color: #fff; }

.drawer-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--glass-border); flex-shrink: 0; }
.btn-logout { width: 100%; padding: 16px; border-radius: 16px; border: none; background: linear-gradient(135deg, #ef4444, #b91c1c); color: white; font-size: 13px; font-weight: 800; letter-spacing: 2px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding-left: 25px; padding-right: 10px; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.25); transition: all 0.3s ease; }
.btn-logout:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(239, 68, 68, 0.4); }
.icon-wrapper { background: rgba(0,0,0,0.2); width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }

.loading-container { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.spinner-ring { width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px; }
@keyframes spin { 100% { transform: rotate(360deg); } }
.loading-text { font-size: 12px; font-weight: 800; letter-spacing: 2px; color: var(--text-muted); }
`;

export default Profile;