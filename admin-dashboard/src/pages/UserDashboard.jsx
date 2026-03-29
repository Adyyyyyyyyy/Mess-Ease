import { useEffect, useState } from "react";

function UserDashboard() {
const [data, setData] = useState({
  people: 0,
  estimated_wait: "0 minutes",
  crowd_level: "Low",
  alerts: {}
});

  useEffect(() => {
  const interval = setInterval(() => {
    fetch("http://127.0.0.1:8000/mess-status")
      .then(res => res.json())
      .then(res => setData(res))
      .catch(err => console.error(err));
  }, 3000); // every 3 seconds

  return () => clearInterval(interval);
}, []);

return (
  <div>

    {data.alerts?.fresh_batch && (
      <div style={{
        background: "#d4edda",
        color: "#155724",
        padding: "10px",
        borderRadius: "8px",
        marginTop: "20px"
      }}>
        🍲 Fresh batch available!
      </div>
    )}

    {data.alerts?.food_ending && (
      <div style={{
        background: "#f8d7da",
        color: "#721c24",
        padding: "10px",
        borderRadius: "8px",
        marginTop: "10px"
      }}>
        ⚠️ Food ending soon!
      </div>
    )}

    <div style={{ padding: "20px" }}>
      <h1>Mess Status</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {/* your cards */}
      </div>
    </div>

  </div>
);
    
    <div style={{ padding: "20px" }}>
      <h1>Mess Status</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        
        <div style={cardStyle}>
          <h3>People</h3>
          <p>{data.people}</p>
        </div>

        <div style={cardStyle}>
          <h3>Wait Time</h3>
          <p>{data.estimated_wait}</p>
        </div>

        <div style={cardStyle}>
          <h3>Crowd Level</h3>
          <p>{data.crowd_level}</p>
        </div>

      </div>
    </div>
  
}

const cardStyle = {
  padding: "20px",
  borderRadius: "10px",
  background: "#eee",
  width: "150px",
  textAlign: "center"
};

export default UserDashboard;