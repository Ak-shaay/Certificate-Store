const jwt = require("jsonwebtoken");
const axios = require("axios");

//function to fetch issued certificate data from blockchain
async function getBlockchainData(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
      if (err) {
        return res.sendStatus(403);
      } else {
        const {
          issuer,
          subjectType,
          region,
          state,
          selectedDate,
          startDate,
          endDate,
          validity,
        } = req.body;

        if (user.authNo != null) {
          const authData = await userModel.findUserByAuthNo(user.authNo);
          let data;

          // Check if any filter fields are provided
          if (
            subjectType ||
            region ||
            state ||
            selectedDate ||
            startDate ||
            endDate ||
            validity
          ) {
            // Normalize subjectType if it's an array
            const normalizedSubjectType = Array.isArray(subjectType)
              ? subjectType.join(",")
              : subjectType;
            const normalizedState = Array.isArray(state)
              ? state.join(",")
              : state;

            data = JSON.stringify({
              fcn: "queryAllCACertsByCA",
              args: [
                authData[0].AuthName, // CAName
                startDate, // IssuedDate
                endDate, // expiry_date
                normalizedSubjectType, // subjectType
                "", // certType
                normalizedState, // state
                "", // city
                validity, // validityPeriod
                "filterData", // queryType
                "", // range
              ],
            });
          } else {
            // No filters applied, use the normal query
            data = JSON.stringify({
              fcn: "queryAllCACertsByCA",
              args: [
                authData[0].AuthName, // CAName
                "", // IssuedDate
                "", // expiry_date
                "", // subjectType
                "", // certType
                "", // state
                "", // city
                "", // validityPeriod
                "Ledger", // queryType
                "", // range
              ],
            });
          }
          try {
            // console.log("data",data);

            const result = await axios.post(
              "http://10.244.0.197:9080/fabric/v1/invokecc",
              data,
              {
                headers: {
                  apikey: "d1c0d209b2c00e1cee448a703d639b4a0644a07b",
                  "x-access-token": "",
                  "Content-Type": "application/json",
                },
              }
            );

            if (result.data && result.data.Data) {
              res.json(result.data.Data);
            } else {
              res.status(400).json({ error: "Invalid data received from API" });
            }
          } catch (error) {
            console.error("API Error:", error.message);
            res.status(500).json({ error: error.message });
          }
        } else {
          res.status(500).json({ error: "admin API" });
        }
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}

async function verifyCertificiate(req, res) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err) => {
      if (err) {
        return res.sendStatus(403);
      } else {
        const { serialNo, issuerSerialNo, issuerName } = req.body;
        const data = JSON.stringify({
          fcn: "verifyCert",
          args: [serialNo, issuerSerialNo, issuerName, "Final"],
        });
        const result = await axios.post(
          "http://10.244.0.197:9080/fabric/v1/invokecc",
          data,
          {
            headers: {
              apikey: "d1c0d209b2c00e1cee448a703d639b4a0644a07b",
              "x-access-token": "",
              "Content-Type": "application/json",
            },
          }
        );

        if (result.data && result.data.Data) {
            
            let parsedData;
            try {
                parsedData = JSON.parse(result.data.Data); 
            } catch (e) {
              return res.status(400).json({ error: "Failed to parse Data" });
            }
            res.json({
              SerialNumber: parsedData.Metadata.SerialNumber, 
              issuerSerialNo: parsedData.Metadata.IssuerSlNo,
              IssuerName: parsedData.Metadata.IsssuerName,//spelling 
              Hash: parsedData.Data.Hash,
            });
          } else {
            res.status(400).json({ error: "Invalid data received from API" });
          }
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}
module.exports = {
  getBlockchainData,
  verifyCertificiate,
};
