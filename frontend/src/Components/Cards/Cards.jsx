import React, { useEffect, useState } from "react";
import "./Cards.css";
import { cardsData } from "../../Data";
import Card from "../Card/Card";
import api from "../../Pages/axiosInstance";

const Cards = () => {
const [issued,setIssued] = useState([])
const [revoked,setRevoked] = useState([])
const [used,setUsed] = useState([])

const [issuedCount,setIssuedCount] = useState('')
const [issuedTotal,setIssuedTotal] = useState('')
const [revokedCount,setRevokedCount] = useState('')
const [revokedTotal,setRevokedTotal] = useState('')
const [usageCount,setUsageCount] = useState('')
const [usageTotal,setUsageTotal] = useState('')

const counts = [
  {
    value: issuedCount,
    percent: (issuedTotal > 0 ? ((issuedCount / issuedTotal) * 100).toFixed(2) : '0.00')
  },
  {
    value: revokedCount,
    percent: (revokedTotal > 0 ? ((revokedCount / revokedTotal) * 100).toFixed(2) : '0.00')
  },
  {
    value: usageCount,
    percent: (usageTotal > 0 ? ((usageCount / usageTotal) * 100).toFixed(2) : '0.00')
  }
];

const series = [
  [{name : "Issued",
    data : issued
  }],
[{name : "Revoked",
    data : revoked
  }],
  [{name : "Used",
    data : used
  }],
]
// api call 
useEffect(() => {
  async function fetchData() {
    try {
      const accessToken = api.getAccessToken();
      if (accessToken) {
        api.setAuthHeader(accessToken);
      }

      const [cardsResponse, compactResponse] = await Promise.all([
        api.axiosInstance.post("/cards"),
        api.axiosInstance.post("/compactCard"),
      ]);

      if (cardsResponse.status === 200) {
        setIssued(cardsResponse.data[0]);
        setRevoked(cardsResponse.data[1]);
        setUsed(cardsResponse.data[2]);
      }

      if (compactResponse.status === 200) {
        setIssuedCount(compactResponse.data[0]);
        setIssuedTotal(compactResponse.data[1]);
        setRevokedCount(compactResponse.data[2]);
        setRevokedTotal(compactResponse.data[3]);
        setUsageCount(compactResponse.data[4]);
        setUsageTotal(compactResponse.data[5]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }

  fetchData();
}, []);





  return (
    <div className="Cards">
      {cardsData.map((card, id) => {
        return (
          <div className="parentContainer" key={id}>
            <Card
              title={card.title}
              color={card.color}
              barValue={counts[id].percent}
              value={counts[id].value}
              png={card.png}
              series={series[id]}
              layoutId={card.layoutId}
            />
          </div>
        );
      })}
    </div>
  );
};

export default Cards;
