import { useState, useEffect } from "react";
import DataTable from "../components/DataTable";
import "../css/CompletedSchedule.css";
import {
  getCompletedSchedules,
  addCompletedSchedule,
  deleteCompletedSchedule,
  updateCompletedSchedule,
} from "../services/completedScheduleService";
import { getCollections } from "../services/ScheduleService";

// Waste densities (kg per litre)
const WASTE_DENSITY_KG_PER_L = {
  General: 0.15,
  Plastic: 0.05,
  Paper: 0.12,
  Glass: 0.6,
  Organic: 0.45,
  Metal: 0.25,
};

function litersToKg(liters, wasteType) {
  const density =
    WASTE_DENSITY_KG_PER_L[wasteType] ?? WASTE_DENSITY_KG_PER_L.General;
  return Math.round(Number(liters) * density * 100) / 100;
}

const CompletedSchedules = () => {
  const [completedRecords, setCompletedRecords] = useState([]);
  const [completedSchedules, setCompletedSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [dustbins, setDustbins] = useState([
    { liters: "", wasteType: "General", kg: 0 },
  ]);
  const [editRecord, setEditRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);

  // Totals
  const [dailyTotal, setDailyTotal] = useState(0);
  const [weeklyTotal, setWeeklyTotal] = useState(0);

  // Fetch data
  // Fetch completed records and schedules
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [completedRes, schedulesRes] = await Promise.all([
          getCompletedSchedules(),
          getCollections(),
        ]);
        setCompletedRecords(completedRes);

        const usedScheduleIds = completedRes.map(
          (r) => r.schedule?.schedule_id
        );
        const filteredSchedules = schedulesRes.filter(
          (s) =>
            s.status === "Completed" && !usedScheduleIds.includes(s.schedule_id)
        );
        setCompletedSchedules(filteredSchedules);

        computeTotals(completedRes); // compute initial totals
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Dustbin handlers
  const handleDustbinChange = (index, field, value) => {
    setDustbins((prev) => {
      const updated = [...prev];
      const bin = { ...updated[index], [field]: value };
      if (field === "liters" || field === "wasteType") {
        bin.kg = litersToKg(bin.liters, bin.wasteType);
      }
      updated[index] = bin;
      return updated;
    });
  };
  const addDustbin = () =>
    setDustbins((prev) => [
      ...prev,
      { liters: "", wasteType: "General", kg: 0 },
    ]);
  const removeDustbin = (index) =>
    setDustbins((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedSchedule) throw new Error("Please select a schedule");

      // Validate dustbins
      for (let i = 0; i < dustbins.length; i++) {
        const bin = dustbins[i];
        if (
          !bin.liters ||
          isNaN(parseFloat(bin.liters)) ||
          parseFloat(bin.liters) <= 0
        ) {
          throw new Error(`Please enter valid liters for dustbin ${i + 1}`);
        }
        if (!bin.wasteType)
          throw new Error(`Please select waste type for dustbin ${i + 1}`);
      }

      // Group dustbins by type
      const dustbinCounts = dustbins.reduce((acc, bin) => {
        const type = bin.wasteType;
        const size = parseFloat(bin.liters);
        const weight = parseFloat(bin.kg);
        if (!acc[type])
          acc[type] = { wasteType: type, totalLitres: 0, totalKg: 0, count: 0 };
        acc[type].totalLitres += size;
        acc[type].totalKg += weight;
        acc[type].count += 1;
        return acc;
      }, {});

      const groupedRecords = Object.values(dustbinCounts).map((item) => ({
        schedule_id: selectedSchedule.schedule_id,
        waste_type: item.wasteType,
        number_of_dustbins: item.count,
        size_of_litres: item.totalKg,
      }));

      if (editRecord) {
        // EDIT MODE: Update the existing record (only one record per schedule)
        const updatedRecord = await updateCompletedSchedule(
          editRecord.record_id,
          groupedRecords[0]
        );

        setCompletedRecords((prev) =>
          prev.map((rec) =>
            rec.record_id === editRecord.record_id ? updatedRecord : rec
          )
        );
      } else {
        // ADD MODE: Add new records
        const newRecords = await Promise.all(
          groupedRecords.map((bin) => addCompletedSchedule(bin))
        );

        setCompletedRecords((prev) => [...prev, ...newRecords]);
        setCompletedSchedules((prev) =>
          prev.filter((s) => s.schedule_id !== selectedSchedule.schedule_id)
        );
      }

      // Reset form
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedSchedule(null);
      setDustbins([{ liters: "", wasteType: "General", kg: 0 }]);
      setEditRecord(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Delete
  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteCompletedSchedule(recordId);
      setCompletedRecords((prev) =>
        prev.filter((r) => r.record_id !== recordId)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to delete record");
    }
  };

  // View details
  const handleViewDetails = (record) => {
    // Filter all records with the same schedule_id
    const relatedRecords = completedRecords.filter(
      (r) => r.schedule?.schedule_id === record.schedule?.schedule_id
    );

    setViewRecord({
      schedule: record.schedule,
      wastes: relatedRecords, // all waste types collected for this schedule
    });
    setShowViewModal(true);
  };
  // Compute daily and weekly totals
  const computeTotals = (records) => {
    const today = new Date();
    const startOfWeek = new Date();
    startOfWeek.setDate(today.getDate() - today.getDay());

    let daily = 0;
    let weekly = 0;

    records.forEach((rec) => {
      const recDate = new Date(rec.created_at);
      const kg = rec.size_of_litres ?? 0;

      if (
        recDate.getFullYear() === today.getFullYear() &&
        recDate.getMonth() === today.getMonth() &&
        recDate.getDate() === today.getDate()
      )
        daily += kg;

      if (recDate >= startOfWeek && recDate <= today) weekly += kg;
    });

    setDailyTotal(daily.toFixed(2));
    setWeeklyTotal(weekly.toFixed(2));
  };

  if (loading) return <div className="loading">Loading records...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="content">
      <div className="page-header">
        <h2>Completed Waste Collection Records</h2>
      </div>
      <br /><br />
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Daily Total</h3>
            <span>
              <i class="bi bi-bar-chart-line-fill"></i>
            </span>
          </div>
          <h4>{dailyTotal} kg</h4>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Weekly Total</h3>
            <span>
              <i class="bi bi-bar-chart-fill"></i>
            </span>
          </div>
          <h4>{weeklyTotal} kg</h4>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Completed Collections</h3>
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowAddModal(true);
              setDustbins([{ liters: "", wasteType: "General", kg: 0 }]);
            }}
          >
            + Add Record
          </button>
        </div>
        <DataTable
          columns={[
            "Hotel",
            "Day",
            "Time Range",
            "Completion Date",
            "Details",
            "Actions",
          ]}
          rows={completedRecords.map((record) => ({
            Hotel: record.schedule?.hotel_name || "Unknown",
            Day: record.schedule?.day || "-",
            "Time Range": record.shedule?.slot || "-",
            "Completion Date": new Date(record.created_at).toLocaleDateString(),
            Details: (
              <button
                className="btn btn-outline"
                onClick={() => handleViewDetails(record)}
              >
                View Details
              </button>
            ),
            Actions: (
              <>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setEditRecord(record);
                    setSelectedSchedule(record.schedule);
                    setDustbins([
                      {
                        liters: record.size_of_litres,
                        wasteType: record.waste_type,
                        kg: record.weight_in_kg,
                      },
                    ]);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(record.record_id)}
                >
                  Delete
                </button>
              </>
            ),
          }))}
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <ModalWrapper
          title="Add Completed Record"
          onClose={() => setShowAddModal(false)}
        >
          <form  onSubmit={handleSubmit}>
            <ScheduleSelect
              schedules={completedSchedules}
              selectedSchedule={selectedSchedule}
              setSelectedSchedule={setSelectedSchedule}
            />
            <DustbinForm
              dustbins={dustbins}
              handleDustbinChange={handleDustbinChange}
              addDustbin={addDustbin}
              removeDustbin={removeDustbin}
            />
            <ModalActions onClose={() => setShowAddModal(false)} />
          </form>
        </ModalWrapper>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <ModalWrapper
          title="Edit Completed Record"
          onClose={() => setShowEditModal(false)}
        >
          <form onSubmit={handleSubmit}>
            <DustbinForm
              dustbins={dustbins}
              handleDustbinChange={handleDustbinChange}
              addDustbin={() => {}}
              removeDustbin={() => {}}
            />
            <ModalActions onClose={() => setShowEditModal(false)} />
          </form>
        </ModalWrapper>
      )}

      {/* View Modal */}
      {showViewModal && viewRecord && (
        <ModalWrapper
          title="Waste Collection Details"
          onClose={() => setShowViewModal(false)}
        >
          <div className="modal-body">
            {/* Hotel & Schedule Info */}
            <div className="modal-header-info">
              <p>
                <strong>Hotel:</strong> {viewRecord.schedule?.hotel_name}
              </p>
              <p>
                <strong>Day:</strong> {viewRecord.schedule?.day}
              </p>
              <p>
                <strong>Time:</strong> {viewRecord.schedule?.start_time} -{" "}
                {viewRecord.schedule?.end_time}
              </p>
            </div>

            {/* Waste Type Legend */}
            <div class="waste-legend">
              <div class="legend-item">
                <div class="legend-color color-paper"></div>
                <span>Paper/Cardboard</span>
              </div>
              <div class="legend-item">
                <div class="legend-color color-glass"></div>
                <span>Glass</span>
              </div>
              <div class="legend-item">
                <div class="legend-color color-compost"></div>
                <span>Compost</span>
              </div>
              <div class="legend-item">
                <div class="legend-color color-organic"></div>
                <span>Organic Waste</span>
              </div>
              <div class="legend-item">
                <div class="legend-color color-plastic"></div>
                <span>Plastic</span>
              </div>
              <div class="legend-item">
                <div class="legend-color color-metal"></div>
                <span>Metal</span>
              </div>
              <div class="legend-item">
                <div class="legend-color color-general"></div>
                <span>General Waste</span>
              </div>
              <div class="legend-item">
                <div class="legend-color color-hazardous"></div>
                <span>Hazardous Waste</span>
              </div>
              <div class="legend-item">
                <div class="legend-color color-ewaste"></div>
                <span>E-Waste</span>
              </div>
            </div>

            {/* Waste Data Table */}
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waste Type</th>
                  <th>Quantity (kg)</th>
                </tr>
              </thead>
              <tbody>
                {viewRecord.wastes.map((w, i) => (
                  <tr key={i}>
                    <td>
                      <span
                        className={`waste-badge badge-${w.waste_type.toLowerCase()}`}
                      >
                        {w.waste_type}
                      </span>
                    </td>
                    <td>{w.weight_in_kg ?? w.size_of_litres}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="summary-box">
              <p>
                <strong>Total Collected:</strong>{" "}
                {viewRecord.wastes
                  .reduce(
                    (sum, w) => sum + (w.weight_in_kg ?? w.size_of_litres),
                    0
                  )
                  .toFixed(2)}{" "}
                kg
              </p>
              <p>
                <strong>Completed At:</strong>{" "}
                {new Date(viewRecord.wastes[0].created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

// --- Modal Components ---
const ModalWrapper = ({ children, title, onClose }) => (
  <div className="modal">
    <div className="modal-content">
      <div className="modal-header">
        <h3>{title}</h3>
        <span className="close-modal" onClick={onClose}>
          &times;
        </span>
      </div>
      {children}
    </div>
  </div>
);

const ScheduleSelect = ({
  schedules,
  selectedSchedule,
  setSelectedSchedule,
}) => (
  <div className="form-group">
    <label>Select Completed Schedule *</label>
    <select
      className="form-control"
      value={selectedSchedule?.schedule_id || ""}
      onChange={(e) =>
        setSelectedSchedule(
          schedules.find((s) => s.schedule_id === e.target.value)
        )
      }
      required
    >
      <option value="">-- Select Schedule --</option>
      {schedules.map((s) => (
        <option key={s.schedule_id} value={s.schedule_id}>
          {s.hotel_name} - {s.day} ({s.slot})
        </option>
      ))}
    </select>
  </div>
);

const DustbinForm = ({
  dustbins,
  handleDustbinChange,
  addDustbin,
  removeDustbin,
}) => (
  <>
    {dustbins.map((dustbin, index) => (
      <div key={index} className="dustbin-form ">
        <h4>Dustbin {index + 1}</h4>
        <div className="form-row">
          <div className="form-group">
            <label>Waste Type *</label>
            <select
              className="form-control"
              value={dustbin.wasteType}
              onChange={(e) =>
                handleDustbinChange(index, "wasteType", e.target.value)
              }
              required
            >
              {Object.keys(WASTE_DENSITY_KG_PER_L).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Liters *</label>
            <input
              type="number"
              className="form-control"
              min="0.1"
              step="0.1"
              value={dustbin.liters}
              onChange={(e) =>
                handleDustbinChange(index, "liters", e.target.value)
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Kilograms (auto)</label>
            <input
              type="number"
              className="form-control"
              value={dustbin.kg}
              readOnly
            />
          </div>
        </div>
        {dustbins.length > 1 && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => removeDustbin(index)}
          >
            Remove
          </button>
        )}
      </div>
    ))}
    <button type="button" className="btn btn-outline" onClick={addDustbin}>
      + Add Dustbin
    </button>
  </>
);

const ModalActions = ({ onClose }) => (
  <div className="form-actions">
    <button type="button" className="btn btn-outline" onClick={onClose}>
      Cancel
    </button>
    <button type="submit" className="btn btn-primary">
      Save
    </button>
  </div>
);

export default CompletedSchedules;
