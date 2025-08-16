import DataTable from "../components/DataTable";

export default function Requests() {
  return (
    <div className="content">
      <h2>Requests</h2>
      <DataTable columns={["ID", "Hotel", "Type", "Status", "Date"]} rows={[]} />
    </div>
  );
}
