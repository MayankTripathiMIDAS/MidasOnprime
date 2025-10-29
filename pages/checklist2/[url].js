import InputField from "../../components/InputField";
import moment from "moment-timezone";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Form, Formik, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { addDays } from "date-fns";
import { DateRange, DateRangePicker } from "react-date-range";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import swal from "sweetalert";
import "react-datepicker/dist/react-datepicker.css";
import ReactDatePicker from "react-datepicker";
import { host } from "../../static";
import requestIp from "request-ip";
import { NextApiRequest, NextApiResponse } from "next";
import { id } from "date-fns/locale";
import CryptoJS from "crypto-js";
import NotRequiredInputField from "@/components/NotRequiredInputField";

const Url = ({ url, id, mail, r, mi, tenant }) => {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [speciality, setSpeciality] = useState("");
  const [totalExperience, setTotalExperience] = useState("");
  const [token, setToken] = useState("");
  const [html, setHTML] = useState("");
  const [dob, setDob] = useState(false);
  const [sign, setSign] = useState("");
  const [rtrSign, setRtrSign] = useState("");
  const [rtrData, setRtrData] = useState("");
  const [candidateData, setCandidateData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [dateofBirth, setDateOfBirth] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState("");
  const [data, setData] = useState([]);
  const [senderMail, setSenderMail] = useState("");
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    phoneno: "",
    email: "",
    dob: "",
    ssn: "",
    address: "",
  });
  const [showDate, setShowDate] = useState(false);
  const [references, setReferenes] = useState([
    {
      name: "",
      phoneno: "",
      email: "",
    },
    {
      name: "",
      phoneno: "",
      email: "",
    },
  ]);
  const [state, setState] = useState([
    {
      startDate: "",
      endDate: "",
      key: "selection",
    },
  ]);

  function formatToUSPhoneNumber(phone) {
    // Remove any non-numeric characters
    const cleaned = ("" + phone).replace(/\D/g, "");

    // Format based on the length of the cleaned number
    if (cleaned.length === 10) {
      // Format as (XXX) XXX-XXXX
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      // Format as +1 (XXX) XXX-XXXX
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(
        4,
        7
      )}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 7) {
      // Format as XXX-XXXX for 7-digit numbers
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }

    // Return the original input if it doesn't match common US phone number lengths
    return phone;
  }

  const [states, setStates] = useState([""]);

  const handleAddState = () => {
    event.preventDefault();
    setStates([...states, ""]); // Adds a new state input
  };

  const handleRemoveState = (index) => {
    const newStates = states.filter((_, i) => i !== index); // Removes the state input at the specified index
    setStates(newStates);
  };

  const handleStateChange = (index, event) => {
    const newStates = [...states];
    newStates[index] = event.target.value; // Updates the value of the state input at the specified index
    setStates(newStates);
  };

  //Validation*************************************************

  const formik = useFormik({
    initialValues: {
      firstname: "",
      lastname: "",
      phoneno: "",
      email: "",
      dob: "",
      ssn: "",
      address: "",
    },
    validationSchema: Yup.object({
      firstname: Yup.string().required("Required"),
      lastname: Yup.string().required("Required"),
      phoneno: Yup.string().required("Required"),
      ssn: Yup.string()
        .matches(/^[0-9]+$/, "Please enter only numbers")
        .required("SSN is required")
        .min(4, "Enter Last 4 Digits only")
        .max(4, "Enter Last 4 Digits only"),
      email: Yup.string().email("Invalid email address").required("Required"),
      dob: Yup.date()
        .required("Date of Birth is required")
        .test(
          "not-in-future",
          "Date of Birth cannot be a future date",
          function (value) {
            const selectedDate = new Date(value);
            const currentDate = new Date();
            return selectedDate <= currentDate;
          }
        ),
      // address: Yup.string().required("Required"),
    }),
    onSubmit: (values, e) => {
      submitData(values, e);
      createCandidate();
    },
  });

  var userEmail = mail;

  const secretKey = "secretHello";

  function decryptURL(encryptedURL, secretKey) {
    const decodedURL = decodeURIComponent(encryptedURL);
    const encryptedBase64 = Buffer.from(decodedURL, "base64").toString();
    const bytes = CryptoJS.AES.decrypt(encryptedBase64, secretKey);
    const decryptedURL = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedURL;
  }
  const decryptedMail = decryptURL(userEmail, secretKey);

  const rtrDetails = () => {
    const options = {
      method: "GET",
      headers: {
        "accept": "*/*",
        "X-Tenant": tenant,
        "Content-Type": "application/json" // Add this
      },
      mode: "cors" // Explicitly enable CORS
    };
  
    const url = mi
      ? `https://tenantapi.theartemis.ai/api/email/getLinksById/${mi}`
      : `https://tenantapi.theartemis.ai/api/email/getAllLinks/${decryptedMail}`;
  
    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setRtrData(responseData[0] || responseData);
        setCandidateData(responseData[0] || responseData);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        // Handle error cases here
      });
  };

  const handleCandidateChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace("rtr", "");
    setCandidateData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  //Validation*************************************************
  const newDate = moment().tz("US/Central").format("MM-DD-YYYY");

  const from =
    state[0].startDate === ""
      ? ""
      : moment(state[0].startDate).format("MM/DD/YYYY");
  const to =
    state[0].endDate === ""
      ? ""
      : moment(state[0].endDate).format("MM/DD/YYYY");
  function renderTable(datas, title) {
    // Start building the table markup

    let tableHTML = `<div class="container" style="width: 400px; text-align: center; margin-top: 20px;">`;
    tableHTML = `<div class="row">`;
    tableHTML = `<div  class="col-md-6">`;
    tableHTML = `<form>`;
    tableHTML = `<table class="table table-bordered" style="width: 50vh; text-align: center; margin-left:160px; position: relative">`;

    tableHTML += `<thead class="health-table" style="position: relative">`;
    tableHTML += "<tr>";
    tableHTML +=
      '<img class="logo-container" style="position: absolute; width= 500px; height:200px; opacity: 0.1; transform: rotate(335deg);left: 25%" src="https://midasconsulting.org/images/logo.webp" />';
    tableHTML += `<th class="health-row" colspan="4">${title}</th>`;

    tableHTML += `<th  class="health-row small" scope="col" style="width: 100px; text-align: center;">1</th>`;
    tableHTML += `<th  class="health-row small" scope="col" style="width: 100px; text-align: center;">2</th>`;
    tableHTML += `<th  class="health-row small" scope="col" style="width: 100px; text-align: center;">3</th>`;
    tableHTML += `<th  class="health-row small" scope="col" style="width: 100px; text-align: center;">4</th>`;

    tableHTML += "</tr>";
    tableHTML += "</thead>";

    datas.map((ite, index) => {
      tableHTML += "<tbody>";
      tableHTML += "<tr>";

      tableHTML += `<th class="table-data" colspan="4" scope="row">${ite.name}</th>`;

      tableHTML += `<td class="table-data">${
        ite.value1 === "checked"
          ? `<div style = "height: 15px; width: 15px; background: #0f875b;  border-radius: 50px; margin-left: 30px" class ="circle-box"></div>`
          : `<input class="form-check-input" type="radio" name=${ite.name}
                        required disabled > `
      } </td>`;
      tableHTML += `<td class="table-data">${
        ite.value2 === "checked"
          ? `<div style = "height: 15px; width: 15px; background: #0f875b;  border-radius: 50px; margin-left: 30px" class ="circle-box"></div>`
          : `<input class="form-check-input" type="radio" name=${ite.name}
                        required id="flexRadioDefault" disabled >`
      } </td>`;
      tableHTML += `<td class="table-data">${
        ite.value3 === "checked"
          ? `<div style = "height: 15px; width: 15px; background: #0f875b;  border-radius: 50px; margin-left: 30px" class ="circle-box"></div>`
          : `<input class="form-check-input" type="radio" name=${ite.name}
                        required id="flexRadioDefault" disabled >`
      } </td>`;
      tableHTML += `<td class="table-data">${
        ite.value4 === "checked"
          ? `<div style = "height: 15px; width: 15px; background: #0f875b;  border-radius: 50px; margin-left: 30px" class ="circle-box"></div>`
          : `<input class="form-check-input" type="radio" name=${ite.name}
                        required id="flexRadioDefault" disabled >`
      } </td>`;
      tableHTML += "</tbody>";
    });

    // Generate the table header
    // Generate the table body
    // Finish the table markup

    tableHTML += "</table>";
    tableHTML += "</form>";

    tableHTML += "</div>";
    tableHTML += "</div>";
    tableHTML += "</div>";

    return tableHTML;
  }

  const capitalized = url.charAt(0).toUpperCase() + url.slice(1);

  const date = `${from}-${to}`;

  const StringDate = JSON.stringify(date);

  const candidate = candidateData;
  const auth = token;
  const candidateSpeciality = speciality;
  const experience = totalExperience;

  const reference = references;

  const createCandidate = async (candidate, values, auth, experience) => {
    const candidateSpeciality = speciality;
    const checkliststate = states;
    const raw = JSON.stringify({
  active: true,
  source: "Checklist",
  additionalProperties: {},
  certifications: [],
  city: "",
  companiesWorkedAt: [{}],
  contactTime: "",
  currentCTC: "",
  dateIssued: new Date().toISOString(),
  dateOfBirth: "",
  date_added: new Date().toISOString(),
  degree: [],
  designation: [
    {
      additionalProperties: {},
      country: "",
      countryCode: "",
      postalCode: "",
      state: "",
    },
  ],
  desiredShifts: "",
  eligibleToWorkUS: true,

  email:
    candidateData.jobTitle === ""
      ? formik.values.email
      : candidateData.email,

  expirationDate: "",
  experience: [],
  fileHandle: {
    "@microsoft.graph.downloadUrl": "string",
    "@odata.context": "string",
    cTag: "string",
  },
  fullText: "",
  gender: "",
  hasLicenseInvestigated: true,
  investigationDetails: "",
  issuingState: "",
  last_updated: new Date().toISOString(),

  lastName:
    candidateData.jobTitle === ""
      ? formik.values.lastname
      : candidateData.lastName,

  license: [""],
  licenseNumber: "",
  licensedStates: "",
  licenses: [],
  municipality: "",
  name:
    candidateData.jobTitle === ""
      ? `${formik.values.firstname} ${formik.values.lastname}`
      : `${candidateData.firstName} ${candidateData.lastName}`,

  otherPhone: "",
  phone:
    candidateData.jobTitle === ""
      ? formik.values.phoneno
      : candidateData.phone,

  preferredCities:
    candidateData.jobTitle === "" ? checkliststate : [""],

  preferredDestinations: "",
  primarySpeciality: candidateSpeciality,
  profession: "",
  regions: "",
  skills: [""],
  state: checkliststate,
  totalExp: totalExperience,
  travelStatus: "",
  university: [],
  workAuthorization: "",
  zip: "",
});


    try {
      const response = await fetch(
        "https://tenanthrmsapi.theartemis.ai/api/v1/candidateMidas/createCandidate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Tenant": tenant,
          },
          body: raw,
        }
      );

      const result = await response.json();

    if (response.ok) {
      swal({
        title: "Success!",
        text: "Your data has been saved successfully.",
        icon: "success",
        timer: 2000,
        buttons: false
      }).then(() => {
        window.location.reload();
      });
    } else {
      swal({
        title: "Error!",
        text: "Failed to save data.",
        icon: "error"
      });
    }

  } catch (error) {
    swal({
      title: "Network Error",
      text: error.message,
      icon: "error"
    });
  }
}

  const createCandidatebyFirstReference = async (
    reference,
    candidate,
    values,
    auth,
    experience,
    candidateSpeciality
  ) => {
    const raw = JSON.stringify({
  active: true,
  additionalProperties: {},
  certifications: [],
  city: "",
  companiesWorkedAt: [{}],
  date_added: new Date().toISOString(),
  contactTime: "",
  currentCTC: "",
  dateIssued: new Date().toISOString(),
  dateOfBirth: "",
  degree: [],
  designation: [
    {
      additionalProperties: {},
      country: "",
      countryCode: "",
      postalCode: "",
      state: "",
    },
  ],
  desiredShifts: "",
  eligibleToWorkUS: true,
  email: reference[0].email,
  expirationDate: "",
  experience: [],
  fileHandle: {
    "@microsoft.graph.downloadUrl": "string",
    "@odata.context": "string",
    createdBy: {
      application: {
        displayName: "string",
        id: "string",
      },
      user: {
        active: true,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        email: "string",
        firstName: "string",
        fullName: "string",
        id: "string",
        isZoomUser: true,
        lastName: "string",
        mobileNumber: "string",
        password: "string",
        profilePicture: "string",
        roles: [
          {
            id: "string",
            role: "string",
          },
        ],
        userType: "EXTERNAL",
      },
    },
    createdDateTime: "string",
    cTag: "string",
    eTag: "string",
    file: {
      hashes: {
        quickXorHash: "string",
      },
      mimeType: "string",
    },
    fileSystemInfo: {
      createdDateTime: "string",
      lastModifiedDateTime: "string",
    },
    id: "string",
    lastModifiedBy: {
      application: {
        displayName: "string",
        id: "string",
      },
      user: {
        active: true,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        email: "string",
        firstName: "string",
        fullName: "string",
        id: "string",
        isZoomUser: true,
        lastName: "string",
        mobileNumber: "string",
        password: "string",
        profilePicture: "string",
        roles: [
          {
            id: "string",
            role: "string",
          },
        ],
        userType: "EXTERNAL",
      },
    },
    lastModifiedDateTime: "string",
    name: "string",
    parentReference: {
      driveId: "string",
      driveType: "string",
      id: "string",
      name: "string",
      path: "string",
      siteId: "string",
    },
    shared: {
      scope: "string",
    },
    size: 0,
    webUrl: "string",
  },
  fullText: "",
  gender: "",
  hasLicenseInvestigated: true,
  investigationDetails: "",
  issuingState: "",
  last_updated: new Date().toISOString(),
  license: [""],
  licenseNumber: "",
  licensedStates: "",
  licenses: [{}],
  municipality: "",
  name: reference[0].name,
  otherPhone: "",
  phone: reference[0].phoneno,
  preferredCities: [""],
  preferredDestinations: "",
  primarySpeciality: candidateSpeciality,
  profession: "",
  regions: "",
  skills: [""],
  source: "Checklist",
  state: "",
  totalExp: totalExperience,
  travelStatus: "",
  university: [{}],
  workAuthorization: "",
  zip: "",
});

    console.log("firstReferneceAPI", raw);

    if (
      references[0]?.name !== "" &&
      references[0]?.phoneno !== "" &&
      references[0]?.email !== ""
    ) {
      try {
        const response = await fetch(
          "https://tenanthrmsapi.theartemis.ai/api/v1/candidateMidas/createCandidate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Tenant": tenant,
            },
            body: raw,
          }
        );

        const result = await response.json();

    if (response.ok) {
      swal({
        title: "Success!",
        text: "Your data has been saved successfully.",
        icon: "success",
        timer: 2000,
        buttons: false
      }).then(() => {
        window.location.reload();
      });
    } else {
      swal({
        title: "Error!",
        text: "Failed to save data.",
        icon: "error"
      });
    }

  } catch (error) {
    swal({
      title: "Network Error",
      text: error.message,
      icon: "error"
    });
  }
}
  };

  const createCandidatebySecondReference = async (
    reference,
    candidate,
    values,
    auth,
    experience,
    candidateSpeciality
  ) => {
    const raw = JSON.stringify({
  active: true,
  additionalProperties: {},
  certifications: [],
  city: "",
  companiesWorkedAt: [{}],
  date_added: new Date().toISOString(),
  contactTime: "",
  currentCTC: "",
  dateIssued: new Date().toISOString(),
  dateOfBirth: "",
  degree: [],
  designation: [
    {
      additionalProperties: {},
      country: "",
      countryCode: "",
      postalCode: "",
      state: "",
    },
  ],
  desiredShifts: "",
  eligibleToWorkUS: true,
  email: reference[1].email,
  expirationDate: "",
  experience: [],
  fileHandle: {
    "@microsoft.graph.downloadUrl": "string",
    "@odata.context": "string",
    createdBy: {
      application: {
        displayName: "string",
        id: "string",
      },
      user: {
        active: true,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        email: "string",
        firstName: "string",
        fullName: "string",
        id: "string",
        isZoomUser: true,
        lastName: "string",
        mobileNumber: "string",
        password: "string",
        profilePicture: "string",
        roles: [
          {
            id: "string",
            role: "string",
          },
        ],
        userType: "EXTERNAL",
      },
    },
    createdDateTime: "string",
    cTag: "string",
    eTag: "string",
    file: {
      hashes: {
        quickXorHash: "string",
      },
      mimeType: "string",
    },
    fileSystemInfo: {
      createdDateTime: "string",
      lastModifiedDateTime: "string",
    },
    id: "string",
    lastModifiedBy: {
      application: {
        displayName: "string",
        id: "string",
      },
      user: {
        active: true,
        dateCreated: new Date().toISOString(),
        dateModified: new Date().toISOString(),
        email: "string",
        firstName: "string",
        fullName: "string",
        id: "string",
        isZoomUser: true,
        lastName: "string",
        mobileNumber: "string",
        password: "string",
        profilePicture: "string",
        roles: [
          {
            id: "string",
            role: "string",
          },
        ],
        userType: "EXTERNAL",
      },
    },
    lastModifiedDateTime: "string",
    name: "string",
    parentReference: {
      driveId: "string",
      driveType: "string",
      id: "string",
      name: "string",
      path: "string",
      siteId: "string",
    },
    shared: {
      scope: "string",
    },
    size: 0,
    webUrl: "string",
  },
  fullText: "",
  gender: "",
  hasLicenseInvestigated: true,
  investigationDetails: "",
  issuingState: "",
  last_updated: new Date().toISOString(),
  license: [""],
  licenseNumber: "",
  licensedStates: "",
  licenses: [{}],
  municipality: "",
  name: reference[1].name,
  otherPhone: "",
  phone: reference[1].phoneno,
  preferredCities: [""],
  preferredDestinations: "",
  primarySpeciality: candidateSpeciality,
  profession: "",
  regions: "",
  skills: [""],
  source: "Checklist",
  state: "",
  totalExp: totalExperience,
  travelStatus: "",
  university: [{}],
  workAuthorization: "",
  zip: "",
});

    console.log("secondReferencesAPI", raw);

    if (
      references[1]?.name !== "" &&
      references[1]?.phoneno !== "" &&
      references[1]?.email !== ""
    ) {
      try {
        const response = await fetch(
          "https://tenanthrmsapi.theartemis.ai/api/v1/candidateMidas/createCandidate",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-Tenant": tenant,
            },
            body: raw,
          }
        );

        const result = await response.json();

    if (response.ok) {
      swal({
        title: "Success!",
        text: "Your data has been saved successfully.",
        icon: "success",
        timer: 2000,
        buttons: false
      }).then(() => {
        window.location.reload();
      });
    } else {
      swal({
        title: "Error!",
        text: "Failed to save data.",
        icon: "error"
      });
    }

  } catch (error) {
    swal({
      title: "Network Error",
      text: error.message,
      icon: "error"
    });
  }
}
  };

  const submitData = (e, values, candidateData, token) => {
    createCandidate(candidateData, token);
    createCandidatebyFirstReference(references, token);
    createCandidatebySecondReference(references, token);

    const dateofbith = moment(values.dob).format("MM/DD/YYYY");
    const inputDate = JSON.stringify(dateofbith);
    e.preventDefault();
    const th =
      data === undefined || data.length === 0
        ? "WAIT"
        : data.list.map((item, index) => {
            const { items, title } = item;
            return { items, title };
          });

    const Html = `<!DOCTYPE html>
<html>
   <head>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
         integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"
         integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p"
         crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js"
         integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF"
         crossorigin="anonymous"></script>
      <style>
         .table-bordered {
         border: 0.5px solid gray !important;
         }
         .health-row {
         padding: 0px 5px !important;
         background-color: yellow !important;
         }
         .health-row .small {
         padding: 0 !important;
         }
         .table-data {
         font-weight: 400;
         font-size: 12px;
         }
         #text{
         display : none;
         }
      </style>
   </head>
   <body>


    <div class="container mt-5">
   <img class="website-logo " style=" width:150px " src="https://midasconsulting.org/images/logo.webp" />
   </div>
   <form>
        <div class="container checklist-head mt-3">
        <div class="text-center">
          <h2> ${capitalized} Skills Checklist</h2>
          </div>
          <div class="col-md-12 p-1">
            <div class="row">
              <div class="form-group row mb-3 d-flex align-items-center bg-light border rounded p-2">
                <div class="form-group row mb-3 d-flex align-items-center">
                  <div class="col-md-4">
                    <label class="m-2 text-dark">First Name</label>
                    <span class="form-control" style="background-color: #e9ecef;">${
                      values.firstname
                    }</span>
                  </div>
                  <div class="col-md-4">
                    <label class="m-2 text-dark">Last Name</label>
                    <span class="form-control" style="background-color: #e9ecef;">${
                      values.lastname
                    }</span>
                  </div>
                  <div class="col-md-4">
                    <label class="m-2 text-dark">Phone number</label>
                    <span class="form-control" style="background-color: #e9ecef;">${
                      values.phoneno
                    }</span>
                  </div>
                  <div class="col-md-4">
                    <label class="m-2 text-dark">E-mail</label>
                    <span class="form-control" style="background-color: #e9ecef; font-size: 13px;">${
                      values.email
                    }</span>
                  </div>
                  <div class="col-md-4">
                    <label class="m-2 text-dark">Date of Birth</label>
                    <input
                      type="text"
                      class="form-control"
                      id="dob"
                      name="dob"
                      value=${inputDate === "Invalid date" ? "" : inputDate}
                    disabled
                    />
                  </div>
                  <div class="col-md-4">
                    <label class="m-2 text-dark">Last four SSN digit</label>
                   <span class="form-control" style="background-color: #e9ecef;">${
                     values.ssn
                   }</span>
                  </div>
                 
                  <div class="col-md-4">
                    <label class="m-2 text-dark">Request Time Off</label>
                    <input
                      class="form-control"
                      required=""
                      disabled=""
                      value=${
                        StringDate == "Invalid date-Invalid date"
                          ? ""
                          : StringDate
                      }
                    />
                  </div>
                   <div class="col-md-6">
                    <label class="m-2 text-dark">Address</label>
                   
                     <span class="form-control" style="background-color: #e9ecef;">${
                       values.address
                     }</span>
                   
                  </div>
                </div>        
                <div class="form-group row mb-3 d-flex align-items-center">
                  <div class="col-md-4">
                    <label class="m-2 text-dark"> Referre's Name</label>
                     <span class="form-control" style="background-color: #e9ecef;">${
                       references[0].name
                     }</span>
                   
                  </div>
                  <div class="col-md-4">
                    <label class="m-2 text-dark"> Referre's Phone</label>
                     <span class="form-control" style="background-color: #e9ecef;">${
                       references[0].phoneno
                     }</span>
                  </div>
                  <div class="col-md-4">
                    <label class="m-2 text-dark">Referre's E-mail</label>
                     <span class="form-control" style="background-color: #e9ecef; font-size: 13px;">${
                       references[0].email
                     }</span>
                  </div>
                    ${
                      references[1]
                        ? `  
         <div class="col-md-4">
                    <label class="m-2 text-dark">Referee's Name</label>
                      <span class="form-control" style="background-color: #e9ecef;">${references[1].name}</span>
                   
                  </div>
                  
                  <div class="col-md-4">
                    <label class="m-2 text-dark">Referee's Phone </label>
                      <span class="form-control" style="background-color: #e9ecef;">${references[1].phoneno}</span>
                  </div>
                  <div class="col-md-4">
                    <label class="m-2 text-dark">Referee's E-mail</label>
                     <span class="form-control" style="background-color: #e9ecef; font-size: 13px;">${references[1].email}</span>
                  </div>
              
            `
                        : ""
                    }
                 
                </div>
                <div class="form-group row mt-3 ">
                  <div class="col-md-11">
                    <p>
                      <strong>Instructions:</strong>
                      <span class="text-muted text-sm declare-para">
                        This checklist is meant to serve as a general guideline
                        for our client facilities as to the level of your skills
                        within your nursing specialty. Please use the scale
                        below to describe your experience/expertise in each area
                        listed below.
                      </span>
                    </p>
                  </div>
                  <div class="col-md-11">
                       <p>1 = No Experience</p>
               <p>2 = Need Training</p>
               <p>3 = Able to perform with supervision</p>
               <p>4 = Able to perform independently</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
   

      
      ${
        th === undefined || th === "Wait"
          ? ""
          : th.map((item, index) => {
              const tab = renderTable(item.items, item.title);
              return tab;
            })
      }
   
      <div>
         <div class="form-group row mt-3 d-flex mx-5">
            <div className="col-md-11">
               <p className="declare-para">
                  I hereby certify that ALL information I have provided on this
                  skills checklist and all other documentation, is true and
                  accurate. I understand and acknowledge that any
                  misrepresentation or omission may result in disqualification
                  from employment and/or immediate termination.
               </p>
            </div>
         </div>
         <div 
            style="margin-top: 10px;  justify-content: space-between;  display: flex; flex-direction:row;"
              class="mx-5">
            <div className="date-box">
               <p>Date signed-:</p>
               <strong>
               <span>${newDate}</span>
               </strong>
            </div>
            <div className="sign-box" style= "display: flex; flex-direction:column;">
               <strong>
               <span>Signature</span>
               </strong>
                <span class="form-control" style="background-color: #e9ecef; padding : 5px; width: 180px;  margin-top :10px;">${sign}</span>
            </div>
         </div>
      </div>
   </body>
</html>`;
    setHTML(Html);

    const RTR = `<!DOCTYPE html>
<html>
   <head>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
         integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
         <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"
         integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p"
         crossorigin="anonymous"></script>
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js"
         integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF"
         crossorigin="anonymous"></script>
      <style>
         .table-bordered {
         border: 0.5px solid gray !important;
         }
         .health-row {
         padding: 0px 5px !important;
         background-color: yellow !important;
         }
         .health-row .small {
         padding: 0 !important;
         }
         .table-data {
         font-weight: 400;
         font-size: 12px;
         }
         #text{
         display : none;
         }
      </style>
   </head>
   <body>

   <div class="rtr-container mt-5 mb-5" style="margin-left:30px; margin-right:30px">
   <img class="website-logo " style=" width:150px " src="https://midasconsulting.org/images/logo.webp" />

  <p style="margin-top:20px;">
    Hi ${rtrData.firstName}<br />
    Please acknowledge this email and authorize Midas Consulting
    to represent your profile for the position of ${rtrData.jobTitle}.
  </p>
  <div class="rtr-details">
    <h6 style="font-weight: 600; color: #CB1829; margin-top: 10px;">JOB DETAILS</h6>
    <div class="details-spans">
      <strong style="flex: 1;">Job Title</strong>
      <span style="flex: 2;">: ${rtrData.jobTitle}</span>
    </div>
    <div class="details-spans">
      <strong style="flex: 1;">Duration</strong>
      <span style="flex: 2;">: ${rtrData.jobDuration} Weeks</span>
    </div>
    <div class="details-spans">
      <strong style="flex: 1;">Guaranteed Hours</strong>
      <span style="flex: 2;">: ${rtrData.guaranteedHours} hours</span>
    </div>
    <div class="details-spans">
      <strong style="flex: 1;">Shift</strong>
      <span style="flex: 2;">: ${rtrData.shift}</span>
    </div>
    <div class="details-spans">
      <strong style="flex: 1;">Pay Rate</strong>
      <span style="flex: 2;">: $${rtrData.payRate}/hr</span>
    </div>
    <div class="details-spans">
      <strong style="flex: 1;">Facility Address</strong>
      <span style="flex: 2;">: ${rtrData.facilityAddress}</span>
    </div>
    <div class="details-spans">
      <strong style="flex: 1;">Gross Weekly</strong>
      <span style="flex: 2;">: ${rtrData.grossWeekly}</span>
    </div>
    <h6 style="font-weight: 600; color: #CB1829; margin-top: 10px;">RESPONSIBILITIES</h6>
    <div class="responsibilities">
      <ul>
          ${
            rtrData &&
            rtrData.responsibilities &&
            Array.isArray(rtrData.responsibilities)
              ? rtrData.responsibilities
                  .map((item) => `<li>${item}</li>`)
                  .join("")
              : "" // Render an empty string if rtrData is null, undefined, or responsibilities is not valid
          }
      </ul>
    </div>
    <h6 style="font-weight: 600; color: #CB1829;">REQUIREMENTS</h6>
    <div class="requirements">
      <ul>
         ${
           rtrData &&
           rtrData.requirements &&
           Array.isArray(rtrData.requirements)
             ? rtrData.requirements.map((item) => `<li>${item}</li>`).join("")
             : "" // Render an empty string if rtrData is null, undefined, or responsibilities is not valid
         }
      </ul>
    </div>
    <div class="sign-box-rtr">
      <strong><span>Signature</span></strong>
     <span class="form-control" style="background-color: #e9ecef; padding : 5px; width: 180px;  margin-top :10px;">${rtrSign}</span>
     <br />
     <span>Date Signed: ${newDate}</span>
    </div>
  </div>
</div>

   
   </body>
</html>`;

    const RtrTemp = rtrData === "" ? "" : RTR;

    const formatDob = moment(formValues.dob).format("MM/DD/YYYY");

    const options = {
      method: "POST",
      url: `${host}list/submitCheckList2`,
      headers: { "Content-Type": "application/json" },
      data: {
        firstname: values.firstname,
        lastname: values.lastname,
        phoneno: values.phoneno,
        email: values.email,
        dob: formatDob,
        ssn: values.ssn,
        references: references,
        list: data.list,
        htmlData: Html,
        htmlData1: RtrTemp,
        listName: data.Listname,
        address: values.address,
        requestTimeOffDate: { startDate: from, endDate: to },
        categoryname: url,
        senderMail: senderMail,
      },
    };
    setLoading(true);
    axios
      .request(options)
      .then(function (response) {
        setLoading(true);
        if (response.data.baseResponse.status === 1) {
          swal({
            title: "Response received.",
            text: "Thank you! Your response has been received.",
            icon: "success",
            showConfirmButton: true, // Ensures a confirm button is displayed
          }).then(() => {
            window.location.reload();
            setLoading(true);
          });
        }
      })
      .catch(function (error) {
        alert(error);
      });
  };
  const authToken = () => {
    const options = {
      method: "POST",
      headers: {
        cookie: "JSESSIONID=B666C8018B66CA7C561B76806A7C9778",
        "Content-Type": "application/json",
        "User-Agent": "insomnia/8.6.1",
        "X-tenant": tenant,
        
      },
      body: '{"email":"archit.mishra@midasconsulting.org","password":"MidasAdmin@3321"}',
    };

    fetch("https://tenanthrmsapi.theartemis.ai/api/v1/user/authenticate", options)
      .then((response) => response.json())
      .then((response) => setToken(response.response))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    authToken();
  }, []);

  // const handleReferences = (e, index) => {
  //   e.preventDefault();
  //   const { name, value } = e.target;
  //   // console.log(value, "value");
  //   if (name === "phoneno") {
  //     const list = [...references];
  //     list[index][name] = parseInt(value);
  //     setReferenes(list);
  //   } else {
  //     const list = [...references];
  //     list[index][name] = value;
  //     setReferenes(list);
  //   }
  // };

  const handleReferences = (e, index) => {
    e.preventDefault();
    const { name, value } = e.target;

    // Create a copy of the references array
    const updatedReferences = [...references];
    updatedReferences[index][name] = value;

    if (name === "name" && index !== 0) {
      const firstReferenceName = updatedReferences[0].name;
      if (value === firstReferenceName) {
        // Alert or handle error for duplicate name
        alert(
          "Reference name cannot be the same as the first reference's name"
        );
        return;
      }
    }

    // Check if the entered phone number or email matches the first reference's details
    if (name === "phoneno" && index !== 0) {
      const firstPhoneNo = updatedReferences[0].phoneno;
      if (value === firstPhoneNo) {
        // Alert or handle error for duplicate phone number
        alert("Phone number cannot be the same as the first reference");
        return;
      }
    }

    if (name === "email" && index !== 0) {
      const firstEmail = updatedReferences[0].email;
      if (value === firstEmail) {
        // Alert or handle error for duplicate email
        alert("Email cannot be the same as the first reference");
        return;
      }
    }

    // Update state with the modified references array
    setReferenes(updatedReferences);
  };

  const tableData = () => {
    let options = {
      method: "GET",
      headers: {
        "User-Agent": "insomnia/8.6.1",
      },
    };

    fetch(
      `${host}list/getCheckList2/${url}?id=${id}&mail=${mail}&r=${r}`,
      options
    )
      .then((res) => res.json())
      // .then((json) => console.log(json))
      .then((response) => {
        if (response.baseResponse.status === 1) {
          setData(response.response);
          setSenderMail(response.recruiterMail);
        } else {
          router.push("/404");
        }
      })
      .catch((err) => console.error("error:" + err));
  };

  useEffect(() => tableData(), []);
  useEffect(() => rtrDetails(), []);

  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    errors,
    touched,
  } = formik;

  return (
    <>
      {url !== "" || url !== undefined || url !== null ? (
        <>
          <div
            className={loading ? "loader-container-show" : "loader-container"}
          >
            <div id="loading-bar-spinner" class="spinner">
              <div class="spinner-icon">
                <div class="spinner-icon2"></div>
              </div>
            </div>
          </div>
          {r === "nortr" ? (
            <form onSubmit={(e) => submitData(e, values)}>
              <div className="container checklist-head">
                <div className="midas-logo">
                  <img src="/images/logo.webp" />
                </div>

                <div className="circle-box"></div>

                {url == undefined ? (
                  <h2>Wait While we fetch data for you</h2>
                ) : (
                  <h2>{capitalized} Skills Checklist</h2>
                )}

                <div className="col-md-12 p-1">
                  <div className="row">
                    <div class="form-group row mb-3 d-flex align-items-center bg-light border rounded p-2">
                      <div className="form-group row mb-3 d-flex align-items-center">
                        <InputField
                          label={"First Name*"}
                          value={values.firstname}
                          type={"text"}
                          placeholder={"Enter First Name"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"firstname"}
                          error="firstname"
                          touch="firstname"
                          errors={formik.errors.firstname}
                          touched={formik.touched.firstname}
                        />

                        <InputField
                          label={"Last Name*"}
                          value={values.lastname}
                          type={"text"}
                          placeholder={"Enter Last Name"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"lastname"}
                          errors={formik.errors.lastname}
                          touched={formik.touched.lastname}
                        />

                        <InputField
                          label={"Phone number*"}
                          value={values.phoneno}
                          type={"number"}
                          placeholder={"Enter Phone number"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"phoneno"}
                          errors={formik.errors.phoneno}
                          touched={formik.touched.phoneno}
                        />

                        <InputField
                          label={"Enter E-mail*"}
                          value={values.email}
                          type={"email"}
                          placeholder={"Enter E-mail"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"email"}
                          errors={formik.errors.email}
                          touched={formik.touched.email}
                        />

                        <InputField
                          label={"Date Of Birth*"}
                          value={values.dob}
                          type={"date"}
                          id={"dob"}
                          required={true}
                          name={"dob"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          errors={formik.errors.dob}
                          touched={formik.touched.dob}
                        />

                        <InputField
                          label={"Last four SSN digits"}
                          value={formik.values.ssn}
                          type={"text"} // Ensure the type is set correctly
                          placeholder={"Last four SSN digits"}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"ssn"}
                          errors={formik.errors.ssn}
                          touched={formik.touched.ssn}
                        />

                        <InputField
                          label={"Address"}
                          value={values.address}
                          placeholder={"Enter Your Address"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"address"}
                        />

                        {from && to == "Invalid date" ? (
                          ""
                        ) : (
                          <>
                            <InputField
                              label={"Request Time Off"}
                              value={`${from} -  ${to}`}
                              disabled={true}
                            />
                          </>
                        )}
                        <div className="col-md-1" style={{ marginTop: "40px" }}>
                          <span
                            className="btn bg-danger text-white border rounded "
                            onClick={() => setShowDate(true)}
                          >
                            <i class="fa-solid fa-plus"></i>
                          </span>
                        </div>
                        {/* ------------------------------------------------------------------------- */}
                        {showDate === true ? (
                          <div
                            className={`modal ${showDate}`}
                            style={{ display: "block", position: "initial" }}
                          >
                            <Modal.Dialog>
                              <Modal.Header>
                                <Modal.Title>
                                  Select Request Time Off
                                </Modal.Title>
                              </Modal.Header>

                              <Modal.Body>
                                <DateRange
                                  onChange={(item) =>
                                    setState([item.selection])
                                  }
                                  ranges={state}
                                />
                              </Modal.Body>

                              <Modal.Footer>
                                <Button
                                  variant="secondary"
                                  onClick={() => setShowDate(false)}
                                >
                                  Close
                                </Button>
                              </Modal.Footer>
                            </Modal.Dialog>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>

                      {/* ------------------------------------------------------------------------- */}
                      <div class="form-group row mt-3">
                        <div className="col-md-11">
                          <span
                            className="btn  btn-danger"
                            onChange={() => setActive(!active)}
                          >
                            2 professional References. (One must be supervisor)
                          </span>
                        </div>
                        <div className="col-md-11"></div>
                      </div>

                      <div className="refences-div">
                        {references.map((item, index) => (
                          <div className="form-group row mb-3 d-flex align-items-center">
                            <NotRequiredInputField
                              label={"Referre's Name"}
                              value={item.name}
                              type={"text"}
                              placeholder={"Enter Full Name"}
                              onChange={(e) => handleReferences(e, index)}
                              id={"validationCustom03"}
                              name={"name"}
                              required={false}
                            />
                            <NotRequiredInputField
                              label={"Referre's Phone"}
                              value={item.phoneno}
                              type={"number"}
                              placeholder={"Enter Phone number"}
                              onChange={(e) => handleReferences(e, index)}
                              id={"validationCustom03"}
                              name={"phoneno"}
                              required={false}
                            />
                            <NotRequiredInputField
                              label={"Referre's E-mail"}
                              value={item.email}
                              type={"email"}
                              placeholder={"Enter Referre's E-mail"}
                              onChange={(e) => handleReferences(e, index)}
                              id={"validationCustom03"}
                              name={"email"}
                              required={false}
                            />
                          </div>
                        ))}
                      </div>

                      <div class="form-group row mt-3 mb-3">
                        <div className="col-md-11">
                          <span
                            className="btn  btn-danger"
                            onChange={() => setActive(!active)}
                          >
                            3 Candidate Preferences
                          </span>
                        </div>
                        <div className="col-md-11"></div>
                      </div>
                      <div className="prefereed-div">
                        <div className="form-group">
                          <div className="row">
                            <div className="col-md-3">
                              <h6>Speciality</h6>
                              <input
                                type="text"
                                className="form-control"
                                id="specialityrtr"
                                placeholder="Speciality"
                                value={speciality}
                                onChange={(e) => setSpeciality(e.target.value)}
                                required={true}
                              />
                            </div>

                            <div className="col-md-3">
                              <h6>States</h6>
                              {states.map((state, index) => (
                                <div key={index} className="input-group mb-3">
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={state}
                                    onChange={(event) =>
                                      handleStateChange(index, event)
                                    }
                                    placeholder={`State ${index + 1}`}
                                  />
                                  <div className="input-group-append">
                                    <button
                                      className="btn btn-danger"
                                      onClick={() => handleRemoveState(index)}
                                      disabled={states.length === 1}
                                    >
                                      <i className="fas fa-minus"></i>{" "}
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <button
                                className="btn btn-success"
                                onClick={handleAddState}
                              >
                                <i className="fas fa-plus"></i>{" "}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="form-group row mt-3 ">
                        <div className="col-md-11">
                          <p>
                            <strong style={{ color: "#cb1829" }}>
                              Instructions:
                            </strong>{" "}
                            <span className="text-muted text-sm declare-para">
                              This checklist is meant to serve as a general
                              guideline for our client facilities as to the
                              level of your skills within your nursing
                              specialty. Please use the scale below to describe
                              your experience/expertise in each area listed
                              below.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group row mb-3">
                    <div className="col-md-3">
                      <p>
                        <strong style={{ color: "#cb1829" }}>
                          Proficiency Scale:
                        </strong>
                      </p>
                    </div>
                    <div className="col-md-6 profiency-level">
                      <p>1 = No Experience</p>

                      <p>2 = Need Training</p>

                      <p>3 = Able to perform with supervision</p>

                      <p>4 = Able to perform independently</p>
                    </div>
                  </div>
                </div>
              </div>

              {data?.list === undefined || data?.list === null ? (
                <>Wait</>
              ) : (
                <div className="container">
                  <div className="row">
                    {data.list.map((list, index) => {
                      const ItemsVariable =
                        list.title === "CERTIFICATIONS"
                          ? list.items.pop()
                          : list.items;

                      return (
                        <>
                          <>
                            {list.title === "CERTIFICATIONS" ? (
                              <>
                                <div
                                  className="col-md-4"
                                  style={{ display: "inherit" }}
                                  key={index}
                                >
                                  <table className="table table-bordered">
                                    <thead className="health-table">
                                      <tr>
                                        <th className="health-row" colSpan="4">
                                          {list.title}
                                        </th>
                                        {[1, 2, 3, 4].map((num) => (
                                          <th
                                            key={num}
                                            className="health-row small"
                                            style={{
                                              width: "20px",
                                              textAlign: "center",
                                            }}
                                            scope="col"
                                          >
                                            {num}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody key={index}>
                                      <tr>
                                        <th
                                          className="table-data"
                                          colSpan="4"
                                          scope="row"
                                        >
                                          {ItemsVariable.name}
                                        </th>
                                        {[1, 2, 3, 4].map((num) => (
                                          <td className="table-data" key={num}>
                                            <input
                                              type="radio"
                                              value="checked"
                                              onClick={() => {
                                                ItemsVariable.value1 =
                                                  num === 1 ? "checked" : null;
                                                ItemsVariable.value2 =
                                                  num === 2 ? "checked" : null;
                                                ItemsVariable.value3 =
                                                  num === 3 ? "checked" : null;
                                                ItemsVariable.value4 =
                                                  num === 4 ? "checked" : null;
                                              }}
                                              name={ItemsVariable.name}
                                              required
                                            />
                                          </td>
                                        ))}
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                                <div
                                  className="col-md-6"
                                  style={{ display: "inherit" }}
                                  key={index}
                                >
                                  <table className="table table-bordered">
                                    <thead className="health-table">
                                      <tr>
                                        <th className="health-row" colSpan="4">
                                          {list.title}
                                        </th>
                                        <th>
                                          <span>Expiry Date</span>
                                        </th>
                                      </tr>
                                    </thead>
                                    {list.items.map((item, idx) => (
                                      <tbody key={idx}>
                                        <tr>
                                          <th
                                            className="table-data"
                                            colSpan="3"
                                            scope="row"
                                          >
                                            <input
                                              type="checkbox"
                                              value=""
                                              id="certification"
                                              style={{ marginRight: "10px" }}
                                              required
                                            />
                                          </th>
                                          <th>{item.name}</th>
                                          <th>
                                            <input
                                              type="date"
                                              className="form-control"
                                              aria-describedby="date"
                                              placeholder="Select date"
                                            />
                                          </th>
                                        </tr>
                                      </tbody>
                                    ))}
                                    <tbody>
                                      {["Other:Specify", "Other : Specify"].map(
                                        (label, idx) => (
                                          <tr key={idx}>
                                            <th colSpan={4}>
                                              {label}
                                              <textarea
                                                className="form-control"
                                                id="floatingTextarea2"
                                              ></textarea>
                                            </th>
                                            <th>
                                              <input
                                                type="date"
                                                className="form-control"
                                                aria-describedby="date"
                                                placeholder="Select date"
                                              />
                                            </th>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            ) : (
                              <div
                                className="col-md-6"
                                style={{ display: "inherit" }}
                                key={index}
                              >
                                <table className="table table-bordered">
                                  <thead className="health-table">
                                    <tr>
                                      <th className="health-row" colSpan="4">
                                        {list.title}
                                      </th>
                                      {[1, 2, 3, 4].map((num) => (
                                        <th
                                          key={num}
                                          className="health-row small"
                                          style={{
                                            width: "20px",
                                            textAlign: "center",
                                          }}
                                          scope="col"
                                        >
                                          {num}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  {list.items.map((item, idx) => (
                                    <tbody key={idx}>
                                      <tr>
                                        <th
                                          className="table-data"
                                          colSpan="4"
                                          scope="row"
                                        >
                                          {item.subcat ? (
                                            <strong>{item.subcat}</strong>
                                          ) : (
                                            item.name
                                          )}
                                        </th>
                                        {item.subcat ? (
                                          <>
                                            {[1, 2, 3, 4].map((num) => (
                                              <td
                                                key={num}
                                                className="table-data"
                                              ></td>
                                            ))}
                                          </>
                                        ) : (
                                          <>
                                            {[1, 2, 3, 4].map((num) => (
                                              <td
                                                className="table-data"
                                                key={num}
                                              >
                                                <input
                                                  type="radio"
                                                  value="checked"
                                                  onClick={() => {
                                                    item.value1 =
                                                      num === 1
                                                        ? "checked"
                                                        : null;
                                                    item.value2 =
                                                      num === 2
                                                        ? "checked"
                                                        : null;
                                                    item.value3 =
                                                      num === 3
                                                        ? "checked"
                                                        : null;
                                                    item.value4 =
                                                      num === 4
                                                        ? "checked"
                                                        : null;
                                                  }}
                                                  name={item.name}
                                                  required
                                                />
                                              </td>
                                            ))}
                                          </>
                                        )}
                                      </tr>
                                    </tbody>
                                  ))}
                                </table>
                              </div>
                            )}
                          </>
                        </>
                      );
                    })}
                  </div>
                  <div>
                    <div class="form-group row mt-3 d-flex ">
                      <div className="col-md-1">
                        <input type="checkbox" id="declare" required />
                      </div>
                      <div className="col-md-11">
                        <p className="declare-para">
                          I hereby certify that ALL information I have provided
                          on this skills checklist and all other documentation,
                          is true and accurate. I understand and acknowledge
                          that any misrepresentation or omission may result in
                          disqualification from employment and/or immediate
                          termination.
                        </p>
                      </div>
                    </div>
                    <div
                      className="container declare-box"
                      style={{ marginTop: "10px" }}
                    >
                      <div className="date-box">
                        <p>Date signed-:</p>
                        <strong>
                          <span>{newDate}</span>
                        </strong>
                      </div>
                      <div className="sign-box">
                        <strong>
                          <span>Signature</span>
                        </strong>
                        <input
                          style={{ marginTop: "10px" }}
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          placeholder="Your Signature"
                          onChange={(e) => setSign(e.target.value)}
                          value={sign}
                          required={true}
                        />
                      </div>
                    </div>
                    <div>
                      <button
                        style={{ marginTop: "20px", marginBottom: "20px" }}
                        className="btn btn-primary"
                        type="submit"
                        disabled={loading}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          ) : r === "ortr" ? (
            <form onSubmit={(e) => submitData(e, values)}>
              <div className="container checklist-head">
                <div className="midas-logo">
                  <img src="/images/logo.webp" />
                </div>
                {rtrData === "" ? (
                  <div className="container">
                    <div class="loading">Loading&#8230;</div>

                    <div class="content">
                      <h3>
                        Please Wait while we are fetching your job details!
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="rtr-container mt-5 mb-5">
                    <p>
                      Hi {rtrData.firstName}
                      <br />
                      Please acknowledge this email and authorize Midas
                      Consulting to represent your profile for the position of{" "}
                      {rtrData.jobTitle}.
                    </p>
                    <div className="rtr-details row mb-4">
                      <h6
                        className="mt-2"
                        style={{ fontWeight: "600", color: "#CB1829" }}
                      >
                        Candidate Information
                      </h6>
                      <div className="col-md-3 mt-3">
                        <label>First Name*</label>
                        <input
                          type="text"
                          className="form-control"
                          id="firstNamertr"
                          placeholder="First Name"
                          value={candidateData.firstName}
                          onChange={handleCandidateChange}
                          required={true}
                        />
                      </div>
                      <div className="col-md-3 mt-3">
                        <label>Last Name*</label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastNamertr"
                          placeholder="Last Name"
                          value={candidateData.lastName}
                          onChange={handleCandidateChange}
                          required={true}
                        />
                      </div>
                      <div className="col-md-3 mt-3">
                        <label>Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="emailrtr"
                          placeholder="Email"
                          value={candidateData.email}
                          onChange={handleCandidateChange}
                          required={true}
                        />
                      </div>
                      <div className="col-md-3 mt-3">
                        <label>Phone No</label>
                        <input
                          type="text"
                          className="form-control"
                          id="phonertr"
                          placeholder="Phone Number"
                          value={candidateData.phone}
                          onChange={handleCandidateChange}
                          required={true}
                        />
                      </div>
                      <div className="col-md-3 mt-3">
                        <label>Speciality</label>
                        <input
                          type="text"
                          className="form-control"
                          id="specialityrtr"
                          placeholder="Speciality"
                          value={speciality}
                          onChange={(e) => setSpeciality(e.target.value)}
                          required={true}
                        />
                      </div>
                      <div className="col-md-3 mt-3">
                        <label>Total Experience</label>
                        <input
                          type="text"
                          className="form-control"
                          id="experiencertr"
                          placeholder="Work Experience"
                          value={totalExperience}
                          onChange={(e) => setTotalExperience(e.target.value)}
                          required={true}
                        />
                      </div>
                    </div>
                    <div classname="rtr-details">
                      <h6
                        className="mt-2"
                        style={{ fontWeight: "600", color: "#CB1829" }}
                      >
                        JOB DETAILS
                      </h6>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Job Title</strong>
                        <span style={{ flex: 2 }}>: {rtrData.jobTitle}</span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Duration</strong>
                        <span style={{ flex: 2 }}>
                          : {rtrData.jobDuration} Weeks
                        </span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Guaranteed Hours</strong>
                        <span style={{ flex: 2 }}>
                          : {rtrData.guaranteedHours} hours
                        </span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Shift</strong>
                        <span style={{ flex: 2 }}>: {rtrData.shift}</span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Pay Rate</strong>
                        <span style={{ flex: 2 }}>: ${rtrData.payRate}/hr</span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Facility Address</strong>
                        <span style={{ flex: 2 }}>
                          : {rtrData.facilityAddress}
                        </span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Gross Weekly</strong>
                        <span style={{ flex: 2 }}>: {rtrData.grossWeekly}</span>
                      </div>
                      <h6
                        style={{
                          fontWeight: "600",
                          color: "#CB1829",
                          marginTop: "10px",
                        }}
                      >
                        RESPONSIBILITIES
                      </h6>
                      <div className="respsonsibilities">
                        <ul>
                          {rtrData.responsibilities?.map((item, index) => {
                            return <li key={index}>{item}</li>;
                          })}
                        </ul>
                      </div>
                      <h6 style={{ fontWeight: "600", color: "#CB1829" }}>
                        REQUIREMENTS
                      </h6>
                      <div className="requirements">
                        <ul>
                          {rtrData.requirements?.map((item, index) => {
                            return <li key={index}>{item}</li>;
                          })}
                        </ul>
                      </div>
                      <div
                        className="date-box"
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "10px",
                        }}
                      >
                        <p>Date signed-:</p>
                        <strong>
                          <span>{newDate}</span>
                        </strong>
                      </div>
                      <div className="sign-box-rtr">
                        <strong>
                          <span>Signature</span>
                        </strong>
                        <input
                          style={{ marginTop: "10px", width: "300px" }}
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          placeholder="Your Signature"
                          onChange={(e) => setRtrSign(e.target.value)}
                          value={rtrSign}
                          required={true}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="circle-box"></div>
              </div>

              {data?.list === undefined || data?.list === null ? (
                <>Wait</>
              ) : (
                <div className="container">
                  <div>
                    <button
                      style={{ marginTop: "20px", marginBottom: "20px" }}
                      className="btn btn-primary"
                      type="submit"
                      disabled={loading}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={(e) => submitData(e, values)}>
              <div className="container checklist-head">
                <div className="midas-logo">
                  <img src="/images/logo.webp" />
                </div>
                {rtrData === "" ? (
                  <div className="container">
                    <div class="loading">Loading&#8230;</div>

                    <div class="content">
                      <h3>
                        Please Wait while we are fetching your job details!
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="rtr-container mt-5 mb-5">
                    <p>
                      Hi {rtrData.firstName}
                      <br />
                      Please acknowledge this email and authorize Midas
                      Consulting to represent your profile for the position of{" "}
                      {rtrData.jobTitle}.
                    </p>
                    <div className="rtr-details row mb-4">
                      <h6
                        className="mt-2"
                        style={{ fontWeight: "600", color: "#CB1829" }}
                      >
                        Candidate Information
                      </h6>
                      <div className="col-md-3 mt-3">
                        <label>First Name*</label>
                        <input
                          type="text"
                          className="form-control"
                          id="firstNamertr"
                          placeholder="First Name"
                          value={candidateData.firstName}
                          onChange={handleCandidateChange}
                          required={true}
                        />
                      </div>
                      <div className="col-md-3 mt-3">
                        <label>Last Name*</label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastNamertr"
                          placeholder="Last Name"
                          value={candidateData.lastName}
                          onChange={handleCandidateChange}
                          required={true}
                        />
                      </div>
                      <div className="col-md-3 mt-3">
                        <label>Email</label>
                        <input
                          type="email"
                          className="form-control"
                          id="emailrtr"
                          placeholder="Email"
                          value={candidateData.email}
                          onChange={handleCandidateChange}
                          required={true}
                        />
                      </div>
                      <div className="col-md-3 mt-3">
                        <label>Phone No</label>
                        <input
                          type="text"
                          className="form-control"
                          id="phonertr"
                          placeholder="Phone Number"
                          value={candidateData.phone}
                          onChange={handleCandidateChange}
                          required={true}
                        />
                      </div>
                      <div className="col-md-3 mt-3">
                        <label>Speciality</label>
                        <input
                          type="text"
                          className="form-control"
                          id="specialityrtr"
                          placeholder="Speciality"
                          value={speciality}
                          onChange={(e) => setSpeciality(e.target.value)}
                          required={true}
                        />
                      </div>
                      <div className="col-md-3 mt-3">
                        <label>Total Experience</label>
                        <input
                          type="text"
                          className="form-control"
                          id="experiencertr"
                          placeholder="Work Experience"
                          value={totalExperience}
                          onChange={(e) => setTotalExperience(e.target.value)}
                          required={true}
                        />
                      </div>
                    </div>
                    <div classname="rtr-details">
                      <h6
                        className="mt-2"
                        style={{ fontWeight: "600", color: "#CB1829" }}
                      >
                        JOB DETAILS
                      </h6>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Job Title</strong>
                        <span style={{ flex: 2 }}>: {rtrData.jobTitle}</span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Duration</strong>
                        <span style={{ flex: 2 }}>
                          : {rtrData.jobDuration} Weeks
                        </span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Guaranteed Hours</strong>
                        <span style={{ flex: 2 }}>
                          : {rtrData.guaranteedHours} hours
                        </span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Shift</strong>
                        <span style={{ flex: 2 }}>: {rtrData.shift}</span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Pay Rate</strong>
                        <span style={{ flex: 2 }}>: ${rtrData.payRate}/hr</span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Facility Address</strong>
                        <span style={{ flex: 2 }}>
                          : {rtrData.facilityAddress}
                        </span>
                      </div>
                      <div className="details-spans">
                        <strong style={{ flex: 1 }}>Gross Weekly</strong>
                        <span style={{ flex: 2 }}>: {rtrData.grossWeekly}</span>
                      </div>
                      <h6
                        style={{
                          fontWeight: "600",
                          color: "#CB1829",
                          marginTop: "10px",
                        }}
                      >
                        RESPONSIBILITIES
                      </h6>
                      <div className="respsonsibilities">
                        <ul>
                          {rtrData.responsibilities?.map((item, index) => {
                            return <li key={index}>{item}</li>;
                          })}
                        </ul>
                      </div>
                      <h6 style={{ fontWeight: "600", color: "#CB1829" }}>
                        REQUIREMENTS
                      </h6>
                      <div className="requirements">
                        <ul>
                          {rtrData.requirements?.map((item, index) => {
                            return <li key={index}>{item}</li>;
                          })}
                        </ul>
                      </div>
                      <div
                        className="date-box"
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "10px",
                        }}
                      >
                        <p>Date signed-:</p>
                        <strong>
                          <span>{newDate}</span>
                        </strong>
                      </div>
                      <div className="sign-box-rtr">
                        <strong>
                          <span>Signature</span>
                        </strong>
                        <input
                          style={{ marginTop: "10px", width: "300px" }}
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          placeholder="Your Signature"
                          onChange={(e) => setRtrSign(e.target.value)}
                          value={rtrSign}
                          required={true}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="circle-box"></div>

                {url == undefined ? (
                  <h2>Wait While we fetch data for you</h2>
                ) : (
                  <h2>{capitalized} Skills Checklist</h2>
                )}

                <div className="col-md-12 p-1">
                  <div className="row">
                    <div class="form-group row mb-3 d-flex align-items-center bg-light border rounded p-2">
                      <div className="form-group row mb-3 d-flex align-items-center">
                        <InputField
                          label={"Enter First Name*"}
                          value={values.firstname}
                          type={"text"}
                          placeholder={"First Name"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"firstname"}
                          error="firstname"
                          touch="firstname"
                          errors={formik.errors.firstname}
                          touched={formik.touched.firstname}
                        />

                        <InputField
                          label={"Enter Last Name*"}
                          value={values.lastname}
                          type={"text"}
                          placeholder={"Last Name"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"lastname"}
                          errors={formik.errors.lastname}
                          touched={formik.touched.lastname}
                        />

                        <InputField
                          label={"Enter Phone number*"}
                          value={values.phoneno}
                          type={"number"}
                          placeholder={"Enter Phone number"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"phoneno"}
                          errors={formik.errors.phoneno}
                          touched={formik.touched.phoneno}
                        />

                        <InputField
                          label={"Enter E-mail*"}
                          value={values.email}
                          type={"email"}
                          placeholder={"Enter E-mail"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"email"}
                          errors={formik.errors.email}
                          touched={formik.touched.email}
                        />

                        <InputField
                          label={"Date Of Birth*"}
                          value={values.dob}
                          type={"date"}
                          id={"dob"}
                          required={true}
                          name={"dob"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          errors={formik.errors.dob}
                          touched={formik.touched.dob}
                        />

                        <InputField
                          label={"Last four SSN digits"}
                          value={formik.values.ssn}
                          type={"text"}
                          placeholder={"Last four SSN digits"}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"ssn"}
                          errors={formik.errors.ssn}
                          touched={formik.touched.ssn}
                        />

                        <InputField
                          label={"Enter Your Address"}
                          value={values.address}
                          placeholder={"Enter Your Address"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"address"}
                          errors={formik.errors.address}
                          touched={formik.touched.address}
                        />

                        {from && to == "Invalid date" ? (
                          ""
                        ) : (
                          <>
                            <InputField
                              label={"Request Time Off"}
                              value={`${from} -  ${to}`}
                              disabled={true}
                            />
                          </>
                        )}
                        <div className="col-md-1" style={{ marginTop: "40px" }}>
                          <span
                            className="btn bg-danger text-white border rounded "
                            onClick={() => setShowDate(true)}
                          >
                            <i class="fa-solid fa-plus"></i>
                          </span>
                        </div>
                        {/* ------------------------------------------------------------------------- */}
                        {showDate === true ? (
                          <div
                            className={`modal ${showDate}`}
                            style={{ display: "block", position: "initial" }}
                          >
                            <Modal.Dialog>
                              <Modal.Header>
                                <Modal.Title>
                                  Select Request Time Off
                                </Modal.Title>
                              </Modal.Header>

                              <Modal.Body>
                                <DateRange
                                  onChange={(item) =>
                                    setState([item.selection])
                                  }
                                  ranges={state}
                                />
                              </Modal.Body>

                              <Modal.Footer>
                                <Button
                                  variant="secondary"
                                  onClick={() => setShowDate(false)}
                                >
                                  Close
                                </Button>
                              </Modal.Footer>
                            </Modal.Dialog>
                          </div>
                        ) : (
                          ""
                        )}
                      </div>

                      {/* ------------------------------------------------------------------------- */}
                      <div class="form-group row mt-3">
                        <div className="col-md-11">
                          <span
                            className="btn  btn-danger"
                            onChange={() => setActive(!active)}
                          >
                            2 professional References. (One must be supervisor)
                          </span>
                        </div>
                        <div className="col-md-11"></div>
                      </div>

                      <div className="refences-div">
                        {references.map((item, index) => (
                          <div className="form-group row mb-3 d-flex align-items-center">
                            <NotRequiredInputField
                              label={"Enter Referre's Name"}
                              value={item.name}
                              type={"text"}
                              placeholder={"Full Name"}
                              onChange={(e) => handleReferences(e, index)}
                              id={"validationCustom03"}
                              name={"name"}
                              required={false}
                            />
                            <NotRequiredInputField
                              label={"Enter Referre's Phone"}
                              value={item.phoneno}
                              type={"number"}
                              placeholder={"Enter Phone number"}
                              onChange={(e) => handleReferences(e, index)}
                              id={"validationCustom03"}
                              name={"phoneno"}
                              required={false}
                            />
                            <NotRequiredInputField
                              label={"Enter Referre's E-mail"}
                              value={item.email}
                              type={"email"}
                              placeholder={"Enter Referre's E-mail"}
                              onChange={(e) => handleReferences(e, index)}
                              id={"validationCustom03"}
                              name={"email"}
                              required={false}
                            />
                          </div>
                        ))}
                      </div>

                      <div class="form-group row mt-3 mb-3">
                        <div className="col-md-11">
                          <span
                            className="btn  btn-danger"
                            onChange={() => setActive(!active)}
                          >
                            3 Candidate Preferences
                          </span>
                        </div>
                        <div className="col-md-11"></div>
                      </div>
                      <div className="prefereed-div">
                        <div className="form-group">
                          <div className="row">
                            <div className="col-md-3">
                              <h6>Speciality</h6>
                              <input
                                type="text"
                                className="form-control"
                                id="specialityrtr"
                                placeholder="Speciality"
                                value={speciality}
                                onChange={(e) => setSpeciality(e.target.value)}
                                required={true}
                              />
                            </div>

                            <div className="col-md-3">
                              <h6>States</h6>
                              {states.map((state, index) => (
                                <div key={index} className="input-group mb-3">
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={state}
                                    onChange={(event) =>
                                      handleStateChange(index, event)
                                    }
                                    placeholder={`State ${index + 1}`}
                                  />
                                  <div className="input-group-append">
                                    <button
                                      className="btn btn-danger"
                                      onClick={() => handleRemoveState(index)}
                                      disabled={states.length === 1}
                                    >
                                      <i className="fas fa-minus"></i>{" "}
                                    </button>
                                  </div>
                                </div>
                              ))}
                              <button
                                className="btn btn-success"
                                onClick={handleAddState}
                              >
                                <i className="fas fa-plus"></i>{" "}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="form-group row mt-3 ">
                        <div className="col-md-11">
                          <p>
                            <strong style={{ color: "#cb1829" }}>
                              Instructions:
                            </strong>{" "}
                            <span className="text-muted text-sm declare-para">
                              This checklist is meant to serve as a general
                              guideline for our client facilities as to the
                              level of your skills within your nursing
                              specialty. Please use the scale below to describe
                              your experience/expertise in each area listed
                              below.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group row mb-3">
                    <div className="col-md-3">
                      <p>
                        <strong style={{ color: "#cb1829" }}>
                          Proficiency Scale:
                        </strong>
                      </p>
                    </div>
                    <div className="col-md-6 profiency-level">
                      <p>1 = No Experience</p>

                      <p>2 = Need Training</p>

                      <p>3 = Able to perform with supervision</p>

                      <p>4 = Able to perform independently</p>
                    </div>
                  </div>
                </div>
              </div>

              {data?.list === undefined || data?.list === null ? (
                <>Wait</>
              ) : (
                <div className="container">
                  <div className="row">
                    {data.list.map((list, index) => {
                      const ItemsVariable =
                        list.title === "CERTIFICATIONS"
                          ? list.items.pop()
                          : list.items;

                      return (
                        <>
                          {list.title == "CERTIFICATIONS" ? (
                            <>
                              <div
                                className="col-md-4"
                                style={{ display: "inherit" }}
                                key={index}
                              >
                                <table className="table table-bordered">
                                  <thead className="health-table">
                                    <tr>
                                      <th className="health-row" colspan="4">
                                        {list.title}
                                      </th>
                                      <th
                                        className="health-row small"
                                        style={{
                                          width: "20px",
                                          textAlign: "center",
                                        }}
                                        scope="col"
                                      >
                                        1
                                      </th>
                                      <th
                                        className="health-row small"
                                        style={{
                                          width: "20px",
                                          textAlign: "center",
                                        }}
                                        scope="col"
                                      >
                                        2
                                      </th>
                                      <th
                                        className="health-row small"
                                        style={{
                                          width: "20px",
                                          textAlign: "center",
                                        }}
                                        scope="col"
                                      >
                                        3
                                      </th>
                                      <th
                                        className="health-row small"
                                        style={{
                                          width: "20px",
                                          textAlign: "center",
                                        }}
                                        scope="col"
                                      >
                                        4
                                      </th>
                                    </tr>
                                  </thead>

                                  <tbody key={index}>
                                    <tr>
                                      <th
                                        className="table-data"
                                        colspan="4"
                                        scope="row"
                                      >
                                        {ItemsVariable.name}
                                      </th>
                                      <td class="table-data">
                                        <input
                                          type="radio"
                                          value={"checked"}
                                          onChange={(e) => {
                                            ItemsVariable.value1 =
                                              e.target.value;
                                            ItemsVariable.value2 ===
                                              "checked" ||
                                            ItemsVariable.value3 ===
                                              "checked" ||
                                            ItemsVariable.value4 === "checked"
                                              ? (ItemsVariable.value1 = "")
                                              : null;
                                          }}
                                          name={ItemsVariable.name}
                                          required={true}
                                        />
                                      </td>
                                      <td class="table-data">
                                        <input
                                          type="radio"
                                          value={"checked"}
                                          onChange={(e) => {
                                            ItemsVariable.value2 =
                                              e.target.value;
                                            ItemsVariable.value1 ===
                                              "checked" ||
                                            ItemsVariable.value3 ===
                                              "checked" ||
                                            ItemsVariable.value4 === "checked"
                                              ? (ItemsVariable.value2 = "")
                                              : null;
                                          }}
                                          name={ItemsVariable.name}
                                          required
                                        />
                                      </td>
                                      <td class="table-data">
                                        <input
                                          type="radio"
                                          value={"checked"}
                                          onChange={(e) => {
                                            ItemsVariable.value3 =
                                              e.target.value;
                                            ItemsVariable.value1 ===
                                              "checked" ||
                                            ItemsVariable.value2 ===
                                              "checked" ||
                                            ItemsVariable.value4 === "checked"
                                              ? (ItemsVariable.value3 = "")
                                              : null;
                                          }}
                                          name={ItemsVariable.name}
                                          required
                                        />
                                      </td>

                                      <td class="table-data">
                                        <input
                                          type="radio"
                                          value={"checked"}
                                          onChange={(e) => {
                                            ItemsVariable.value4 =
                                              e.target.value;
                                            ItemsVariable.value1 ===
                                              "checked" ||
                                            ItemsVariable.value2 ===
                                              "checked" ||
                                            ItemsVariable.value3 === "checked"
                                              ? (ItemsVariable.value4 = "")
                                              : null;
                                          }}
                                          name={ItemsVariable.name}
                                          required
                                        />
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div
                                className="col-md-6"
                                style={{ display: "inherit" }}
                                key={index}
                              >
                                <table className="table table-bordered">
                                  <thead className="health-table">
                                    <tr>
                                      <th className="health-row" colspan="4">
                                        {list.title}
                                      </th>

                                      <th>
                                        <span>Expiry Date</span>
                                      </th>
                                    </tr>
                                  </thead>
                                  {list.items.map((item, index) => (
                                    <tbody key={index}>
                                      <tr>
                                        <th
                                          className="table-data"
                                          colspan="3"
                                          scope="row"
                                        >
                                          <input
                                            type="checkbox"
                                            value=""
                                            id="certification"
                                            style={{ marginRight: "10px" }}
                                            required
                                          />
                                        </th>
                                        <th>{item.name}</th>
                                        <th>
                                          <td>
                                            <input
                                              type="date"
                                              class="form-control"
                                              aria-describedby="date"
                                              placeholder="Select date"
                                            />
                                          </td>
                                        </th>
                                      </tr>
                                    </tbody>
                                  ))}

                                  <tbody>
                                    <tr>
                                      <th colSpan={4}>
                                        Other:Specify
                                        <textarea
                                          class="form-control"
                                          id="floatingTextarea2"
                                        ></textarea>
                                      </th>
                                      <th>
                                        <input
                                          type="date"
                                          class="form-control"
                                          aria-describedby="date"
                                          placeholder="Select date"
                                        />
                                      </th>
                                    </tr>
                                    <tr>
                                      <th colSpan={4}>
                                        Other : Specify
                                        <textarea
                                          class="form-control"
                                          id="floatingTextarea2"
                                        ></textarea>
                                      </th>
                                      <th>
                                        <input
                                          type="date"
                                          class="form-control"
                                          aria-describedby="date"
                                          placeholder="Select date"
                                        />
                                      </th>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </>
                          ) : (
                            <div
                              className="col-md-6"
                              style={{ display: "inherit" }}
                              key={index}
                            >
                              <table className="table table-bordered">
                                <thead className="health-table">
                                  <tr>
                                    <th className="health-row" colspan="4">
                                      {list.title}
                                    </th>
                                    <th
                                      className="health-row small"
                                      style={{
                                        width: "20px",
                                        textAlign: "center",
                                      }}
                                      scope="col"
                                    >
                                      1
                                    </th>
                                    <th
                                      className="health-row small"
                                      style={{
                                        width: "20px",
                                        textAlign: "center",
                                      }}
                                      scope="col"
                                    >
                                      2
                                    </th>
                                    <th
                                      className="health-row small"
                                      style={{
                                        width: "20px",
                                        textAlign: "center",
                                      }}
                                      scope="col"
                                    >
                                      3
                                    </th>
                                    <th
                                      className="health-row small"
                                      style={{
                                        width: "20px",
                                        textAlign: "center",
                                      }}
                                      scope="col"
                                    >
                                      4
                                    </th>
                                  </tr>
                                </thead>
                                {list.items.map((item, index) => {
                                  return (
                                    <tbody key={index}>
                                      <tr>
                                        <th
                                          className="table-data"
                                          colspan="4"
                                          scope="row"
                                        >
                                          {item.subcat ? (
                                            <strong>{item.subcat} </strong>
                                          ) : (
                                            item.name
                                          )}
                                        </th>
                                        {item.subcat ? (
                                          <>
                                            <td class="table-data"></td>
                                            <td class="table-data"></td>
                                            <td class="table-data"></td>
                                            <td class="table-data"></td>
                                          </>
                                        ) : (
                                          <>
                                            <td class="table-data">
                                              <input
                                                type="radio"
                                                value={"checked"}
                                                onChange={(e) => {
                                                  item.value1 = e.target.value;
                                                  item.value2 === "checked" ||
                                                  item.value3 === "checked" ||
                                                  item.value4 === "checked"
                                                    ? (item.value1 = "")
                                                    : null;
                                                }}
                                                name={item.name}
                                                required
                                              />
                                            </td>
                                            <td class="table-data">
                                              <input
                                                type="radio"
                                                value={"checked"}
                                                onChange={(e) => {
                                                  item.value2 = e.target.value;

                                                  item.value1 === "checked" ||
                                                  item.value3 === "checked" ||
                                                  item.value4 === "checked"
                                                    ? (item.value2 = "")
                                                    : null;
                                                }}
                                                name={item.name}
                                                required
                                              />
                                            </td>
                                            <td class="table-data">
                                              <input
                                                type="radio"
                                                value={"checked"}
                                                onChange={(e) => {
                                                  item.value3 = e.target.value;
                                                  item.value1 === "checked" ||
                                                  item.value2 === "checked" ||
                                                  item.value4 === "checked"
                                                    ? (item.value3 = "")
                                                    : null;
                                                }}
                                                name={item.name}
                                                required
                                              />
                                            </td>
                                            <td class="table-data">
                                              <input
                                                type="radio"
                                                value={"checked"}
                                                onChange={(e) => {
                                                  item.value4 = e.target.value;
                                                  item.value1 === "checked" ||
                                                  item.value2 === "checked" ||
                                                  item.value3 === "checked"
                                                    ? (item.value4 = "")
                                                    : null;
                                                }}
                                                name={item.name}
                                                required
                                              />
                                            </td>
                                          </>
                                        )}
                                      </tr>
                                    </tbody>
                                  );
                                })}
                              </table>
                            </div>
                          )}
                        </>
                      );
                    })}
                  </div>
                  <div>
                    <div class="form-group row mt-3 d-flex ">
                      <div className="col-md-1">
                        <input type="checkbox" id="declare" required />
                      </div>
                      <div className="col-md-11">
                        <p className="declare-para">
                          I hereby certify that ALL information I have provided
                          on this skills checklist and all other documentation,
                          is true and accurate. I understand and acknowledge
                          that any misrepresentation or omission may result in
                          disqualification from employment and/or immediate
                          termination.
                        </p>
                      </div>
                    </div>
                    <div
                      className="container declare-box"
                      style={{ marginTop: "10px" }}
                    >
                      <div className="date-box">
                        <p>Date signed-:</p>
                        <strong>
                          <span>{newDate}</span>
                        </strong>
                      </div>
                      <div className="sign-box">
                        <strong>
                          <span>Signature</span>
                        </strong>
                        <input
                          style={{ marginTop: "10px" }}
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          placeholder="Your Signature"
                          onChange={(e) => setSign(e.target.value)}
                          value={sign}
                          required={true}
                        />
                      </div>
                    </div>
                    <div>
                      <button
                        style={{ marginTop: "20px", marginBottom: "20px" }}
                        className="btn btn-primary"
                        type="submit"
                        disabled={loading}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </>
      ) : (
        "Please wait while we fetch checklist for you"
      )}
      {/* <div dangerouslySetInnerHTML={{ __html: html }} /> */}
    </>
  );
};
export default Url;
export async function getServerSideProps({ query }) {
  const { url, id, mail, r, mi } = query;
  if (mail) {
    const safeMi = mi ?? null;
    return {
      props: { url: url, id: id, mail: mail, r: r, mi: safeMi },
    };
  } else {
    function decryptURL(encryptedURL, secretKey) {
      try {
        if (!encryptedURL) return null; // Prevent errors if URL is missing
        const decodedURL = decodeURIComponent(encryptedURL);
        const encryptedBase64 = Buffer.from(decodedURL, "base64").toString();
        const bytes = CryptoJS.AES.decrypt(encryptedBase64, secretKey);
        const decryptedURL = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedURL) throw new Error("Decryption failed");
        return decryptedURL; // Ensure we return an object
      } catch (error) {
        console.error("Decryption error:", error);
        return null;
      }
    }
    function parseQueryString(queryString) {
      const queryUrl = queryString.includes("?")
        ? queryString.split("?")[0]
        : queryString;
      const query = queryString.includes("?")
        ? queryString.split("?")[1]
        : queryString;
      const params = new URLSearchParams(query);

      const result = {
        id: params.get("id") || "",
        mail: params.get("mail") || "",
        r: params.get("r") || "",
        mi: params.get("mi") || "",
        tenant: params.get("tenant") || "",
        url: queryUrl, // Hardcoded as per expected output
      };

      return result;
    }

    const secretKey = "secretHello"; // Replace with your actual AES key
    const decryptedData = url ? decryptURL(url, secretKey) : null;
    let jsonObject;
    if (decryptedData) {
      jsonObject = parseQueryString(decryptedData);
    }
    // Ensure we are correctly extracting values from decryptedData
    return {
      props: {
        url: jsonObject.url,
        id: jsonObject?.id,
        mail: jsonObject?.mail,
        r: jsonObject?.r,
        mi: jsonObject?.mi,
        tenant: jsonObject?.tenant,
      },
    };
  }
}

// export async function getServerSideProps({ query, res, req }) {
//   const { url, id, mail, r, mi } = query;
//   console.log("queryy", query);
//   const safeMi = mi ?? null;
//   return {
//     props: { url: url, id: id, mail: mail, r: r, mi: safeMi },
//   };
// }