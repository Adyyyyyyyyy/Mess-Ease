import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
const cardStyle = {
  padding: "20px",
  borderRadius: "16px",
  background: "white",
  textAlign: "center",
  boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
  transition: "0.3s"
};

const Dashboard = () => {
  const navigate = useNavigate();
    const [data, setData] = useState({
  people: 0,
  estimated_wait: "",
  crowd_level: "",
  next_fresh_item: "",
  history: []
});

useEffect(() => {
  const fetchData = () => {
    axios.get("http://127.0.0.1:8000/mess-status")
      .then(res => {
        setData(res.data);
      })
      .catch(err => console.log(err));
  };

  fetchData(); // run once

  const interval = setInterval(fetchData, 5000); // every 5 sec

  return () => clearInterval(interval); // cleanup
}, []);
  return (
  <div style={{ display: "flex" }}>

    {/* Sidebar */}
    <div style={{
  width: "240px",
  background: "#1e272e",
  color: "white",
  minHeight: "100vh",
  padding: "25px"
}}>
  <h2 style={{
    color: "#ff4757",
    fontWeight: "bold",
    marginBottom: "40px"
  }}>
    Mess-Ease
  </h2>

<p 
  onClick={() => navigate("/")}
  style={{
    padding: "10px",
    borderRadius: "8px",
    background: "#2f3542",
    cursor: "pointer"
  }}
>
  📊 Dashboard
</p>

  <p 
  onClick={() => navigate("/analytics")}
  style={{ marginTop: "15px", cursor: "pointer" }}
>
  📈 Analytics
</p>

</div>

    {/* Main Content */}
    <div style={{
  flex: 1,
  padding: "30px",
  background: "#f5f6fa",
  minHeight: "100vh",
  maxWidth: "1200px",
  margin: "0 auto",
  width: "100%"  
}}>
      <h1 style={{ textAlign: "center", color: "#2f3542" }}>Mess-Ease Admin Dashboard</h1>
 <div style={{
 display: "grid",
gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "30px"
}}>
        <div style={cardStyle}>
          <h3 style={{ marginBottom: "10px", color: "#555" }}>
  Estimated Count
</h3>

<p style={{ fontSize: "22px", fontWeight: "bold" }}>
  {data.people}
</p>
        </div>

        <div
  style={{ ...cardStyle, background: "#ffeaa7" }}
  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
>
          <h3 style={{ marginBottom: "10px", color: "#555" }}>
  Current Crowd
</h3>

<p style={{ fontSize: "22px", fontWeight: "bold" }}>
  {data.people}
</p>
        </div>

        <div
  style={{ ...cardStyle, background: "#fab1a0" }}
  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
>
          <h3 style={{ marginBottom: "10px", color: "#555" }}>
  Waiting Time
</h3>
          <p style={{ fontSize: "22px", fontWeight: "bold" }}>
  {data.estimated_wait}
</p>
        </div>

        <div
  style={{ ...cardStyle, background: "#74b9ff", color: "white" }}
  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
>
          <h3 style={{ marginBottom: "10px", color: "#555" }}>
  Recommended Time
</h3>

<p style={{ fontSize: "22px", fontWeight: "bold" }}>
  {data.next_fresh_item}
</p>
        </div>
        <div
  style={{ ...cardStyle, background: "#dfe6e9" }}
  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
>
  <h3 style={{ marginBottom: "10px", color: "#2f3542" }}>
  Crowd Level
</h3>

<p style={{
  fontSize: "22px",
  fontWeight: "bold",
  color:
    data.crowd_level === "Low" ? "green" :
    data.crowd_level === "Moderate" ? "orange" : "red"
}}>
  {data.crowd_level}
</p>
</div>
      </div>

      <div style={{ marginTop: "50px" }}>
  <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
    Trends / History
  </h2>

  <div style={{
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  }}>
    
    <ResponsiveContainer width="100%" height={300}>
  <LineChart data={data.history}>
      <XAxis dataKey="time" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="people" stroke="#ff4757" />
      </LineChart>
</ResponsiveContainer>

  </div>
</div>
    </div>
    </div>
  );
};

export default Dashboard;