import DataTable from "../../components/common/DataTable";
const favourites = [
  {
    id: "fa-1",
    product: "Paneer Butter Masala",
    category: "Main course",
    favourites: 342,
    rating: 4.9,
  },
  {
    id: "fa-2",
    product: "Classic Butter Naan",
    category: "Breads",
    favourites: 286,
    rating: 4.8,
  },
];
export default function FavouriteList() {
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Favourites</h1>
          <p>See the dishes your customers love most.</p>
        </div>
      </div>
      <DataTable
        data={favourites}
        columns={[
          { key: "product", label: "PRODUCT" },
          { key: "category", label: "CATEGORY" },
          { key: "favourites", label: "FAVOURITES" },
          { key: "rating", label: "RATING" },
        ]}
      />
    </>
  );
}
