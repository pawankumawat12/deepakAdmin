import DataTable from "../../components/common/DataTable";
const reviews = [
  {
    id: "re-1",
    customer: "Priya Sharma",
    rating: 5,
    comment: "Delicious food and fast delivery.",
    status: "Published",
  },
  {
    id: "re-2",
    customer: "Rohan Mehta",
    rating: 4,
    comment: "Great paneer butter masala.",
    status: "Published",
  },
];
export default function ReviewList() {
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Reviews</h1>
          <p>Monitor what customers are saying about Deepak Foods.</p>
        </div>
      </div>
      <DataTable
        data={reviews}
        columns={[
          { key: "customer", label: "CUSTOMER" },
          { key: "rating", label: "RATING" },
          { key: "comment", label: "COMMENT" },
          { key: "status", label: "STATUS" },
        ]}
      />
    </>
  );
}
