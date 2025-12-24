// Dashboard.jsx
import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import "../css/Dashboard.css";

// Services - Tuma service yako
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  checkAndInitialize  // ✅ Hii ni mpya kwa auto-generation
} from "../services/DashboardService";
import { getHotels } from "../services/hotelServices";

const Scheduling = () => {
  const [collections, setCollections] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editingCollection, setEditingCollection] = useState(null);

  // Add form state
  const [addFormData, setAddFormData] = useState({
    hotel: "",
    status: "Pending",
    collection_frequency: 0,
  });
  const [addSelectedDays, setAddSelectedDays] = useState([]);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    hotel: "",
    hotel_name: "",
    status: "",
    collection_frequency: 0,
  });
  const [editSelectedDays, setEditSelectedDays] = useState([]);

  const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const SLOTS = [
    { value: "06:00 – 12:00", label: "Morning (06:00 – 12:00)" },
    { value: "06:00 – 18:00", label: "Afternoon (06:00 – 18:00)" },
  ];

  // Fetch collections and hotels
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ AUTO: Check and initialize system in background
        await checkAndInitialize();
        
        const [collectionsRes, hotelsRes] = await Promise.all([
          getSchedules(),
          getHotels(),
        ]);

        // ✅ FIX: Ensure data is always an array
        const collectionsArray = Array.isArray(collectionsRes) ? collectionsRes : 
                                collectionsRes?.results ? collectionsRes.results : 
                                collectionsRes?.schedules ? collectionsRes.schedules : 
                                collectionsRes?.data ? collectionsRes.data : [];
        
        const hotelsArray = Array.isArray(hotelsRes) ? hotelsRes : 
                           hotelsRes?.results ? hotelsRes.results : 
                           hotelsRes?.data ? hotelsRes.data : [];

        setCollections(collectionsArray);
        setHotels(hotelsArray);
      } catch (err) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /** ---------- ADD ---------- **/
  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "hotel") {
      const selectedHotel = hotels.find(
        (h) => String(h.hotel_id || h.id) === String(value)
      );
      const freq = Number(selectedHotel?.collection_frequency) || 0;

      setAddFormData((prev) => ({ ...prev, collection_frequency: freq }));

      if (freq === 7) {
        // Daily collection → all days with empty slots
        setAddSelectedDays(DAYS.map((d) => ({ day: d, slot: "" })));
      } else if (freq > 0) {
        // Limited frequency → allow custom day/slot selection
        setAddSelectedDays(
          Array.from({ length: freq }, () => ({
            day: "",
            slot: "",
          }))
        );
      } else {
        setAddSelectedDays([]);
      }
    }
  };

  const handleAddDayTimeChange = (index, field, value) => {
    setAddSelectedDays((prev) => {
      const newDays = [...prev];
      newDays[index] = { ...newDays[index], [field]: value };
      return newDays;
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!addFormData.hotel) {
      setError("Please select a hotel");
      return;
    }

    const payload = addSelectedDays
      .filter((d) => d.day && d.slot)
      .map((d) => ({
        hotel: addFormData.hotel,
        day: d.day,
        slot: d.slot,
        status: addFormData.status,
        is_visible: true
      }));

    if (payload.length === 0) {
      setError("Please select at least one valid day and time range");
      return;
    }

    try {
      const createdSchedules = await Promise.all(
        payload.map((item) => createSchedule(item))
      );

      setCollections([...collections, ...createdSchedules]);
      resetAddForm();
    } catch (err) {
      console.error("Failed to create schedule:", err);
      setError("Failed to create schedule. Please try again.");
    }
  };

  const resetAddForm = () => {
    setShowAddModal(false);
    setAddFormData({ hotel: "", status: "Pending", collection_frequency: 0 });
    setAddSelectedDays([]);
    setError(null);
  };

  /** ---------- EDIT ---------- **/
  const openEditModal = (collection) => {
    setEditingCollection(collection);

    const hotel = hotels.find(
      (h) => String(h.hotel_id || h.id) === String(collection.hotel)
    );

    setEditFormData({
      hotel: collection.hotel,
      hotel_name: hotel?.name || collection.hotel_name || "Unknown Hotel",
      status: collection.status,
      collection_frequency: 1,
    });

    setEditSelectedDays([
      {
        day: collection.day,
        slot: collection.slot || "",
      },
    ]);

    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditDayTimeChange = (index, field, value) => {
    setEditSelectedDays((prev) => {
      const newDays = [...prev];
      newDays[index] = { ...newDays[index], [field]: value };
      return newDays;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const updated = await updateSchedule(editingCollection.schedule_id, {
        hotel: editFormData.hotel,
        status: editFormData.status,
        day: editSelectedDays[0]?.day,
        slot: editSelectedDays[0]?.slot,
        is_visible: editingCollection.is_visible || true
      });

      setCollections((prev) =>
        prev.map((c) =>
          c.schedule_id === editingCollection.schedule_id ? updated : c
        )
      );

      resetEditForm();
    } catch (err) {
      console.error("Failed to update schedule:", err);
      setError("Failed to update schedule. Please try again.");
    }
  };

  const resetEditForm = () => {
    setShowEditModal(false);
    setEditingCollection(null);
    setEditFormData({
      hotel: "",
      hotel_name: "",
      status: "",
      collection_frequency: 0,
    });
    setEditSelectedDays([]);
    setError(null);
  };

  /** ---------- DELETE ---------- **/
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;

    try {
      await deleteSchedule(id);
      setCollections((prev) => prev.filter((c) => c.schedule_id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete schedule.");
    }
  };

  if (loading) return <div className="loading">Loading scheduling data...</div>;
  
  // ✅ FIX: Check if collections is an array before using filter
  const collectionsArray = Array.isArray(collections) ? collections : [];

  return (
    <div className="content">
      <h2>Operations Dashboard</h2>
      <br />

      {/* Stats */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Total Hotels</h3>
            <span>
              <i className="bi bi-house-door"></i>
            </span>
          </div>
          <h4>{Array.isArray(hotels) ? hotels.length : 0}</h4>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Total Requests</h3>
            <span>
              <i className="bi bi-clipboard-data"></i>
            </span>
          </div>
          <h4>{collectionsArray.length}</h4>
          <p>
            {collectionsArray.filter((c) => c.status === "Pending").length} pending •{" "}
            {collectionsArray.filter((c) => c.status === "In_Progress").length} in
            progress •{" "}
            {collectionsArray.filter((c) => c.status === "Completed").length}{" "}
            completed
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="card-header">
          <h3>Total Request</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + New Collection
          </button>
        </div>

        {collectionsArray.length > 0 ? (
          <DataTable
            columns={["Day", "Slot", "Date", "Hotel", "Status", "Action"]}
            rows={collectionsArray.map((item) => ({
              Day: item.day,
              Slot: item.slot || "N/A",
              Date:item.schedule_date,
              Hotel: item.hotel_name || `Hotel ${item.hotel}`,
              Status: item.status,
              Action: (
                <div className="action-buttons">
                  <button
                    className="btn btn-outline"
                    onClick={() => openEditModal(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(item.schedule_id)}
                  >
                    Delete
                  </button>
                </div>
              ),
            }))}
          />
        ) : (
          <div className="empty-state">
            <p>No schedules found</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              + Create First Schedule
            </button>
          </div>
        )}
      </div>

      {/* -------- ADD MODAL -------- */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Schedule New Collection</h3>
              <span className="close-modal" onClick={resetAddForm}>
                &times;
              </span>
            </div>

            <form onSubmit={handleAddSubmit}>
              {/* Hotel */}
              <div className="form-group">
                <label>Hotel *</label>
                <select
                  name="hotel"
                  className="form-control"
                  required
                  value={addFormData.hotel}
                  onChange={handleAddInputChange}
                >
                  <option value="">Select Hotel</option>
                  {Array.isArray(hotels) && hotels.map((hotel) => (
                    <option key={hotel.hotel_id || hotel.id} value={hotel.hotel_id || hotel.id}>
                      {hotel.name} - {hotel.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  className="form-control"
                  required
                  value={addFormData.status}
                  onChange={handleAddInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In_Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Days & Slots */}
              {addSelectedDays.length > 0 && (
                <div className="form-group">
                  <label>Select Days & Slots</label>
                  {addSelectedDays.map((d, idx) => (
                    <div key={idx} className="day-slot-selection">
                      {/* Day dropdown */}
                      <select
                        className="form-control"
                        value={d.day}
                        onChange={(e) =>
                          handleAddDayTimeChange(idx, "day", e.target.value)
                        }
                        required
                      >
                        <option value="">-- Select Day --</option>
                        {DAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>

                      {/* Slot dropdown */}
                      <select
                        className="form-control"
                        value={d.slot || ""}
                        onChange={(e) =>
                          handleAddDayTimeChange(idx, "slot", e.target.value)
                        }
                        required
                      >
                        <option value="">-- Select Slot --</option>
                        {SLOTS.map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetAddForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Schedule Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------- EDIT MODAL -------- */}
      {showEditModal && editingCollection && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Collection</h3>
              <span className="close-modal" onClick={resetEditForm}>
                &times;
              </span>
            </div>

            <form onSubmit={handleEditSubmit}>
              {/* Hotel (readonly) */}
              <div className="form-group">
                <label>Hotel *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editFormData.hotel_name || "Unknown Hotel"}
                  readOnly
                />
                <input type="hidden" name="hotel" value={editFormData.hotel} />
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Status *</label>
                <select
                  name="status"
                  className="form-control"
                  required
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In_Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Days & Slot */}
              {editSelectedDays.length > 0 && (
                <div className="form-group">
                  <label>Select Day & Slot</label>
                  {editSelectedDays.map((d, idx) => (
                    <div key={idx} className="day-slot-selection">
                      {/* Day select */}
                      <select
                        className="form-control"
                        value={d.day}
                        onChange={(e) =>
                          handleEditDayTimeChange(idx, "day", e.target.value)
                        }
                        required
                      >
                        <option value="">-- Select Day --</option>
                        {DAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>

                      {/* Slot select */}
                      <select
                        className="form-control"
                        value={d.slot || ""}
                        onChange={(e) =>
                          handleEditDayTimeChange(idx, "slot", e.target.value)
                        }
                        required
                      >
                        <option value="">-- Select Slot --</option>
                        <option value="06:00 – 12:00">Morning (06:00 – 12:00)</option>
                        <option value="12:00 – 18:00">Afternoon (12:00 – 18:00)</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={resetEditForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduling;