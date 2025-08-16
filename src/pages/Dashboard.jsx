import DataTable from "../components/DataTable";
export default function Dashboard() {
  return (
    <div className="content">
      <div>
        <h2>Operations Dashboard</h2>
        <br />
      </div>
      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Today'sCollectiions</h3>
            <span>📅</span>
          </div>
           <h4>24</h4>
           <p>5 pending • 12 in progress • 7 completed</p>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Total Requests</h3>
            <span>📅</span>
          </div>
           <h4>24</h4>
           <p>5 pending • 12 in progress • 7 completed</p>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Active Workers</h3>
            <span>👷</span>
          </div>
          <h4>18/22</h4>
          <p>14 on route • 4 at facility</p>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
        <h3>Pending Service Requests</h3>
        <button class="btn btn-primary">View All</button>
        </div>
        <DataTable columns={["ID", "Hotel", "Type", "Status", "Date", "Action"]} rows={[]} />
      </div>

    </div>
  );
}
