import DataTable from "../../components/common/DataTable";
const settings = [
  {
    id: "se-1",
    setting: "Store status",
    value: "Open for orders",
    status: "Active",
  },
  { id: "se-2", setting: "Delivery radius", value: "8 km", status: "Active" },
];
export default function Settings() {
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Settings</h1>
          <p>Configure your storefront and admin preferences.</p>
        </div>
      </div>
      <DataTable
        data={settings}
        columns={[
          { key: "setting", label: "SETTING" },
          { key: "value", label: "VALUE" },
          { key: "status", label: "STATUS" },
        ]}
      />
    </>
  );
}
