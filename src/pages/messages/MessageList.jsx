import DataTable from "../../components/common/DataTable";
const messages = [
  {
    id: "me-1",
    customer: "Priya Sharma",
    subject: "Order update",
    message: "Can I change delivery time?",
    status: "Unread",
  },
  {
    id: "me-2",
    customer: "Rohan Mehta",
    subject: "Feedback",
    message: "Loved the food!",
    status: "Read",
  },
];
export default function MessageList() {
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Messages</h1>
          <p>Reply to incoming customer conversations.</p>
        </div>
      </div>
      <DataTable
        data={messages}
        columns={[
          { key: "customer", label: "CUSTOMER" },
          { key: "subject", label: "SUBJECT" },
          { key: "message", label: "MESSAGE" },
          { key: "status", label: "STATUS" },
        ]}
      />
    </>
  );
}
