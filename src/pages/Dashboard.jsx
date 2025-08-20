import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import "../css/Schedulling.css";

// Services
import { getCollections, createCollection, updateCollection, deleteCollection } from "../services/ScheduleService";
import { getHotels } from "../services/hotelServices";

const Scheduling = () => {
  const [collections, setCollections] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  const [formData, setFormData] = useState({
    hotel: "",
    status: "Pending",
    collection_frequency: 0,
  });

  const [selectedDays, setSelectedDays] = useState([]);

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

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "hotel") {
      const selectedHotel = hotels.find(
        (h) => String(h.hotel_id) === String(value)
      );
      const freq = Number(selectedHotel?.collection_frequency) || 0;

      setFormData((prev) => ({
        ...prev,
        hotel: value,
        collection_frequency: freq,
      }));

      if (freq === 7) {
        setSelectedDays(DAYS.map((d) => ({ day: d, time: "" })));
      } else if (freq > 0) {
        setSelectedDays(
          Array.from({ length: freq }, () => ({ day: "", time: "" }))
        );
      } else {
        setSelectedDays([]);
      }
    }
  };

  const handleDayTimeChange = (index, field, value) => {
    setSelectedDays((prev) => {
      const newDays = [...prev];
      newDays[index] = { ...newDays[index], [field]: value };
      return newDays;
    });
  };

  // Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.hotel) {
      setError("Please select a hotel");
      return;
    }

    try {
      if (editingCollection) {
        // Update existing
        const updated = await updateCollection(editingCollection.schedule_id, {
          ...editingCollection,
          hotel: formData.hotel,
          status: formData.status,
          day: selectedDays[0]?.day,
          time: selectedDays[0]?.time,
        });

        setCollections((prev) =>
          prev.map((c) =>
            c.schedule_id === editingCollection.schedule_id ? updated : c
          )
        );
      } else {
        // Create new
        const payload = selectedDays
          .filter((d) => d.day && d.time)
          .map((d) => ({
            hotel: formData.hotel,
            day: d.day,
            time: d.time,
            status: formData.status,
          }));

        if (payload.length === 0) {
          setError("Please select at least one valid day and time");
          return;
        }

        const createdCollections = await Promise.all(
          payload.map((item) => createCollection(item))
        );

        setCollections([...collections, ...createdCollections]);
      }

      // Reset
      setShowModal(false);
      setEditingCollection(null);
      setFormData({ hotel: "", status: "Pending", collection_frequency: 0 });
      setSelectedDays([]);
      setError(null);
    } catch (err) {
      console.error("Failed to save collection:", err);
      setError("Failed to save collection. Please try again.");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;

    try {
      await deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.schedule_id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete schedule.");
    }
  };

  // Open modal for editing
  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setFormData({
      hotel: collection.hotel,
      status: collection.status,
      collection_frequency: 1,
    });
    setSelectedDays([{ day: collection.day, time: collection.time }]);
    setShowModal(true);
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
            <span>🏨</span>
          </div>
          <h4>{hotels.length}</h4>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Total Requests</h3>
            <span>📋</span>
          </div>
          <h4>{collections.length}</h4>
          <p>
            {collections.filter((c) => c.status === "Pending").length} pending •{" "}
            {collections.filter((c) => c.status === "In Progress").length} in
            progress •{" "}
            {collections.filter((c) => c.status === "Completed").length} completed
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="card-header">
          <h3>Total Request</h3>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + New Collection
          </button>
        </div>

        <DataTable
          columns={["Day", "Time", "Hotel", "Status", "Action"]}
          rows={collections.map((item) => ({
            Day: item.day,
            Time: item.time,
            Hotel: hotels.find((h) => h.hotel_id === item.hotel)?.name || "Unknown",
            Status: item.status,
            Action: (
              <>
                <button
                  className="btn btn-outline"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>{" "}
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(item.schedule_id)}
                >
                  Delete
                </button>
              </>
            ),
          }))}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCollection ? "Edit Collection" : "Schedule New Collection"}</h3>
              <span className="close-modal" onClick={() => setShowModal(false)}>
                &times;
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Hotel */}
              <div className="form-group">
                <label>Hotel *</label>
                <select
                  name="hotel"
                  className="form-control"
                  required
                  value={formData.hotel}
                  onChange={handleInputChange}
                >
                  <option value="">Select Hotel</option>
                  {hotels.map((hotel) => (
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
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              {/* Days & Times */}
              {selectedDays.length > 0 && (
                <div className="form-group">
                  <label>Select Days & Times</label>
                  {selectedDays.map((d, idx) => (
                    <div key={idx} className="day-time-selection">
                      <select
                        className="form-control"
                        value={d.day}
                        onChange={(e) =>
                          handleDayTimeChange(idx, "day", e.target.value)
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
                        value={d.time}
                        onChange={(e) =>
                          handleDayTimeChange(idx, "time", e.target.value)
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
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCollection ? "Update Collection" : "Schedule Collection"}
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
