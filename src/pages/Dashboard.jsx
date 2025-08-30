import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import "../css/Dashboard.css";

// Services
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from "../services/ScheduleService";
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

  // Fetch collections and hotels
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collectionsRes, hotelsRes] = await Promise.all([
          getCollections(),
          getHotels(),
        ]);

        setCollections(collectionsRes);
        setHotels(hotelsRes);
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
        (h) => String(h.hotel_id) === String(value)
      );
      const freq = Number(selectedHotel?.collection_frequency) || 0;

      setAddFormData((prev) => ({ ...prev, collection_frequency: freq }));

      if (freq === 7) {
        setAddSelectedDays(
          DAYS.map((d) => ({ day: d, start_time: "", end_time: "" }))
        );
      } else if (freq > 0) {
        setAddSelectedDays(
          Array.from({ length: freq }, () => ({
            day: "",
            start_time: "",
            end_time: "",
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
      .filter((d) => d.day && d.start_time && d.end_time)
      .map((d) => ({
        hotel: addFormData.hotel, // ensure hotel_id goes to API
        day: d.day,
        start_time: d.start_time,
        end_time: d.end_time,
        status: addFormData.status,
      }));

    if (payload.length === 0) {
      setError("Please select at least one valid day and time range");
      return;
    }

    try {
      const createdCollections = await Promise.all(
        payload.map((item) => createCollection(item))
      );

      setCollections([...collections, ...createdCollections]);
      resetAddForm();
    } catch (err) {
      console.error("Failed to create collection:", err);
      setError("Failed to create collection. Please try again.");
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
      (h) => String(h.hotel_id) === String(collection.hotel)
    );

    setEditFormData({
      hotel: collection.hotel, // keep hotel_id for API
      hotel_name: hotel?.name || collection.hotel_name || "Unknown Hotel",
      status: collection.status,
      collection_frequency: 1,
    });

    setEditSelectedDays([
      {
        day: collection.day,
        start_time: collection.start_time,
        end_time: collection.end_time,
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
      const updated = await updateCollection(editingCollection.schedule_id, {
        hotel: editFormData.hotel, // pass hotel_id to API
        status: editFormData.status,
        day: editSelectedDays[0]?.day,
        start_time: editSelectedDays[0]?.start_time,
        end_time: editSelectedDays[0]?.end_time,
      });

      setCollections((prev) =>
        prev.map((c) =>
          c.schedule_id === editingCollection.schedule_id ? updated : c
        )
      );

      resetEditForm();
    } catch (err) {
      console.error("Failed to update collection:", err);
      setError("Failed to update collection. Please try again.");
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
      await deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.schedule_id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete schedule.");
    }
  };

  if (loading) return <div className="loading">Loading scheduling data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="content">
      <h2>Operations Dashboard</h2>
      <br />

      {/* Stats */}
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Total Hotels</h3>
            <span><i class="bi bi-house-door"></i></span>
          </div>
          <h4>{hotels.length}</h4>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Total Requests</h3>
            <span><i class="bi bi-clipboard-data"></i></span>
          </div>
          <h4>{collections.length}</h4>
          <p>
            {collections.filter((c) => c.status === "Pending").length} pending •{" "}
            {collections.filter((c) => c.status === "In Progress").length} in
            progress •{" "}
            {collections.filter((c) => c.status === "Completed").length}{" "}
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

        <DataTable
          columns={["Day", "Time Range", "Hotel", "Status", "Action"]}
          rows={collections.map((item) => ({
            Day: item.day,
            "Time Range": `${item.start_time} - ${item.end_time}`,
            Hotel: item.hotel_name,
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
                  {hotels
                    .filter(
                      (hotel) =>
                        !collections.some(
                          (c) =>
                            c.hotel === hotel.hotel_id &&
                            c.status === "Completed"
                        )
                    )
                    .map((hotel) => (
                      <option key={hotel.hotel_id} value={hotel.hotel_id}>
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
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              {/* Days & Times */}
              {addSelectedDays.length > 0 && (
                <div className="form-group">
                  <label>Select Days & Times</label>
                  {addSelectedDays.map((d, idx) => (
                    <div key={idx} className="day-time-selection">
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
                      <input
                        type="time"
                        className="form-control"
                        value={d.start_time}
                        onChange={(e) =>
                          handleAddDayTimeChange(
                            idx,
                            "start_time",
                            e.target.value
                          )
                        }
                        required
                      />
                      <span>to</span>
                      <input
                        type="time"
                        className="form-control"
                        value={d.end_time}
                        onChange={(e) =>
                          handleAddDayTimeChange(
                            idx,
                            "end_time",
                            e.target.value
                          )
                        }
                        required
                      />
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
      {showEditModal && (
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
                {/* Hidden field ensures hotel_id is sent */}
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
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              {/* Days & Times */}
              {editSelectedDays.length > 0 && (
                <div className="form-group">
                  <label>Select Days & Times</label>
                  {editSelectedDays.map((d, idx) => (
                    <div key={idx} className="day-time-selection">
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

                      <input
                        type="time"
                        className="form-control"
                        value={d.start_time}
                        onChange={(e) =>
                          handleEditDayTimeChange(idx, "start_time", e.target.value)
                        }
                        required
                      />
                      <span>to</span>
                      <input
                        type="time"
                        className="form-control"
                        value={d.end_time}
                        onChange={(e) =>
                          handleEditDayTimeChange(idx, "end_time", e.target.value)
                        }
                        required
                      />
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
