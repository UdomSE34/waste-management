import React, { useState, useEffect } from 'react';
import { 
  fetchRolePolicies, 
  updateRolePolicy, 
  createRolePolicy, 
  deleteRolePolicy 
} from '../../services/admin/PoliciesService';
import DataTable from '../../components/admin/DataTable';
import '../../css/admin/SalaryManagement.css';

const SalaryPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletePolicy, setDeletePolicy] = useState(null);

  const [newPolicy, setNewPolicy] = useState({
    role: '',
    base_salary: '',
    bonuses: '',
    deduction_per_absent: '',
    deduction_per_sick_day: ''
  });

  // Example list of roles
  const availableRoles = ["Workers", "Supervisors", "Drivers", "HR", "Staff"];

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await fetchRolePolicies();
      setPolicies(data);
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async (policy) => {
    try {
      await updateRolePolicy(policy.role, policy);
      setEditingPolicy(null);
      await loadPolicies();
    } catch (error) {
      console.error('Error updating policy:', error);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      await createRolePolicy(newPolicy);
      setShowCreateModal(false);
      setNewPolicy({
        role: '',
        base_salary: '',
        bonuses: '',
        deduction_per_absent: '',
        deduction_per_sick_day: ''
      });
      await loadPolicies();
    } catch (error) {
      console.error('Error creating policy:', error);
    }
  };

  const handleDeletePolicy = async () => {
    try {
      await deleteRolePolicy(deletePolicy.role);
      setDeletePolicy(null);
      await loadPolicies();
    } catch (error) {
      console.error('Error deleting policy:', error);
    }
  };

  if (loading) return <div className="loading">Loading salary policies...</div>;

  return (
    <div className="content">
      <div className="page-header">
        <h2>Salary Policies</h2>
        <br />
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Role Salary Policies</h3>
          <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Add Policy
        </button>
        </div>
        <DataTable
          columns={[
            'Role',
            'Base Salary',
            'Bonuses',
            'Deduction per Absent',
            'Deduction per Sick Day',
            'Actions'
          ]}
          rows={policies.map(policy => ({
            Role: policy.role,
            'Base Salary': `${parseFloat(policy.base_salary).toLocaleString()} Tsh`,
            'Bonuses': `${parseFloat(policy.bonuses).toLocaleString()} Tsh`,
            'Deduction per Absent': `${parseFloat(policy.deduction_per_absent).toLocaleString()} Tsh`,
            'Deduction per Sick Day': `${parseFloat(policy.deduction_per_sick_day).toLocaleString()} Tsh`,
            'Actions': (
              <div className="action-buttons">
                <button 
                  className="btn btn-outline"
                  onClick={() => setEditingPolicy({...policy})}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => setDeletePolicy(policy)}
                >
                  Delete
                </button>
              </div>
            )
          }))}
        />
      </div>

      {/* Edit Modal */}
      {editingPolicy && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Policy for {editingPolicy.role}</h3>
            <div className="form-group">
              <label>Base Salary:</label>
              <input
                type="number"
                value={editingPolicy.base_salary}
                onChange={(e) => setEditingPolicy({
                  ...editingPolicy,
                  base_salary: parseFloat(e.target.value)
                })}
              />
            </div>
            <div className="form-group">
              <label>Bonuses:</label>
              <input
                type="number"
                value={editingPolicy.bonuses}
                onChange={(e) => setEditingPolicy({
                  ...editingPolicy,
                  bonuses: parseFloat(e.target.value)
                })}
              />
            </div>
            <div className="form-group">
              <label>Deduction per Absent:</label>
              <input
                type="number"
                value={editingPolicy.deduction_per_absent}
                onChange={(e) => setEditingPolicy({
                  ...editingPolicy,
                  deduction_per_absent: parseFloat(e.target.value)
                })}
              />
            </div>
            <div className="form-group">
              <label>Deduction per Sick Day:</label>
              <input
                type="number"
                value={editingPolicy.deduction_per_sick_day}
                onChange={(e) => setEditingPolicy({
                  ...editingPolicy,
                  deduction_per_sick_day: parseFloat(e.target.value)
                })}
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setEditingPolicy(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleSavePolicy(editingPolicy)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create New Policy</h3>
            <div className="form-group">
              <label>Role:</label>
              <select
                value={newPolicy.role}
                onChange={(e) => setNewPolicy({...newPolicy, role: e.target.value})}
              >
                <option value="">Select role</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Base Salary:</label>
              <input
                type="number"
                value={newPolicy.base_salary}
                onChange={(e) => setNewPolicy({...newPolicy, base_salary: parseFloat(e.target.value)})}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Bonuses</label>
              <input
                type="number"
                value={newPolicy.bonuses}
                onChange={(e) => setNewPolicy({...newPolicy, bonuses: parseFloat(e.target.value)})}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Deduction per Absent:</label>
              <input
                type="number"
                value={newPolicy.deduction_per_absent}
                onChange={(e) => setNewPolicy({...newPolicy, deduction_per_absent: parseFloat(e.target.value)})}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Deduction per Sick Day:</label>
              <input
                type="number"
                value={newPolicy.deduction_per_sick_day}
                onChange={(e) => setNewPolicy({...newPolicy, deduction_per_sick_day: parseFloat(e.target.value)})}
                placeholder="0.00"
              />
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreatePolicy}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletePolicy && (
        <div className="modal">
          <div className="modal-content">
            <h3>Delete Policy</h3>
            <p>Are you sure you want to delete policy for <strong>{deletePolicy.role}</strong>?</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setDeletePolicy(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDeletePolicy}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryPolicies;
