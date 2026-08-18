import { ShoppingBag, Star, TrendingUp, Users } from "lucide-react";

const stats = [
  ["Today's revenue", "₹24,680", "12.5%", TrendingUp],
  ["Orders today", "128", "8.2%", ShoppingBag],
  ["New customers", "34", "18.4%", Users],
  ["Average rating", "4.8", "0.3%", Star],
];

export default function Dashboard() {
  return (
    <>
      <div className="section-head">
        <div>
          <h1>Good morning, Deepak!</h1>
          <p>Here's what's happening with your restaurant today.</p>
        </div>
      </div>
      <div className="stats">
        {stats.map(([name, value, change, Icon]) => (
          <article className="stat-card" key={name}>
            <div className="stat-icon purple">
              <Icon size={21} />
            </div>
            <span>{name}</span>
            <strong>{value}</strong>
            <small className="positive">
              <TrendingUp size={14} /> {change} vs last week
            </small>
          </article>
        ))}
      </div>
      <section className="card placeholder">
        <h2>Restaurant overview</h2>
        <p>Your latest sales, orders and customer activity will appear here.</p>
      </section>
    </>
  );
}
