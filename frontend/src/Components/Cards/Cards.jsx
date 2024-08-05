import React, { useEffect, useState } from "react";
import "./Cards.css";
import { cardsData } from "../../Data";
import axios from "axios";

import Card from "../Card/Card";
import { domain } from "../../Context/config";

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
useEffect(()=>{
  async function apiCall() {
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://'+domain+':8080/cards'
    };
    
    await axios.request(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data[0]));
      setIssued(response.data[0]);
      setRevoked(response.data[1]);
      setUsed(response.data[2]);
    })
    .catch((error) => {
      console.log(error);
    });
  }
    async function apiCallforCount() {
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'http://'+domain+':8080/compactCard'
      };
      
      await axios.request(config)
      .then((response) => {
        // console.log(JSON.stringify(response.data));
       setIssuedCount(response.data[0]);
       setIssuedTotal(response.data[1]);
       setRevokedCount(response.data[2]);
       setRevokedTotal(response.data[3]);
       setUsageCount(response.data[4]);
       setUsageTotal(response.data[5]);
      })
      .catch((error) => {
        console.log(error);
      });
    }
  apiCallforCount();
  apiCall();
},[])


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
