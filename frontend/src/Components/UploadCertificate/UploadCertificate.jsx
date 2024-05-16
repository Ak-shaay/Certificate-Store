import React, { useState } from "react";
import "./UploadCertificate.css";
import axios from "axios";
import { domain } from "../../Context/config";

const UploadCertificate = () => {

const [file,setFile]= useState({});

const [serialNo,setSerialNo]= useState();
const [commonName,setCommonName]= useState();
const [country,setCountry]= useState();
const [state,setState]= useState();
const [region,setRegion]= useState();
const [issuer,setIssuer]= useState();
const [validity,setValidity]= useState();
const [hash,setHash]= useState();

const handleFileChange = (event) => {
  const selectedFile = event.target.files[0];
  console.log("Selected file:", selectedFile);
  setFile(selectedFile);

  if (selectedFile) {
    document.querySelector(".file-info").style.display = 'flex';
  } else {
    document.querySelector(".file-info").style.display = 'none';
  }
};

const handleFileUpload = () => {
  if (file) {
    const data = new FormData();
    data.append('certificate', file);
  
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'http://'+domain+':8080/cert',
      withCredentials: true,
      data: data
    };
    axios.request(config)
      .then((response) => {
        console.log(response.data);
        document.querySelector(".file-block").style.display='flex';
        document.querySelector(".error-block").style.display='none';
        setSerialNo(response.data.serialNo);
        setCommonName(response.data.commonName);
        setCountry(response.data.country)
        setState(response.data.state);
        setRegion(response.data.region);
        setIssuer(response.data.issuer);
        setValidity(response.data.validity)
        setHash(response.data.hash)
        
      })
      .catch((error) => {
        console.log("error getting response",error);
        document.querySelector(".error-block").style.display='flex';
        document.querySelector(".file-block").style.display='none';
  
      });
  } else {
    alert('No file selected.')
    console.log('No file selected.');
  }
  
}
  return (
    <div class="Maindash">
      <div class="upload-files-container">
        <div class="file-area">
          <h1 class="dynamic-message">Certificate Upload</h1>
          <label class="label">
            <span class="browse-files">
              <input type="file" class="default-file-input" onChange={handleFileChange} />
              <span class="browse-files-text">browse file </span>
              <span> from device</span>
            </span>
          </label>
        </div>
        <div class="file-info" id="file-info">
          <span class="file-name">File Name : {file.name}</span> |
          <span class="file-size">Size : {(file.size / 1024).toFixed(1)} KB</span>
        </div>
        <button type="button" id="uploadCertificate" class="upload-btn" onClick={handleFileUpload}>
          Upload
        </button>

        <div class="file-block">
          <label>Serial Number : <span >{serialNo}</span></label>
          <br />
          <label>Common Name : <span>{commonName}</span></label>
          <br />
          <label>Country : <span>{country}</span></label>
          <br />
          <label>State : <span>{state} </span></label>
          <br />
          <label>Region : <span>{region}</span> </label>
          <br />
          <label>Issuer : <span>{issuer}</span> </label>
          <br />
          <label>Validity : <span>{validity}</span> </label>
          <br />
          <label>Hash : <span>{hash}</span> </label>
          <br />
        </div>
        <div class="error-block">
          <span class="error">Error uploading the file!!!</span>
        </div>
      </div>
    </div>
  );
};

export default UploadCertificate;
