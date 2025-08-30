// import { useState, useEffect, useRef } from "react";
// import DataTable from "../components/DataTable";
// import "../css/Schedulling.css";

// // Services
// import { getCollections, updateCollection } from "../services/ScheduleService";
// import { getHotels } from "../services/hotelServices";

// const ClientScheduling = () => {
//   const [collections, setCollections] = useState([]);
//   const [, setHotels] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [showAlert, setShowAlert] = useState(false);
//   const [yesterdayCount, setYesterdayCount] = useState(0);
//   const alertRef = useRef(null);

//   // ✅ Approve (Complete) a schedule
//   const handleComplete = async (scheduleId) => {
//     try {
//       await updateCollection(scheduleId, { status: "Completed" });

//       setCollections((prev) =>
//         prev.filter((item) => item.schedule_id !== scheduleId)
//       );
//     } catch (err) {
//       console.error("Failed to complete schedule:", err);
//       alert("Failed to update schedule. Please try again.");
//     }
//   };

//   // Fetch collections and hotels
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [collectionsRes, hotelsRes] = await Promise.all([
//           getCollections(),
//           getHotels(),
//         ]);

//         const today = new Date().toLocaleDateString("en-US", {
//           weekday: "long",
//         });

//         const yesterdayDate = new Date();
//         yesterdayDate.setDate(yesterdayDate.getDate() - 1);
//         const yesterday = yesterdayDate.toLocaleDateString("en-US", {
//           weekday: "long",
//         });

//         // Separate schedules
//         const todaySchedules = collectionsRes.filter(
//           (item) => item.status === "Pending" && item.day === today
//         );

//         const yesterdaySchedules = collectionsRes.filter(
//           (item) => item.status === "Pending" && item.day === yesterday
//         );

//         // Set yesterday count and show alert if there are pending schedules from yesterday
//         if (yesterdaySchedules.length > 0) {
//           setYesterdayCount(yesterdaySchedules.length);
//           setShowAlert(true);

//           // Auto-hide alert after 8 seconds
//           setTimeout(() => {
//             setShowAlert(false);
//           }, 8000);
//         }

//         // Merge into one table with yesterday first
//         const merged = [
//           ...yesterdaySchedules.map((s) => ({ ...s, isYesterday: true })),
//           ...todaySchedules.map((s) => ({ ...s, isYesterday: false })),
//         ];

//         setCollections(merged);
//         setHotels(hotelsRes);
//       } catch (err) {
//         setError(err.message || "Error fetching data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   // Close alert when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (alertRef.current && !alertRef.current.contains(event.target)) {
//         setShowAlert(false);
//       }
//     };

//     if (showAlert) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showAlert]);

//   // ✅ Download PDF function
//   const handleDownloadPDF = async () => {
//     try {
//       const response = await fetch("http://127.0.0.1:8000/download-schedules/");
//       if (!response.ok) throw new Error("Failed to download PDF");
//       const blob = await response.blob();
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "today_yesterday_schedules.pdf");
//       document.body.appendChild(link);
//       link.click();
//       link.parentNode.removeChild(link);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (loading) return <div className="loading">Loading scheduling data...</div>;
//   if (error) return <div className="error">Error: {error}</div>;

//   // ✅ Render table rows
//   const rows = collections.map((item) => {
//     const [hours, minutes] = item.end_time.split(":").map(Number);
//     const scheduledMinutes = hours * 60 + minutes;

//     const now = new Date();
//     const currentMinutes = now.getHours() * 60 + now.getMinutes();
//     const isLate = currentMinutes > scheduledMinutes + 15;

//     return {
//       Day: item.day + (item.isYesterday ? " (Yesterday)" : ""),
//       "Start Time": item.start_time,
//       "End Time": item.end_time,
//       Hotel: item.hotel_name,
//       Status: item.status,
//       Action: (
//         <button
//           className={`btn ${item.isYesterday ? "btn-danger blink" : "btn-primary"}`}
//           onClick={() => handleComplete(item.schedule_id)}
//         >
//           {item.isYesterday ? "Complete" : "Complete"}
//         </button>
//       ),
//       rowClassName: item.isYesterday
//         ? "yesterday-row"
//         : isLate
//         ? "table-danger"
//         : "",
//     };
//   });

//   return (
//     <div className="content">
//       <div>
//         <h2>Daily Collections</h2>
//         <br />
//       </div>
//       {/* Popup Alert for yesterday's pending schedules */}
//       {showAlert && (
//         <div className="popup-overlay">
//           <div ref={alertRef} className="popup-alert">
//             <div className="popup-header">
//               <h3>⚠️ Pending Collections from Yesterday</h3>
//               <button
//                 className="popup-close"
//                 onClick={() => setShowAlert(false)}
//               >
//                 &times;
//               </button>
//             </div>
//             <div className="popup-content">
//               <p>
//                 There are <strong>{yesterdayCount}</strong> pending schedules from
//                 yesterday that need attention.
//               </p>
//               <div className="popup-actions">
//                 <button
//                   className="btn btn-primary"
//                   onClick={() => {
//                     const yesterdayRows = document.querySelectorAll(".yesterday-row");
//                     if (yesterdayRows.length > 0) {
//                       yesterdayRows[0].scrollIntoView({ behavior: "smooth" });
//                     }
//                     setShowAlert(false);
//                   }}
//                 >
//                   View Details
//                 </button>
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => setShowAlert(false)}
//                 >
//                   Dismiss
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ✅ Single Table */}
//       <div className="card">
//         <div className="card-header">
//           <h3>Collections</h3>
//           {/* Download PDF Button */}
//       <div style={{ marginBottom: "15px" }}>
//         <button className="btn btn-primary" onClick={handleDownloadPDF}>
//           📄 Download PDF
//         </button>
//       </div>
//         </div>
//         <DataTable
//           columns={["Day", "Start Time", "End Time", "Hotel", "Status", "Action"]}
//           rows={rows}
//         />
//       </div>
//     </div>
//   );
// };

// export default ClientScheduling;
