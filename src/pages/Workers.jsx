import { useState } from "react";
import DataTable from "../components/DataTable";
import "../css/Workers.css";

const WorkerManagement = () => {
  // Sample worker data
  const [workers, setWorkers] = useState([
    { id: 1, name: "John Smith", team: "Team Green", status: "Active", contact: "john@ecowaste.com", skills: ["Paper", "Glass"], lastActive: "2 hours ago" },
    { id: 2, name: "Maria Garcia", team: "Team Blue", status: "Active", contact: "maria@ecowaste.com", skills: ["Organic", "Plastic"], lastActive: "30 minutes ago" },
    { id: 3, name: "David Kim", team: "Team Red", status: "On Leave", contact: "david@ecowaste.com", skills: ["Metal", "Hazardous"], lastActive: "3 days ago" },
    { id: 4, name: "Sarah Johnson", team: "Team Yellow", status: "Active", contact: "sarah@ecowaste.com", skills: ["Paper", "Glass", "Metal"], lastActive: "1 hour ago" },
    { id: 5, name: "Michael Chen", team: "Team Green", status: "Inactive", contact: "michael@ecowaste.com", skills: ["Organic", "Compost"], lastActive: "1 week ago" },
  ]);

  // State for modals
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [showWorkerDetails, setShowWorkerDetails] = useState(null);
  const [showAssignTeam, setShowAssignTeam] = useState(null);

  // State for new worker form
  const [newWorker, setNewWorker] = useState({
    name: "",
    contact: "",
    team: "",
    skills: []
  });

  // Available teams and skills
  const teams = ["Team Green", "Team Blue", "Team Red", "Team Yellow"];
  const allSkills = ["Paper", "Glass", "Organic", "Plastic", "Metal", "Hazardous", "Compost"];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWorker(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle skill toggle
  const toggleSkill = (skill) => {
    setNewWorker(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  // Add new worker
  const handleAddWorker = (e) => {
    e.preventDefault();
    const worker = {
      id: workers.length + 1,
      name: newWorker.name,
      team: newWorker.team,
      status: "Active",
      contact: newWorker.contact,
      skills: newWorker.skills,
      lastActive: "Just now"
    };
    setWorkers([...workers, worker]);
    setShowAddWorker(false);
    setNewWorker({
      name: "",
      contact: "",
      team: "",
      skills: []
    });
  };

  // Assign team to worker
  const handleAssignTeam = (workerId, team) => {
    setWorkers(workers.map(worker => 
      worker.id === workerId ? { ...worker, team } : worker
    ));
    setShowAssignTeam(null);
  };

  // Change worker status
  const changeStatus = (workerId, status) => {
    setWorkers(workers.map(worker => 
      worker.id === workerId ? { ...worker, status } : worker
    ));
  };

  // Status badge classes
  const statusClasses = {
    "Active": "status-active",
    "On Leave": "status-leave",
    "Inactive": "status-inactive"
  };

  return (
    <div className="content">
      <div>
        <h2>Worker Management</h2>
        <br />
      </div>
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Active Workers</h3>
            <span>👷</span>
          </div>
          <h4>{workers.filter(w => w.status === "Active").length}</h4>
          <p>Out of {workers.length} total workers</p>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3>Teams</h3>
            <span>👥</span>
          </div>
          <h4>{teams.length}</h4>
          <p>Fully staffed and operational</p>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3>On Leave</h3>
            <span>🏖️</span>
          </div>
          <h4>{workers.filter(w => w.status === "On Leave").length}</h4>
          <p>{workers.filter(w => w.status === "Inactive").length} inactive</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Worker Management</h3>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddWorker(true)}
          >
            + Add Worker
          </button>
        </div>
        <DataTable 
          columns={["Name", "Team", "Status", "Skills", "Last Active", "Actions"]} 
          rows={workers.map(worker => ({
            Name: worker.name,
            Team: worker.team,
            Status: (
              <span className={`status-badge ${statusClasses[worker.status]}`}>
                {worker.status}
              </span>
            ),
            Skills: (
              <div className="skills-container">
                {worker.skills.map(skill => (
                  <span key={skill} className="skill-badge">
                    {skill}
                  </span>
                ))}
              </div>
            ),
            "Last Active": worker.lastActive,
            Actions: (
              <div className="worker-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowWorkerDetails(worker)}
                >
                  Details
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setShowAssignTeam(worker)}
                >
                  Assign Team
                </button>
              </div>
            )
          }))} 
        />
      </div>

      {/* Add Worker Modal */}
      {showAddWorker && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Worker</h3>
              <span className="close-modal" onClick={() => setShowAddWorker(false)}>
                &times;
              </span>
            </div>
            <form onSubmit={handleAddWorker}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  required
                  value={newWorker.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="contact"
                  className="form-control"
                  required
                  value={newWorker.contact}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label>Assign Team</label>
                <select
                  name="team"
                  className="form-control"
                  required
                  value={newWorker.team}
                  onChange={handleInputChange}
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Skills</label>
                <div className="skills-selector">
                  {allSkills.map(skill => (
                    <button
                      type="button"
                      key={skill}
                      className={`skill-option ${
                        newWorker.skills.includes(skill) ? 'selected' : ''
                      }`}
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline"
                  onClick={() => setShowAddWorker(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Worker Details Modal */}
      {showWorkerDetails && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Worker Details</h3>
              <span className="close-modal" onClick={() => setShowWorkerDetails(null)}>
                &times;
              </span>
            </div>
            <div className="worker-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span>{showWorkerDetails.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Team:</span>
                <span>{showWorkerDetails.team}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${statusClasses[showWorkerDetails.status]}`}>
                  {showWorkerDetails.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact:</span>
                <span>{showWorkerDetails.contact}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Skills:</span>
                <div className="skills-container">
                  {showWorkerDetails.skills.map(skill => (
                    <span key={skill} className="skill-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Active:</span>
                <span>{showWorkerDetails.lastActive}</span>
              </div>
              <div className="status-actions">
                <button 
                  className={`btn ${showWorkerDetails.status === "Active" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => changeStatus(showWorkerDetails.id, "Active")}
                >
                  Set Active
                </button>
                <button 
                  className={`btn ${showWorkerDetails.status === "On Leave" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => changeStatus(showWorkerDetails.id, "On Leave")}
                >
                  Set On Leave
                </button>
                <button 
                  className={`btn ${showWorkerDetails.status === "Inactive" ? "btn-primary" : "btn-outline"}`}
                  onClick={() => changeStatus(showWorkerDetails.id, "Inactive")}
                >
                  Set Inactive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Team Modal */}
      {showAssignTeam && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Assign Team to {showAssignTeam.name}</h3>
              <span className="close-modal" onClick={() => setShowAssignTeam(null)}>
                &times;
              </span>
            </div>
            <div className="team-assignment">
              <p>Current Team: <strong>{showAssignTeam.team}</strong></p>
              <div className="team-options">
                {teams.map(team => (
                  <button
                    key={team}
                    className={`team-option ${
                      showAssignTeam.team === team ? 'selected' : ''
                    }`}
                    onClick={() => handleAssignTeam(showAssignTeam.id, team)}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;