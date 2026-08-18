import DataTable from "../../components/common/DataTable";
const offers = [
  {
    id: "of-1",
    title: "Welcome offer",
    code: "WELCOME20",
    discount: "20% off",
    status: "Active",
  },
  {
    id: "of-2",
    title: "Weekend special",
    code: "WEEKEND15",
    discount: "15% off",
    status: "Active",
  },
];
export default function OfferList() {
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Offers</h1>
          <p>Create promotions that bring customers back.</p>
        </div>
      </div>
      <DataTable
        data={offers}
        columns={[
          { key: "title", label: "TITLE" },
          { key: "code", label: "CODE" },
          { key: "discount", label: "DISCOUNT" },
          { key: "status", label: "STATUS" },
        ]}
      />
    </>
  );
}
