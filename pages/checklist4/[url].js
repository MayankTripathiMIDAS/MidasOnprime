import InputField from "../../components/InputField";
import moment from "moment-timezone";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { Form, Formik, FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { addDays } from "date-fns";
import { DateRange, DateRangePicker } from "react-date-range";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import swal from "sweetalert";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { host } from "../../static";
import requestIp from "request-ip";
import { NextApiRequest, NextApiResponse } from "next";
import { id } from "date-fns/locale";
import CryptoJS from "crypto-js";
import NotRequiredInputField from "@/components/NotRequiredInputField";

const Url = ({ url, id, mail, r, mi, tenant }) => {
  const router = useRouter();
  const [active, setActive] = useState(false);
  // console.log("here", active);
  const [speciality, setSpeciality] = useState("");
  const [totalExperience, setTotalExperience] = useState("");
  const [token, setToken] = useState("");
  const [html, setHTML] = useState("");
  const [dob, setDob] = useState(false);
  const [sign, setSign] = useState("");
  const [rtrSign, setRtrSign] = useState("");
  const [rtrData, setRtrData] = useState("");
  const [dateofBirth, setDateOfBirth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState("");
  const [data, setData] = useState([]);
  const [senderMail, setSenderMail] = useState("");
  const [candidateData, setCandidateData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    phoneno: "",
    otherphone: "",
    email: "",
    dob: "",
    ssn: "",
    address: "",
  });
  const [showDate, setShowDate] = useState(false);
  const tokenRef = useRef("");
  const [references, setReferences] = useState([
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
      otherphone: "",
      email: "",
      dob: "",
      ssn: "",
      address: "",
    },
    validationSchema: Yup.object({
      firstname: Yup.string()
        .required("First name is required")
        .test(
          "no-special-chars",
          "Special characters and numbers are not allowed",
          (value) => {
            return /^[a-zA-Z]+$/.test(value || "");
          },
        )
        .test("no-leading-space", "Cannot start with a space", (value) => {
          return value ? !value.startsWith(" ") : true;
        }),

      lastname: Yup.string()
        .required("Last name is required")
        .test(
          "no-special-chars",
          "Special characters and numbers are not allowed",
          (value) => {
            return /^[a-zA-Z]+$/.test(value || "");
          },
        )
        .test("no-leading-space", "Cannot start with a space", (value) => {
          return value ? !value.startsWith(" ") : true;
        }),
      phoneno: Yup.string()
        .required("Phone number is required")
        .matches(/^\+1\d{10}$/, "Please enter a 10-digit number)")
        .transform((value) => {
          // Auto-correct partial entries
          if (!value) return value;
          const digits = value.replace(/\D/g, "");
          return `+1${digits.substring(1, 11)}`; // Force +1 + 10 digits
        }),
      ssn: Yup.string()
        .matches(/^[0-9]+$/, "Please enter only numbers")
        .required("SSN is required")
        .min(4, "Enter Last 4 Digits only")
        .max(4, "Enter Last 4 Digits only"),
      email: Yup.string()
        .required("Email is required*")
        .matches(/^\S*$/, "Email cannot contain spaces")
        .matches(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          "Please enter a valid email address ",
        ),
      address: Yup.string().required("Address is required"),
      dob: Yup.string()
        .required("Date of Birth is required")
        .test(
          "valid-format",
          "Date must be in MM/DD/YYYY format",
          function (value) {
            if (!value) return false;

            // Try parsing as MM/DD/YYYY
            const dateParts = value.split("/");
            if (dateParts.length !== 3) return false;

            const month = parseInt(dateParts[0], 10);
            const day = parseInt(dateParts[1], 10);
            const year = parseInt(dateParts[2], 10);

            // Check if it's a valid date
            const date = new Date(year, month - 1, day);
            return (
              date.getFullYear() === year &&
              date.getMonth() === month - 1 &&
              date.getDate() === day
            );
          },
        )
        .test(
          "not-in-future",
          "Date of Birth cannot be a future date",
          function (value) {
            if (!value) return false;

            const dateParts = value.split("/");
            if (dateParts.length !== 3) return false;

            const month = parseInt(dateParts[0], 10);
            const day = parseInt(dateParts[1], 10);
            const year = parseInt(dateParts[2], 10);

            const selectedDate = new Date(year, month - 1, day);
            const currentDate = new Date();
            return selectedDate <= currentDate;
          },
        ),

      // address: Yup.string().required("Required"),
    }),
    onSubmit: (values) => {
      submitData(null, values);
    },
  });

  var userEmail = mail;

  const secretKey = "secretHello";

  function decryptURL(encryptedURL, secretKey) {
    const decodedURL = decodeURIComponent(encryptedURL);
    const encryptedBase64 = Buffer.from(decodedURL, "base64").toString();
    const bytes = CryptoJS.AES.decrypt(encryptedBase64, secretKey);
    const decryptedURL = bytes.toString(CryptoJS.enc.Utf8);
    console.log("rrr", decryptedURL);
    return decryptedURL;
  }
  const decryptedMail = decryptURL(userEmail, secretKey);
  console.log("decryptedMail", decryptedMail);
  

  const rtrDetails = () => {
    const options = {
      method: "GET",
      headers: {
        accept: "*/*",
        "X-Tenant": tenant,
      },
    };

    const url = mi
      ? `https://tenantapi.theartemis.ai/api/v1/email/getLinksById/${mi}`
      : `https://tenantapi.theartemis.ai/api/v1/email/getAllLinks/${decryptedMail}`;

    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(response, "response");
        return response.json();
      })
      .then((responseData) => {
        setRtrData(responseData[0] || responseData);
        setCandidateData(responseData[0] || responseData);
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setRtrData("");
      });
  };
  const handleCandidateChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.replace("rtr", "");

    // Fields that should only accept letters
    const nameFields = ["firstName", "lastName"];

    if (nameFields.includes(fieldName)) {
      // Allow only letters (a-z, A-Z)
      if (/^[a-zA-Z]*$/.test(value)) {
        setCandidateData((prevData) => ({
          ...prevData,
          [fieldName]: value,
        }));
      }
    } else {
      // For other fields, update normally
      setCandidateData((prevData) => ({
        ...prevData,
        [fieldName]: value,
      }));
    }
  };

  // const rtrDetails = () => {
  //   const options = {
  //     method: "GET",
  //     headers: {
  //       "User-Agent": "insomnia/8.6.1",
  //     },
  //   };
  //   fetch(
  //     `https://api.midastech.org/api/email/getAllLinks/${decryptedMail}`,
  //     options
  //   )
  //     .then((response) => {
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! Status: ${response.status}`);
  //       }
  //       return response.json();
  //     })
  //     .then((responseData) => {
  //       setRtrData(responseData[0]);
  //       // Process the response data here
  //     })
  //     .catch((error) => {
  //       console.error("Fetch error:", error);
  //       // Handle error cases here
  //     });
  // };

  // console.log("local", localStorage.getItem("authUser"));

  const newDate = moment().tz("US/Central").format("MM-DD-YYYY");

  const from =
    state[0].startDate === ""
      ? ""
      : moment(state[0].startDate).format("MM/DD/YYYY");
  const to =
    state[0].endDate === ""
      ? ""
      : moment(state[0].endDate).format("MM/DD/YYYY");
  // function renderTable(datas, title) {
  //   // Start building the table markup

  //   let tableHTML = `<div class="container" style="width: 400px; text-align: center; margin-top: 20px;">`;
  //   tableHTML = `<div class="row">`;
  //   tableHTML = `<div  class="col-md-6">`;
  //   tableHTML = `<form>`;
  //   tableHTML = `<table class="table table-bordered" style="width: 50vh; text-align: center; margin-left:160px; position: relative">`;

  //   tableHTML += `<thead class="health-table" style="position: relative">`;
  //   tableHTML += "<tr>";

  //   tableHTML += `<th class="health-row" colspan="4">${title}</th>`;

  //   tableHTML += `<th  class="health-row small" scope="col" style="width: 100px; text-align: center;">1</th>`;
  //   tableHTML += `<th  class="health-row small" scope="col" style="width: 100px; text-align: center;">2</th>`;
  //   tableHTML += `<th  class="health-row small" scope="col" style="width: 100px; text-align: center;">3</th>`;
  //   tableHTML += `<th  class="health-row small" scope="col" style="width: 100px; text-align: center;">4</th>`;

  //   tableHTML += "</tr>";
  //   tableHTML += "</thead>";

  //   datas.map((ite, index) => {
  //     tableHTML += "<tbody>";
  //     tableHTML += "<tr>";

  //     tableHTML += `<th class="table-data" colspan="4" scope="row">${ite.name}</th>`;

  //     tableHTML += `<td class="table-data">${ite.value1 === "checked"
  //       ? `<div style = "height: 15px; width: 15px; background: #0f875b;  border-radius: 50px; margin-left: 30px" class ="circle-box"></div>`
  //       : `<input class="form-check-input" type="radio" name=${ite.name}
  //                       required disabled > `
  //       } </td>`;
  //     tableHTML += `<td class="table-data">${ite.value2 === "checked"
  //       ? `<div style = "height: 15px; width: 15px; background: #0f875b;  border-radius: 50px; margin-left: 30px" class ="circle-box"></div>`
  //       : `<input class="form-check-input" type="radio" name=${ite.name}
  //                       required id="flexRadioDefault" disabled >`
  //       } </td>`;
  //     tableHTML += `<td class="table-data">${ite.value3 === "checked"
  //       ? `<div style = "height: 15px; width: 15px; background: #0f875b;  border-radius: 50px; margin-left: 30px" class ="circle-box"></div>`
  //       : `<input class="form-check-input" type="radio" name=${ite.name}
  //                       required id="flexRadioDefault" disabled >`
  //       } </td>`;
  //     tableHTML += `<td class="table-data">${ite.value4 === "checked"
  //       ? `<div style = "height: 15px; width: 15px; background: #0f875b;  border-radius: 50px; margin-left: 30px" class ="circle-box"></div>`
  //       : `<input class="form-check-input" type="radio" name=${ite.name}
  //                       required id="flexRadioDefault" disabled >`
  //       } </td>`;
  //     tableHTML += "</tbody>";
  //   });

  //   // Generate the table header
  //   // Generate the table body
  //   // Finish the table markup

  //   tableHTML += "</table>";
  //   tableHTML += "</form>";

  //   tableHTML += "</div>";
  //   tableHTML += "</div>";
  //   tableHTML += "</div>";

  //   return tableHTML;
  // }
  //   function renderTable(datas, title) {
  //     // Start building the table markup
  //     let tableHTML = `
  //     <div class="skills-table-container">
  //       <h3 class="section-title" style="margin-top: 10px; font-size: 16px; width:50%">${title}</h3>
  //       <table class="skills-table">
  //         <thead>
  //           <tr class="tr-class">
  //             <th class="rating-cell">1</th>
  //             <th class="rating-cell">2</th>
  //             <th class="rating-cell">3</th>
  //             <th class="rating-cell">4</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //   `;

  //     // Generate table rows
  //     datas.forEach((ite, index) => {
  //       // Check if this is a category/subcategory
  //       const isCategory =
  //         ite.subcat || (ite.name && ite.name.toUpperCase() === ite.name);
  //        console.log("isCategory", isCategory, ite);
  //       if (isCategory) {
  //         tableHTML += `
  //         <tr class="skill-category">
  //           <td colspan="5" style="font-weight: bold; padding: 15px;">
  //             ${ite.subcat || ite.name}
  //           </td>
  //         </tr>
  //       `;
  //       } else {
  //         // Determine which rating was selected
  //         let ratingSelected = 0;
  //         if (ite.value1 === "checked") ratingSelected = 1;
  //         else if (ite.value2 === "checked") ratingSelected = 2;
  //         else if (ite.value3 === "checked") ratingSelected = 3;
  //         else if (ite.value4 === "checked") ratingSelected = 4;

  //         tableHTML += `
  //         <tr>
  //           <td class="skill-name" style="padding: 12px 15px;">${ite.name}</td>
  //       `;

  //         // Generate rating cells
  //         for (let i = 1; i <= 4; i++) {
  //           tableHTML += `
  //           <td class="rating-cell">
  //             ${
  //               ratingSelected === i
  //                 ? '<div class="selected-dot"></div>'
  //                 : '<div class="checkbox"></div>'
  //             }
  //           </td>
  //         `;
  //         }

  //         tableHTML += `</tr>`;
  //       }
  //     });

  //     // Close the table
  //     tableHTML += `
  //         </tbody>
  //       </table>
  //     </div>
  //   `;
  // console.log("tableHTML", tableHTML);
  //     return tableHTML;
  //   }
  // function renderTable(datas, title) {
  //   // Start building the table markup
  //   let tableHTML = `
  //   <div class="skills-table-container">
  //     <table class="skills-table">
  //       <thead>
  //         <tr>
  //           <!-- Category title integrated as the first th -->
  //           <th class="section-title" style="text-align:left; font-size: 16px;">${title}</th>
  //           <th class="rating-cell">1</th>
  //           <th class="rating-cell">2</th>
  //           <th class="rating-cell">3</th>
  //           <th class="rating-cell">4</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  // `;

  //   // Generate table rows
  //   datas.forEach((ite) => {
  //     // Check if this is a subcategory
  //     const isCategory =
  //       ite.subcat || (ite.name && ite.name.toUpperCase() === ite.name);

  //     if (isCategory) {
  //       // Subcategory row spans all columns
  //       tableHTML += `
  //       <tr class="skill-category">
  //         <td colspan="5" style="font-weight: bold; padding: 12px 15px; text-align:left;">
  //           ${ite.subcat || ite.name}
  //         </td>
  //       </tr>
  //     `;
  //     } else {
  //       // Determine which rating was selected
  //       let ratingSelected = 0;
  //       if (ite.value1 === "checked") ratingSelected = 1;
  //       else if (ite.value2 === "checked") ratingSelected = 2;
  //       else if (ite.value3 === "checked") ratingSelected = 3;
  //       else if (ite.value4 === "checked") ratingSelected = 4;

  //       tableHTML += `
  //       <tr>
  //         <td class="skill-name" style="padding: 12px 15px;">${ite.name}</td>
  //     `;

  //       // Generate rating cells
  //       for (let i = 1; i <= 4; i++) {
  //         tableHTML += `
  //         <td class="rating-cell">
  //           ${
  //             ratingSelected === i
  //               ? '<div class="selected-dot"></div>'
  //               : '<div class="checkbox"></div>'
  //           }
  //         </td>
  //       `;
  //       }

  //       tableHTML += `</tr>`;
  //     }
  //   });

  //   // Close the table
  //   tableHTML += `
  //       </tbody>
  //     </table>
  //   </div>
  // `;

  //   return tableHTML;
  // }
  // function renderTable(datas, title) {
  //   // Start building the table markup
  //   let tableHTML = `
  // <div class="skills-table-container">
  //   <table class="skills-table">
  //     <thead>
  //       <tr>
  //         <!-- Category title integrated as the first th -->
  //         <th class="section-title" style="text-align:left; font-size: 16px;">${title}</th>
  //         <th class="rating-cell">1</th>
  //         <th class="rating-cell">2</th>
  //         <th class="rating-cell">3</th>
  //         <th class="rating-cell">4</th>
  //       </tr>
  //     </thead>
  //     <tbody>
  // `;

  //   // Generate table rows
  //   datas.forEach((ite) => {
  //     // Check if this is a subcategory
  //     // Keep original logic but add specific checks for CVA and COPD
  //     const isCategory =
  //       ite.subcat || (ite.name && ite.name.toUpperCase() === ite.name);

  //     // Specific check for known medical subcategories that should be treated as headers
  //     const medicalSubcategories = ["CVA", "COPD"];
  //     const isMedicalSubcategory = medicalSubcategories.includes(ite.name);

  //     // Check if it's a subcategory header (no rating values)
  //     const hasNoRatings =
  //       !ite.value1 && !ite.value2 && !ite.value3 && !ite.value4;

  //     // Final decision: treat as category if it's a known medical subcategory OR
  //     // matches original logic AND has no ratings
  //     const treatAsCategory =
  //       isMedicalSubcategory || (isCategory && hasNoRatings);

  //     if (treatAsCategory) {
  //       // Subcategory row spans all columns
  //       tableHTML += `
  //     <tr class="skill-category">
  //       <td colspan="5" style="font-weight: bold; padding: 12px 15px; text-align:left;">
  //         ${ite.subcat || ite.name}
  //       </td>
  //     </tr>
  //   `;
  //     } else {
  //       // Determine which rating was selected
  //       let ratingSelected = 0;
  //       if (ite.value1 === "checked") ratingSelected = 1;
  //       else if (ite.value2 === "checked") ratingSelected = 2;
  //       else if (ite.value3 === "checked") ratingSelected = 3;
  //       else if (ite.value4 === "checked") ratingSelected = 4;

  //       tableHTML += `
  //     <tr>
  //       <td class="skill-name" style="padding: 12px 15px;">${ite.name}</td>
  //     `;

  //       // Generate rating cells
  //       for (let i = 1; i <= 4; i++) {
  //         tableHTML += `
  //       <td class="rating-cell">
  //         ${
  //           ratingSelected === i
  //             ? '<div class="selected-dot"></div>'
  //             : '<div class="checkbox"></div>'
  //         }
  //       </td>
  //     `;
  //       }

  //       tableHTML += `</tr>`;
  //     }
  //   });

  //   // Close the table
  //   tableHTML += `
  //     </tbody>
  //   </table>
  // </div>
  // `;

  //   return tableHTML;
  // }
  // function renderTable(datas, title) {
  //   // Start building the table markup
  //   let tableHTML = `
  // <div class="skills-table-container">
  //   <table class="skills-table">
  //     <thead>
  //       <tr>
  //         <!-- Category title integrated as the first th -->
  //         <th class="section-title" style="text-align:left; font-size: 16px;">${title}</th>
  //         <th class="rating-cell">1</th>
  //         <th class="rating-cell">2</th>
  //         <th class="rating-cell">3</th>
  //         <th class="rating-cell">4</th>
  //       </tr>
  //     </thead>
  //     <tbody>
  // `;

  //   // Generate table rows
  //   datas.forEach((ite) => {
  //     // Check if this is a subcategory
  //     const isCategory =
  //       ite.subcat || (ite.name && ite.name.toUpperCase() === ite.name);

  //     if (isCategory) {
  //       // Subcategory row - but we need to show empty cells like in the form
  //       tableHTML += `
  //     <tr>
  //       <td class="skill-name" style="padding: 12px 15px; font-weight: bold; background: #f1f7fa; color: #1a5f7a;">
  //         ${ite.subcat || ite.name}
  //       </td>
  //     `;

  //       // Generate EMPTY cells for subcategories (just like in your form UI)
  //       for (let i = 1; i <= 4; i++) {
  //         tableHTML += `
  //       <td class="rating-cell">
  //         <div class="checkbox"></div>
  //       </td>
  //     `;
  //       }

  //       tableHTML += `</tr>`;
  //     } else {
  //       // Determine which rating was selected
  //       let ratingSelected = 0;
  //       if (ite.value1 === "checked") ratingSelected = 1;
  //       else if (ite.value2 === "checked") ratingSelected = 2;
  //       else if (ite.value3 === "checked") ratingSelected = 3;
  //       else if (ite.value4 === "checked") ratingSelected = 4;

  //       tableHTML += `
  //     <tr>
  //       <td class="skill-name" style="padding: 12px 15px;">${ite.name}</td>
  //     `;

  //       // Generate rating cells
  //       for (let i = 1; i <= 4; i++) {
  //         tableHTML += `
  //       <td class="rating-cell">
  //         ${
  //           ratingSelected === i
  //             ? '<div class="selected-dot"></div>'
  //             : '<div class="checkbox"></div>'
  //         }
  //       </td>
  //     `;
  //       }

  //       tableHTML += `</tr>`;
  //     }
  //   });

  //   // Close the table
  //   tableHTML += `
  //     </tbody>
  //   </table>
  // </div>
  // `;

  //   return tableHTML;
  // }
 function renderTable(datas, title) {
  // Start building the table markup
  let tableHTML = `
  <div class="skills-table-container">
    <table class="skills-table">
      <thead>
        <tr>
          <th class="section-title" style="text-align:left; font-size: 16px;">${title}</th>
          <th class="rating-cell">1</th>
          <th class="rating-cell">2</th>
          <th class="rating-cell">3</th>
          <th class="rating-cell">4</th>
        </tr>
      </thead>
      <tbody>
  `;

  // Generate table rows
  datas.forEach((ite) => {
    // DEBUG: Check what the item looks like
    console.log(`Item: "${ite.name}"`, {
      isAllCaps: ite.name && ite.name.toUpperCase() === ite.name,
      hasValues: ite.value1 || ite.value2 || ite.value3 || ite.value4,
      values: {v1: ite.value1, v2: ite.value2, v3: ite.value3, v4: ite.value4}
    });

    // FIX: "CVA" and "COPD" should NOT be treated as categories - they are SKILLS
    // They should have rating selections like other skills
    
    // Determine which rating was selected (for ALL items including CVA/COPD)
    let ratingSelected = 0;
    if (ite.value1 === "checked") ratingSelected = 1;
    else if (ite.value2 === "checked") ratingSelected = 2;
    else if (ite.value3 === "checked") ratingSelected = 3;
    else if (ite.value4 === "checked") ratingSelected = 4;

    // Check if this is ACTUALLY a category (subcat property exists AND it has no values)
    const isActualCategory = ite.subcat && !ite.value1 && !ite.value2 && !ite.value3 && !ite.value4;

    if (isActualCategory) {
      // This is a true category header (with subcat property and no values)
      tableHTML += `
      <tr class="skill-category">
        <td colspan="5" style="font-weight: bold; padding: 12px 15px; text-align:left; background: #f1f7fa; color: #1a5f7a;">
          ${ite.subcat}
        </td>
      </tr>
    `;
    } else {
      // This is a regular skill item (including CVA, COPD, etc.)
      // They should have rating selections
      tableHTML += `
      <tr>
        <td class="skill-name" style="padding: 12px 15px;">${ite.name}</td>
      `;

      // Generate rating cells
      for (let i = 1; i <= 4; i++) {
        tableHTML += `
        <td class="rating-cell">
          ${
            ratingSelected === i
              ? '<div class="selected-dot"></div>'
              : '<div class="checkbox"></div>'
          }
        </td>
      `;
      }

      tableHTML += `</tr>`;
    }
  });

  // Close the table
  tableHTML += `
      </tbody>
    </table>
  </div>
  `;

  return tableHTML;
}
  const ABBREVIATIONS = new Set([
    "rn",
    "lpn",
    "cna",
    "icu",
    "nicu",
    "picu",
    "cvicu",
    "cvor",
    "pacu",
    "er",
    "or",
    "pct",
    "ltc",
    "ltac",
    "pcu",
    "ekg",
    "eeg",
    "ct",
    "mri",
    "gi",
    "mds",
  ]);

  function formatChecklistTitle(value) {
    return value
      .replace(/[_]/g, "-") // normalize underscores
      .replace(/&/g, "and") // replace &
      .split("-") // split words
      .map((word) => {
        if (!word) return "";

        const lower = word.toLowerCase();

        // Abbreviation → FULL CAPS
        if (ABBREVIATIONS.has(lower)) {
          return lower.toUpperCase();
        }

        // Normal word → Capitalized
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(" ");
  }

  const capitalized = formatChecklistTitle(url);

  const date = `${from}-${to}`;

  const StringDate = JSON.stringify(date);

  const candidate = candidateData;
  const auth = token;
  const candidateSpeciality = speciality;
  const experience = totalExperience;

  const checkliststate = states;

  const reference = references;

  const createCandidate = async (candidate, values, auth, experience) => {
    // Format the phone number to remove formatting
    const formatPhoneForAPI = (phone) => {
      if (!phone) return "";
      // Remove all non-digit characters except +
      const cleaned = phone.replace(/\D/g, "");
      return cleaned.startsWith("1") ? `+${cleaned}` : `+1${cleaned}`;
    };

    // Determine which data source to use
    const useCandidateData =
      candidateData && candidateData.jobTitle && candidateData.jobTitle !== "";

    console.log("Data source check:", {
      useCandidateData,
      candidateData: candidateData,
      jobTitle: candidateData?.jobTitle,
      formValues: values,
    });

    const email = useCandidateData ? candidateData.email : values.email;
    const lastName = useCandidateData
      ? candidateData.lastName
      : values.lastname;
    const firstName = useCandidateData
      ? candidateData.firstName
      : values.firstname;
    const phone = useCandidateData ? candidateData.phone : values.phoneno;
    const otherPhone = useCandidateData
      ? candidateData.otherphone
      : values.otherphone;
    const name = useCandidateData
      ? `${candidateData.firstName} ${candidateData.lastName}`
      : `${values.firstname} ${values.lastname}`;

    console.log("Resolved values:", {
      email,
      lastName,
      firstName,
      phone,
      name,
      speciality,
      totalExperience,
    });

    // Validate required fields
    if (!email || !name.trim() || !phone) {
      swal({
        title: "Missing Information!",
        text: "Please fill in all required fields: Email, Name, and Phone are required.",
        icon: "error",
      });
      return;
    }

    const raw = JSON.stringify({
      active: true,
      source: "Checklist",
      additionalProperties: {},
      certifications: [],
      city: "",
      companiesWorkedAt: [],
      contactTime: "",
      currentCTC: "",
      dateIssued: new Date().toISOString(),
      dateOfBirth: values.dob
        ? new Date(values.dob).toISOString().split("T")[0]
        : "", // Just date part
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
      email: email,
      expirationDate: "",
      experience: [],
      fileHandle: {
        "@microsoft.graph.downloadUrl": "",
        "@odata.context": "",
        cTag: "",
        createdBy: {
          application: {
            displayName: "",
            id: "",
          },
          user: {
            active: true,
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            email: "",
            firstName: "",
            fullName: "",
            id: "",
            isZoomUser: false,
            lastName: "",
            mobileNumber: "",
            password: "",
            profilePicture: "",
            roles: [],
            userType: "EXTERNAL",
          },
        },
        createdDateTime: new Date().toISOString(),
        eTag: "",
        file: {
          hashes: {
            quickXorHash: "",
          },
          mimeType: "",
        },
        fileSystemInfo: {
          createdDateTime: new Date().toISOString(),
          lastModifiedDateTime: new Date().toISOString(),
        },
        id: "",
        lastModifiedBy: {
          application: {
            displayName: "",
            id: "",
          },
          user: {
            active: true,
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            email: "",
            firstName: "",
            fullName: "",
            id: "",
            isZoomUser: false,
            lastName: "",
            mobileNumber: "",
            password: "",
            profilePicture: "",
            roles: [],
            userType: "EXTERNAL",
          },
        },
        lastModifiedDateTime: new Date().toISOString(),
        name: "",
        parentReference: {
          driveId: "",
          driveType: "",
          id: "",
          name: "",
          path: "",
          siteId: "",
        },
        shared: {
          scope: "",
        },
        size: 0,
        webUrl: "",
      },
      fullText: "",
      gender: "",
      hasLicenseInvestigated: false,
      investigationDetails: "",
      issuingState: "",
      last_updated: new Date().toISOString(),
      lastName: lastName,
      license: [],
      licenseNumber: "",
      licensedStates: "",
      licenses: [],
      municipality: "",
      name: name,
      otherPhone: otherPhone,
      phone: phone,
      preferredCities: states && states.length > 0 ? states : [],
      preferredDestinations: "",
      primarySpeciality: speciality || "",
      profession: "",
      regions: "",
      skills: [],
      state: states && states.length > 0 ? states[0] : "",
      totalExp: totalExperience || "",
      travelStatus: "",
      university: [],
      workAuthorization: "",
      zip: "",
    });

    console.log("Sending candidate data:", JSON.parse(raw));

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
        },
      );

      // First check if response is ok
      // if (!response.ok) {
      //   const errorText = await response.text();
      //   console.error("API Error Response:", errorText);

      //   // Try to parse error message if it's JSON
      //   let errorMessage = `HTTP error! status: ${response.status}`;
      //   try {
      //     const errorJson = JSON.parse(errorText);
      //     errorMessage = errorJson.message || errorMessage;
      //   } catch (e) {
      //     // If not JSON, use the text as is
      //     errorMessage = errorText || errorMessage;
      //   }

      //   throw new Error(errorMessage);
      // }

      // Then try to parse as JSON
      const result = await response.json();
      console.log("API Success Response:", result);

      swal({
        title: "Success!",
        text: "Response submitted successfully.",
        icon: "success",
        timer: 2000,
        buttons: false,
      });
    } catch (error) {
      console.error("Network Error:", error);
      swal({
        title: "API Error",
        text: error.message,
        icon: "error",
      });
    }
  };

  const createCandidatebyFirstReference = async (
    reference,
    candidate,
    values,
    auth,
    experience,
    candidateSpeciality,
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
          },
        );

        const result = await response.json();

        if (response.ok) {
          swal({
            title: "Success!",
            text: "Your data has been saved successfully.",
            icon: "success",
            timer: 2000,
            buttons: false,
          });
        } else {
          swal({
            title: "Error!",
            text: "Failed to save data.",
            icon: "error",
          });
        }
      } catch (error) {
        swal({
          title: "Network Error",
          text: error.message,
          icon: "error",
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
    candidateSpeciality,
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
          },
        );

        const result = await response.json();

        if (response.ok) {
          swal({
            title: "Success!",
            text: "Your data has been saved successfully.",
            icon: "success",
            timer: 2000,
            buttons: false,
          });
        } else {
          swal({
            title: "Error!",
            text: "Failed to save data.",
            icon: "error",
          });
        }
      } catch (error) {
        swal({
          title: "Network Error",
          text: error.message,
          icon: "error",
        });
      }
    }
  };

  function formatToUSPhoneNumber(phone) {
    // Remove any non-numeric characters
    const cleaned = ("" + phone).replace(/\D/g, "");

    // Format based on the length of the cleaned number
    if (cleaned.length === 10) {
      // Format as (XXX) XXX-XXXX
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
      )}`;
    } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
      // Format as +1 (XXX) XXX-XXXX
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(
        4,
        7,
      )}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 7) {
      // Format as XXX-XXXX for 7-digit numbers
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }

    // Return the original input if it doesn't match common US phone number lengths
    return phone;
  }

  const submitData = (e, values, candidateData, token) => {
    // console.log("values", values, candidateData);
    // createCandidate(values, token);
    e.preventDefault();
    setFormValues(values);
    console.log("========== SUBMIT DATA DEBUG ==========");
    console.log("r flag:", r);
    console.log("candidateData:", candidateData);
    console.log("values:", values);
    console.log("rtrData:", rtrData);
    console.log("=======================================");

    const useCandidateData = r === "ortr" || r === "wrtr";

    // Use candidateData for RTR forms, values for regular checklist forms
    // Add safety checks to prevent undefined errors
    const firstname =
      useCandidateData && candidateData?.firstName
        ? candidateData.firstName
        : values.firstname || "";

    const lastname =
      useCandidateData && candidateData?.lastName
        ? candidateData.lastName
        : values.lastname || "";

    const email =
      useCandidateData && candidateData?.email
        ? candidateData.email
        : values.email || "";

    const phoneno =
      useCandidateData && candidateData?.phone
        ? candidateData.phone
        : values.phoneno || "";

    console.log("Using names:", { firstname, lastname, email, phoneno });

    console.log("Submitting data:", values, candidateData);
    console.log("values", values, candidateData);
    createCandidate(candidateData, values, token, totalExperience);
    createCandidatebyFirstReference(
      references,
      candidateData,
      values,
      token,
      totalExperience,
      speciality,
    );
    createCandidatebySecondReference(
      references,
      candidateData,
      values,
      token,
      totalExperience,
      speciality,
    );
    const dateofbith = moment(values.dob).format("MM/DD/YYYY");
    // console.log(values.dob);
    const inputDate = JSON.stringify(dateofbith);
    e.preventDefault();
    const th =
      data === undefined || data.length === 0
        ? "WAIT"
        : data.list.map((item, index) => {
            const { items, title } = item;
            return { items, title };
          });
    console.log("thth", th);

    const Html = `<!DOCTYPE html>
<html>

<head>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;background:#f8f9fa;padding:20px}.container{max-width:1200px;margin:0 auto}.document-header{text-align:center;background:linear-gradient(135deg,#1a5f7a,#2c3e50);color:#fff;padding:25px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,.1);margin-bottom:20px}.document-header h1{font-size:2.5rem;margin-bottom:10px;letter-spacing:1px;color:#000}p{color:#000}.content-card{background:#fff;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,.08);padding:30px;margin-bottom:20px}.form-section{margin-bottom:40px}.section-title{font-size:1.5rem;color:#2c3e50;border-bottom:2px solid #1a5f7a;padding-bottom:10px;margin-bottom:25px;font-weight:600}.form-row{display:flex;flex-wrap:wrap;gap:20px;margin-bottom:20px}.form-group{flex:1;min-width:250px}.form-group label{display:block;font-weight:600;margin-bottom:8px;color:#2c3e50}.form-control{width:100%;padding:12px 15px;border:1px solid #ddd;border-radius:6px;background:#f9f9f9;font-size:1rem}tr, td, th, thead, tbody, table,.skills-table-container{overflow-x:auto;margin-bottom:30px; page-break-inside: avoid; break-inside: avoid;}.skills-table{width:100%;border-collapse:collapse;margin-top:20px;font-size:.95rem;border:1px solid #000}.skills-table th,.skills-table td{border:1px solid #000;padding:12px 14px;text-align:center;background:#fff}.skills-table th{background:#ffff00;color:#000;font-weight:700;font-size:1.05rem;padding:8px 10px;text-align:center}.skills-table th.rating-cell{font-size:1.2rem;font-weight:700}.skills-table th:first-child{width:40%;font-size:1.3rem;font-weight:400}.rating-cell{width:120px}.skill-name{text-align:left;font-weight:400;color:#000;font-size:1.05rem}.checkbox{display:inline-block;width:16px;height:16px;border:1px solid #000;border-radius:50%;background:#fff;margin:auto}.selected-dot{display:inline-block;width:16px;height:16px;border-radius:50%;background:#2ecc71;margin:auto}.skill-category{background:#f1f7fa;font-weight:600;color:#1a5f7a;font-size:1.1rem}.instructions{background:#f0f8ff;border-left:4px solid #1a5f7a;padding:20px;margin:30px 0;border-radius:0 6px 6px 0}.instructions p{margin-bottom:10px}.rating-scale{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:15px}.rating-item{flex:1;min-width:200px;background:#fff;padding:12px;border-radius:6px;border:1px solid #e0e0e0;text-align:center}.rating-item span{font-weight:600;color:#1a5f7a}@media(max-width:768px){.form-row{flex-direction:column;gap:15px}.form-group{min-width:100%}.rating-scale{flex-direction:column}.skills-table th,.skills-table td{padding:10px 10px;font-size:.9rem}.skills-table-container, table, tr { page-break-inside:auto; break-inside:auto; } tr, td, th { page-break-inside:avoid; break-inside:avoid; } thead{display:table-header-group;}.rating-cell{width:90px}.skills-table th:first-child{width:55%}}
    </style>
</head>

<body>
    <div class=\ "container\">
        <div class=\ "document-header\">
            <h1>${capitalized} Skills Checklist</h1>
            <p>Professional Skills Assessment Form</p>
        </div>
        <div class=\ "content-card\">
            <div class=\ "form-section\">
                <h2 class=\ "section-title\">Personal Information</h2>
                <div class=\ "form-row\">
                    <div class=\ "form-group\">
                        <label>First Name:</label>
                        <div class=\ "form-control\">${values.firstname}</div>
                    </div>
                    <div class=\ "form-group\">
                        <label>Last Name:</label>
                        <div class=\ "form-control\">${values.lastname}</div>
                    </div>
                    <div class=\ "form-group\">
                        <label>Phone Number:</label>
                        <div class=\ "form-control\">${values.phoneno}</div>
                    </div>
                </div>
                <div class=\ "form-row\">
                    <div class=\ "form-group\">
                        <label>Email:</label>
                        <div class=\ "form-control\">${values.email}</div>
                    </div>
                    <div class=\ "form-group\">
                        <label>Date of Birth:</label>
                        <div class=\ "form-control\">${inputDate === "Invalid date" ? "" : inputDate}</div>
                    </div>
                    <div class=\ "form-group\">
                        <label>Last four SSN digits:</label>
                        <div class=\ "form-control\">${values.ssn}</div>
                    </div>
                </div>
                <div class=\ "form-row\">
                    <div class=\ "form-group\">
                        <label>Request Time Off:</label>
                        <div class=\ "form-control\">${
                          StringDate == "Invalid date-Invalid date"
                            ? ""
                            : StringDate
                        }</div>
                    </div>
                    <div class=\ "form-group\" style=\ "flex:2;\">
                        <label>Address:</label>
                        <div class=\ "form-control\">${values.address}</div>
                    </div>
                </div>
                <div class=\ "form-row\">
                    <div class=\ "form-group\">
                        <label>Referrer's Name:</label>
                        <div class=\ "form-control\">${references[0].name}</div>
                    </div>
                    <div class=\ "form-group\">
                        <label>Referrer's Phone:</label>
                        <div class=\ "form-control\">${
                          references[0].phoneno
                        }</div>
                    </div>
                    <div class=\ "form-group\">
                        <label>Referrer's Email:</label>
                        <div class=\ "form-control\">${
                          references[0].email
                        }</div>
                    </div>
                </div>
                <div class=\ "form-row\">
                    <div class=\ "form-group\">
                        <label>Referee's Name:</label>
                        <div class=\ "form-control\">${references[1].name}</div>
                    </div>
                    <div class=\ "form-group\">
                        <label>Referee's Phone:</label>
                        <div class=\ "form-control\">${
                          references[1].phoneno
                        }</div>
                    </div>
                    <div class=\ "form-group\">
                        <label>Referee's Email:</label>
                        <div class=\ "form-control\">${
                          references[1].email
                        }</div>
                    </div>
                </div>
            </div>
            <div class=\ "instructions\">
                <p><strong>Instructions:</strong> This checklist is meant to serve as a general guideline for our client facilities as to the level of your skills within your nursing specialty. Please use the scale below to describe your experience/expertise
                    in each area listed below.</p>
                <div class=\ "rating-scale\">
                    <div class=\ "rating-item\"><span>1</span> = No Experience</div>
                    <div class=\ "rating-item\"><span>2</span> = Need Training</div>
                    <div class=\ "rating-item\"><span>3</span> = Able to perform with supervision</div>
                    <div class=\ "rating-item\"><span>4</span> = Able to perform independently</div>
                </div>
            </div>
                    <h2 class=\ "section-title\">Skills Assessment</h2>
  
     <div class="content-card">
  
  <div class="skills-assessment-section">
  ${
    th === undefined || th === "Wait"
      ? "<p>No skill data available</p>"
      : th.map((item, index) => renderTable(item.items, item.title)).join("")
  }
  </div>
</div>
        </div>
    </div>
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

    const RTRHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        /* CSS from first HTML template */
        *{margin:0;padding:0;box-sizing:border-box;}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;line-height:1.6;color:#333;background-color:#f8f9fa;padding:20px;}.container{max-width:1200px;margin:0 auto;}.document-header{text-align:center;color:#222529;background:linear-gradient(135deg,#1a5f7a,#2c3e50);color:white;padding:25px;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.1);margin-bottom:20px;}.document-header h1{font-size:2.5rem;margin-bottom:10px;letter-spacing:1px;color:#000;} p{color:#000;}.content-card{background-color:white;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.08);padding:30px;margin-bottom:20px;}.form-section{margin-bottom:40px;}.section-title{font-size:1.5rem;color:#2c3e50;padding-bottom:10px;margin-bottom:25px;font-weight:600;}.form-row{display:flex;flex-wrap:wrap;margin-bottom:20px;gap:20px;}.form-group{flex:1;min-width:250px;}.form-group label{display:block;font-weight:600;margin-bottom:8px;color:#2c3e50;}.form-control{width:100%;padding:12px 15px;border:1px solid #ddd;border-radius:6px;background-color:#f9f9f9;font-size:1rem;transition:border-color 0.3s,box-shadow 0.3s;}.skills-table-container{overflow-x:auto;margin-bottom:30px;}.skills-table{width:100%;border-collapse:collapse;margin-top:20px;font-size:0.95rem;}.skills-table th{background-color:#2c3e50;color:white;padding:15px;text-align:center;font-weight:600;border-right:1px solid #3a506b;}.skills-table th:first-child{border-top-left-radius:8px;}.skills-table th:last-child{border-top-right-radius:8px;}.skills-table td{padding:12px 15px;border-bottom:1px solid #eee;}.skill-name{font-weight:100;color:#4e5154;}.skill-category{background-color:#f1f7fa;font-weight:600;color:#1a5f7a;font-size:1.1rem;}.rating-cell{text-align:center;width:70px;} .selected-dot{display:inline-block;width:18px;height:18px;background-color:#2ecc71;border-radius:50%;box-shadow:0 2px 4px rgba(46,204,113,0.3);}.checkbox{display:inline-block;width:18px;height:18px;border:1px solid #ddd;border-radius:3px;background-color:white;}.instructions{background-color:#f0f8ff;border-left:4px solid #1a5f7a;padding:20px;margin:30px 0;border-radius:0 6px 6px 0;}.instructions p{margin-bottom:10px;}.rating-scale{display:flex;justify-content:space-between;margin-top:15px;flex-wrap:wrap;gap:10px;}.rating-item{flex:1;min-width:200px;background-color:white;padding:12px;border-radius:6px;border:1px solid #e0e0e0;text-align:center;}.rating-item span{font-weight:600;color:#1a5f7a;}@media(max-width:768px){.form-row{flex-direction:column;gap:15px;}.form-group{min-width:100%;}.rating-scale{flex-direction:column;}.skills-table th,.skills-table td{padding:10px 8px;font-size:0.9rem;}}
        
        /* CSS from second HTML template */
        .table-bordered {border: 0.5px solid gray !important;}
        .health-row {padding: 0px 5px !important;background-color: yellow !important;}
        .health-row .small {padding: 0 !important;}
        .table-data {font-weight: 400;font-size: 12px;}
        #text{display : none;}
        
        /* Additional styling for combined layout */
        .page-break {
            page-break-before: always;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px dashed #ccc;
        }
        .rtr-container {
            margin-left: 30px;
            margin-right: 30px;
            margin-top: 50px;
        }
        .website-logo {
            width: 150px;
        }
        .details-spans {
            display: flex;
            margin-bottom: 5px;
        }
        .sign-box-rtr {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>

<body>
    <!-- First HTML content -->
    <div class="container">
        <div class="document-header">
            <h1>${capitalized} SKILLS CHECKLIST</h1>
            <p>Professional Skills Assessment Form</p>
        </div>
        <div class="content-card">
            <div class="form-section">
                <h2 class="section-title">Personal Information</h2>
                <div class="form-row">
                    <div class="form-group">
                        <label>First Name:</label>
                        <div class="form-control">${values.firstname}</div>
                    </div>
                    <div class="form-group">
                        <label>Last Name:</label>
                        <div class="form-control">${values.lastname}</div>
                    </div>
                    <div class="form-group">
                        <label>Phone Number:</label>
                        <div class="form-control">${values.phoneno}</div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Email:</label>
                        <div class="form-control">${values.email}</div>
                    </div>
                    <div class="form-group">
                        <label>Date of Birth:</label>
                        <div class="form-control">${inputDate === "Invalid date" ? "" : inputDate}</div>
                    </div>
                    <div class="form-group">
                        <label>Last four SSN digits:</label>
                        <div class="form-control">${values.ssn}</div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Request Time Off:</label>
                        <div class="form-control">${
                          StringDate == "Invalid date-Invalid date"
                            ? ""
                            : StringDate
                        }</div>
                    </div>
                    <div class="form-group" style="flex:2;">
                        <label>Address:</label>
                        <div class="form-control">${values.address}</div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Referrer's Name:</label>
                        <div class="form-control">${references[0].name}</div>
                    </div>
                    <div class="form-group">
                        <label>Referrer's Phone:</label>
                        <div class="form-control">${references[0].phoneno}</div>
                    </div>
                    <div class="form-group">
                        <label>Referrer's Email:</label>
                        <div class="form-control">${references[0].email}</div>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Referee's Name:</label>
                        <div class="form-control">${references[1].name}</div>
                    </div>
                    <div class="form-group">
                        <label>Referee's Phone:</label>
                        <div class="form-control">${references[1].phoneno}</div>
                    </div>
                    <div class="form-group">
                        <label>Referee's Email:</label>
                        <div class="form-control">${references[1].email}</div>
                    </div>
                </div>
            </div>
            <div class="instructions">
                <p><strong>Instructions:</strong> This checklist is meant to serve as a general guideline for our client facilities as to the level of your skills within your nursing specialty. Please use the scale below to describe your experience/expertise in each area listed below.</p>
                <div class="rating-scale">
                    <div class="rating-item"><span>1</span> = No Experience</div>
                    <div class="rating-item"><span>2</span> = Need Training</div>
                    <div class="rating-item"><span>3</span> = Able to perform with supervision</div>
                    <div class="rating-item"><span>4</span> = Able to perform independently</div>
                </div>
            </div>
            <h2 class="section-title">Skills Assessment</h2>
            <div class="content-card">
                <div class="skills-assessment-section">
                ${
                  th === undefined || th === "Wait"
                    ? "<p>No skill data available</p>"
                    : th
                        .map((item, index) =>
                          renderTable(item.items, item.title),
                        )
                        .join("")
                }
                </div>
            </div>
        </div>
    </div>
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
        <div style="margin-top: 10px; justify-content: space-between; display: flex; flex-direction:row;" class="mx-5">
            <div className="date-box">
                <p>Date signed-:</p>
                <strong>
                    <span>${newDate}</span>
                </strong>
            </div>
            <div className="sign-box" style="display: flex; flex-direction:column;">
                <strong>
                    <span>Signature</span>
                </strong>
                <span class="form-control" style="background-color: #e9ecef; padding: 5px; width: 180px; margin-top: 10px;">${sign}</span>
            </div>
        </div>
    </div>

    <!-- Page break for RTR section -->
    <div class="page-break"></div>
    
    <!-- Second HTML content (RTR) -->
    <div class="rtr-container mt-5 mb-5">
        <img class="website-logo" src="https://midasconsulting.org/images/logo.webp" />
        
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
                        : ""
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
                        ? rtrData.requirements
                            .map((item) => `<li>${item}</li>`)
                            .join("")
                        : ""
                    }
                </ul>
            </div>
            
            <div class="sign-box-rtr">
                <strong><span>Signature</span></strong>
                <span class="form-control" style="background-color: #e9ecef; padding: 5px; width: 180px; margin-top: 10px;">${rtrSign}</span>
                <br />
                <span>Date Signed: ${newDate}</span>
            </div>
        </div>
    </div>
</body>
</html>`;

    const RtrTemp = rtrData === "" ? "" : RTR;

    const formatDob = moment(formValues.dob).format("MM/DD/YYYY");
    const currentToken = tokenRef.current;
    console.log("Using token:", currentToken);

    // ✅ Determine listName based on form type
    // const finalListName = (useCandidateData && rtrData?.jobTitle)
    //   ? rtrData.jobTitle
    //   : data?.Listname || listName || url;
    // console.log("Final listName being sent:", finalListName);
    const decryptedMail = decryptURL(userEmail, secretKey);
  console.log("decryptedMail", decryptedMail);

    const options = {
      method: "POST",
      // url: `${host}list/submitCheckList2`,
      url: `${host}api/v1/checklists/submit`,
      headers: {
        "Content-Type": "application/json",
        "X-Tenant": tenant,
        Authorization: `Bearer ${currentToken}`,
      },
      data: {
        firstname: firstname,
        lastname: lastname,
        phoneNo: phoneno,
        email: email,
        dob: formatDob,
        ssn: values.ssn,
        references: references,
        list: data.list,
        htmlData: r === "ortr" ? RtrTemp : Html,
        htmlData1: RtrTemp,
        listName: rtrData.jobTitle || data.listName,
        address: values.address || "",
        // requestTimeOffDate: { startDate: from, endDate: to },
        categoryName: url,
        rtrType: r,
        senderMail: decryptedMail,
      },
    };
    console.log("Options being sent:", Html);
    console.log("Submitting payload:", options.data);
    console.log("Submitting to URL:", data.listName || rtrData.jobTitle);

   
    console.log("Using token for submission:",values);
    setLoading(true);
    axios
      .request(options)
      .then(function (response) {
        setLoading(false);
        if (response.data.baseResponse.status === 1) {
          swal({
            title: "Response received.",
            text: "Thank you! Your response has been received.",
            icon: "success",
            showConfirmButton: true, // Ensures a confirm button is displayed
          });
          // window.location.reload();
        }
      })
      .catch(function (error) {
        setLoading(false);
      });
  };

  // const authToken = async() => {
  //   const options = {
  //     method: "POST",
  //     headers: {
  //       cookie: "JSESSIONID=B666C8018B66CA7C561B76806A7C9778",
  //       "Content-Type": "application/json",
  //       "User-Agent": "insomnia/8.6.1",
  //       "X-Tenant": tenant,
  //     },
  //     body: '{"email":"archit.mishra@midasconsulting.org","password":"MidasAdmin@3321"}',
  //   };

  //   await fetch("https://tenanthrmsapi.theartemis.ai/api/v1/user/authenticate", options)
  //     .then((response) => response.json())

  //     .then((response) => {
  //       console.log("Auth Token Response:", response.response);
  //       setToken(response.response)})
  //     .catch((err) => console.error(err));
  // };
  const authToken = async () => {
    const options = {
      method: "POST",
      headers: {
        cookie: "JSESSIONID=B666C8018B66CA7C561B76806A7C9778",
        "Content-Type": "application/json",
        "User-Agent": "insomnia/8.6.1",
        "X-Tenant": tenant,
      },
      body: '{"email":"archit.mishra@midasconsulting.org","password":"MidasAdmin@3321"}',
    };

    await fetch(
      "https://tenanthrmsapi.theartemis.ai/api/v1/user/authenticate",
      options,
    )
      .then((response) => response.json())
      .then((response) => {
        const newToken = response.response;
        console.log("Setting token:", newToken);
        setToken(newToken);
        tokenRef.current = newToken; // Update the ref
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    authToken();
  }, []);

  //   useEffect(()=>{
  //     setPhoneUS(formatToUSPhoneNumber(formik.values.phoneno))
  //   },[formik.values.phoneno])

  //   useEffect(()=>{
  //     formik.setFieldValue("phoneno",phoneus)
  //   },[phoneus])

  // Updated handleReferences function with validation for name and email

  // Helper function to parse date string in MM/DD/YYYY format
  const parseDateString = (dateString) => {
    if (!dateString) return null;

    // If it's already in MM/DD/YYYY format
    if (dateString.includes("/")) {
      const [month, day, year] = dateString.split("/").map(Number);
      if (month && day && year) {
        return new Date(year, month - 1, day);
      }
    }

    // Try parsing as ISO format or other formats
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  };

  const handleNameInput = (e) => {
    const value = e.target.value;
    // Allow only letters and prevent starting with space
    if (/^[a-zA-Z]*$/.test(value) || value === "") {
      handleChange(e);
    }
  };
  const handleReferences = (e, index) => {
    const { name, value } = e.target;
    const updatedReferences = [...references];

    if (name === "phoneno") {
      // Use the same formatting logic as in InputField
      const digits = value.replace(/\D/g, "");

      // Ensure starts with +1
      let formatted = "+1";
      if (digits.startsWith("1") && digits.length > 1) {
        formatted += digits.substring(1, 11); // Take next 10 digits
      } else if (!digits.startsWith("1")) {
        formatted += digits.substring(0, 10); // Take first 10 digits
      }

      // Add formatting
      if (formatted.length > 2) {
        formatted = formatted.replace(
          /^(\+1)(\d{0,3})(\d{0,3})(\d{0,4})/,
          (_, p1, p2, p3, p4) =>
            [p1, p2 && ` (${p2}`, p3 && `) ${p3}`, p4 && `-${p4}`]
              .filter(Boolean)
              .join(""),
        );
      }

      updatedReferences[index][name] = formatted;
    } else if (name === "name") {
      // Validate name: no leading spaces, only letters, spaces, hyphens, and apostrophes
      const trimmedValue = value.trimStart();

      // Only allow letters, spaces, hyphens, and apostrophes
      if (trimmedValue === "" || /^[A-Za-z\s'-]+$/.test(trimmedValue)) {
        updatedReferences[index][name] = trimmedValue;
      } else {
        // Don't update if invalid characters
        alert(
          "Name can only contain letters, spaces, hyphens, and apostrophes",
        );
        return;
      }
    } else if (name === "email") {
      // Validate email: no leading spaces, no spaces allowed
      const trimmedValue = value.trimStart();

      // Remove all spaces from email
      const noSpacesValue = trimmedValue.replace(/\s/g, "");

      updatedReferences[index][name] = noSpacesValue;
    } else {
      updatedReferences[index][name] = value;
    }

    // Duplicate checking logic
    if (name === "name" && index !== 0) {
      const firstReferenceName = updatedReferences[0].name;
      if (updatedReferences[index][name] === firstReferenceName) {
        alert(
          "Reference name cannot be the same as the first reference's name",
        );
        return;
      }
    }

    if (name === "phoneno" && index !== 0) {
      const currentDigits = updatedReferences[index].phoneno.replace(/\D/g, "");
      const firstDigits =
        updatedReferences[0].phoneno?.replace(/\D/g, "") || "";
      if (currentDigits === firstDigits && currentDigits.length > 1) {
        alert("Phone number cannot be the same as the first reference");
        return;
      }
    }

    if (name === "email" && index !== 0) {
      const firstEmail = updatedReferences[0].email;
      if (updatedReferences[index][name] === firstEmail) {
        alert("Email cannot be the same as the first reference");
        return;
      }
    }

    setReferences(updatedReferences);
  };

  const tableData = () => {
    let options = {
      method: "GET",
      headers: {
        "User-Agent": "insomnia/8.6.1",
        "x-tenant": tenant,
      },
    };

    fetch(`${host}api/v1/checklists/templates/${url}`, options)
      .then((res) => res.json())
      .then((response) => {
        console.log("Table Data Response:", response);
        if (response.baseResponse.status === 1) {
          setData(response.response);
          setSenderMail(response.recruiterMail);
          setLoading(false); // ← ADD THIS LINE
        } else {
          setLoading(false); // ← ADD THIS LINE
          router.push("/404");
        }
      })
      .catch((err) => {
        console.error("error:" + err);
        setLoading(false); // ← ADD THIS LINE
      });
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
  // async function myRoute(req: NextApiRequest, res: NextApiResponse) {
  //   const detectedIp = requestIp.getClientIp(req);
  //   res.status(200).json({ ip: detectedIp });
  // }

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
                          onChange={handleNameInput} // Use the filtered handler
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
                          onChange={handleNameInput}
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
                          type={"tel"}
                          placeholder={"Enter Phone number"}
                          onChange={(e) => {
                            const input = e.target.value;

                            // 1. Remove all non-digit characters
                            const digits = input.replace(/\D/g, "");

                            // 2. Ensure starts with +1
                            let formatted = "+1";
                            if (digits.startsWith("1") && digits.length > 1) {
                              formatted += digits.substring(1, 11); // Take next 10 digits
                            } else if (!digits.startsWith("1")) {
                              formatted += digits.substring(0, 10); // Take first 10 digits
                            }

                            // 3. Add formatting
                            if (formatted.length > 2) {
                              formatted = formatted.replace(
                                /^(\+1)(\d{0,3})(\d{0,3})(\d{0,4})/,
                                (_, p1, p2, p3, p4) =>
                                  [
                                    p1,
                                    p2 && ` (${p2}`,
                                    p3 && `) ${p3}`,
                                    p4 && `-${p4}`,
                                  ]
                                    .filter(Boolean)
                                    .join(""),
                              );
                            }

                            formik.setFieldValue("phoneno", formatted);
                          }}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"phoneno"}
                          errors={formik.errors.phoneno}
                          touched={formik.touched.phoneno}
                        />
                        <InputField
                          label={"Alternate number"}
                          value={values.otherphone}
                          type={"tel"}
                          placeholder={"Enter Phone number"}
                          onChange={(e) => {
                            const input = e.target.value;

                            // 1. Remove all non-digit characters
                            const digits = input.replace(/\D/g, "");

                            // 2. Ensure starts with +1
                            let formatted = "+1";
                            if (digits.startsWith("1") && digits.length > 1) {
                              formatted += digits.substring(1, 11); // Take next 10 digits
                            } else if (!digits.startsWith("1")) {
                              formatted += digits.substring(0, 10); // Take first 10 digits
                            }

                            // 3. Add formatting
                            if (formatted.length > 2) {
                              formatted = formatted.replace(
                                /^(\+1)(\d{0,3})(\d{0,3})(\d{0,4})/,
                                (_, p1, p2, p3, p4) =>
                                  [
                                    p1,
                                    p2 && ` (${p2}`,
                                    p3 && `) ${p3}`,
                                    p4 && `-${p4}`,
                                  ]
                                    .filter(Boolean)
                                    .join(""),
                              );
                            }

                            formik.setFieldValue("otherphone", formatted);
                          }}
                          onBlur={handleBlur}
                          // id={"validationCustom03"}
                          required={false}
                          name={"otherphone"}
                          errors={formik.errors.otherphone}
                          touched={formik.touched.otherphone}
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

                        <div className="form-group col-md-2">
                          <label className="m-2 text-dark">
                            Date Of Birth*
                          </label>
                          <DatePicker
                            selected={
                              values.dob ? parseDateString(values.dob) : null
                            }
                            showMonthDropdown
                            dropdownMode="select"
                            popperPlacement="top"
                            onChange={(date) => {
                              if (date) {
                                // Format the date as MM/DD/YYYY
                                const month = String(
                                  date.getMonth() + 1,
                                ).padStart(2, "0");
                                const day = String(date.getDate()).padStart(
                                  2,
                                  "0",
                                );
                                const year = date.getFullYear();
                                formik.setFieldValue(
                                  "dob",
                                  `${month}/${day}/${year}`,
                                );
                              } else {
                                formik.setFieldValue("dob", "");
                              }
                            }}
                            onBlur={() => formik.setFieldTouched("dob", true)}
                            onChangeRaw={(e) => {
                              // Allow manual input in MM/DD/YYYY format
                              const rawValue = e.target.value;
                              // Basic format validation for manual entry
                              if (
                                /^\d{0,2}\/?\d{0,2}\/?\d{0,4}$/.test(rawValue)
                              ) {
                                // You can add auto-formatting here if needed
                              }
                            }}
                            dateFormat="MM/dd/yyyy"
                            placeholderText="MM/DD/YYYY"
                            className="form-control"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={50}
                            maxDate={new Date()}
                            required
                            showMonthYearPicker={false}
                          />
                          {formik.touched.dob && formik.errors.dob && (
                            <div className="text-danger small">
                              {formik.errors.dob}
                            </div>
                          )}
                        </div>

                        <InputField
                          label={"Last four SSN digit"}
                          value={values.ssn}
                          type={"text"}
                          placeholder={"Enter Last four SSN digit"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"ssn"}
                          errors={formik.errors.ssn}
                          touched={formik.touched.ssn}
                        />

                        <InputField
                          label={"Address*"}
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
                            Professional References (1 must be of supervisor)
                          </span>
                        </div>
                        <div className="col-md-11"></div>
                      </div>

                      <div className="refences-div">
                        {references.map((item, index) => (
                          <div className="form-group row mb-3 d-flex align-items-center">
                            <NotRequiredInputField
                              label={"Name"}
                              value={item.name}
                              type={"text"}
                              placeholder={"Enter Full Name"}
                              onChange={(e) => handleReferences(e, index)}
                              id={"validationCustom03"}
                              name={"name"}
                              required={false}
                            />
                            <NotRequiredInputField
                              label={"Phone"}
                              value={item.phoneno || "+1"}
                              type={"tel"}
                              placeholder={"Enter Phone Number"}
                              onChange={(e) => handleReferences(e, index)}
                              id={"validationCustom03"}
                              name={"phoneno"}
                              required={false}
                              touched={true}
                            />
                            <NotRequiredInputField
                              label={"Email"}
                              value={item.email}
                              type={"email"}
                              placeholder={"Enter Email Address"}
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
                            Candidate Preferences
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

              {!data?.list ? (
                <div className="container">
                  <div className="loading">Loading&#8230;</div>
                  <div className="content">
                    <h3>Please wait while we fetch your checklist!</h3>
                  </div>
                </div>
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
                                        ),
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
                        <p>
                          Date signed-:&nbsp;
                          <strong>
                            <span>{newDate}</span>
                          </strong>
                        </p>
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
            <form
              onSubmit={(e) => {
                e.preventDefault();

                // ✅ For RTR forms, create a combined object
                const combinedValues = {
                  firstname: candidateData.firstName,
                  lastname: candidateData.lastName,
                  email: candidateData.email,
                  phoneno: candidateData.phone,
                  dob: "",
                  ssn: "",
                  address: "",
                };

                submitData(e, combinedValues);
              }}
            >
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
                      <p>
                        Date signed-:&nbsp;
                        <strong>
                          <span>{newDate}</span>
                        </strong>
                      </p>

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

              {!data?.list ? (
                <div className="container">
                  <div className="loading">Loading&#8230;</div>
                  <div className="content">
                    <h3>Please wait while we fetch your checklist!</h3>
                  </div>
                </div>
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
                      <div className="date-box">
                        <p>
                          Date signed-:&nbsp;
                          <strong>
                            <span>{newDate}</span>
                          </strong>
                        </p>
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
                          onChange={handleNameInput}
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
                          onChange={handleNameInput}
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
                          type={"tel"}
                          placeholder={"Enter Phone number"}
                          onChange={(e) => {
                            const input = e.target.value;

                            // 1. Remove all non-digit characters
                            const digits = input.replace(/\D/g, "");

                            // 2. Ensure starts with +1
                            let formatted = "+1";
                            if (digits.startsWith("1") && digits.length > 1) {
                              formatted += digits.substring(1, 11); // Take next 10 digits
                            } else if (!digits.startsWith("1")) {
                              formatted += digits.substring(0, 10); // Take first 10 digits
                            }

                            // 3. Add formatting
                            if (formatted.length > 2) {
                              formatted = formatted.replace(
                                /^(\+1)(\d{0,3})(\d{0,3})(\d{0,4})/,
                                (_, p1, p2, p3, p4) =>
                                  [
                                    p1,
                                    p2 && ` (${p2}`,
                                    p3 && `) ${p3}`,
                                    p4 && `-${p4}`,
                                  ]
                                    .filter(Boolean)
                                    .join(""),
                              );
                            }

                            formik.setFieldValue("phoneno", formatted);
                          }}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"phoneno"}
                          errors={formik.errors.phoneno}
                          touched={formik.touched.phoneno}
                        />
                        <InputField
                          label={"Alternate number"}
                          value={values.otherphone}
                          type={"tel"}
                          placeholder={"Enter Phone number"}
                          onChange={(e) => {
                            const input = e.target.value;

                            // 1. Remove all non-digit characters
                            const digits = input.replace(/\D/g, "");

                            // 2. Ensure starts with +1
                            let formatted = "+1";
                            if (digits.startsWith("1") && digits.length > 1) {
                              formatted += digits.substring(1, 11); // Take next 10 digits
                            } else if (!digits.startsWith("1")) {
                              formatted += digits.substring(0, 10); // Take first 10 digits
                            }

                            // 3. Add formatting
                            if (formatted.length > 2) {
                              formatted = formatted.replace(
                                /^(\+1)(\d{0,3})(\d{0,3})(\d{0,4})/,
                                (_, p1, p2, p3, p4) =>
                                  [
                                    p1,
                                    p2 && ` (${p2}`,
                                    p3 && `) ${p3}`,
                                    p4 && `-${p4}`,
                                  ]
                                    .filter(Boolean)
                                    .join(""),
                              );
                            }

                            formik.setFieldValue("otherphone", formatted);
                          }}
                          onBlur={handleBlur}
                          // id={"validationCustom03"}
                          required={false}
                          name={"otherphone"}
                          errors={formik.errors.otherphone}
                          touched={formik.touched.otherphone}
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

                        <div className="form-group col-md-2">
                          <label className="m-2 text-dark">
                            Date Of Birth*
                          </label>
                          <DatePicker
                            selected={
                              values.dob ? parseDateString(values.dob) : null
                            }
                            showMonthDropdown
                            dropdownMode="select"
                            popperPlacement="top"
                            onChange={(date) => {
                              if (date) {
                                // Format the date as MM/DD/YYYY
                                const month = String(
                                  date.getMonth() + 1,
                                ).padStart(2, "0");
                                const day = String(date.getDate()).padStart(
                                  2,
                                  "0",
                                );
                                const year = date.getFullYear();
                                formik.setFieldValue(
                                  "dob",
                                  `${month}/${day}/${year}`,
                                );
                              } else {
                                formik.setFieldValue("dob", "");
                              }
                            }}
                            onBlur={() => formik.setFieldTouched("dob", true)}
                            onChangeRaw={(e) => {
                              // Allow manual input in MM/DD/YYYY format
                              const rawValue = e.target.value;
                              // Basic format validation for manual entry
                              if (
                                /^\d{0,2}\/?\d{0,2}\/?\d{0,4}$/.test(rawValue)
                              ) {
                                // You can add auto-formatting here if needed
                              }
                            }}
                            dateFormat="MM/dd/yyyy"
                            placeholderText="MM/DD/YYYY"
                            className="form-control"
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={50}
                            maxDate={new Date()}
                            required
                            showMonthYearPicker={false}
                          />
                          {formik.touched.dob && formik.errors.dob && (
                            <div className="text-danger small">
                              {formik.errors.dob}
                            </div>
                          )}
                        </div>

                        <InputField
                          label={"Last four SSN digit*"}
                          value={values.ssn}
                          type={"text"}
                          placeholder={"Last four SSN digit"}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={"validationCustom03"}
                          required={true}
                          name={"ssn"}
                          errors={formik.errors.ssn}
                          touched={formik.touched.ssn}
                        />

                        <InputField
                          label={"Address*"}
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
                              label={"Enter Name"}
                              value={item.name}
                              type={"text"}
                              placeholder={"Enter Full Name"}
                              onChange={(e) => handleReferences(e, index)}
                              id={"validationCustom03"}
                              name={"name"}
                              required={false}
                            />
                            <NotRequiredInputField
                              label={"Phone"}
                              value={item.phoneno || "+1"}
                              type={"tel"}
                              placeholder={"Enter Phone Number"}
                              onChange={(e) => handleReferences(e, index)}
                              id={"validationCustom03"}
                              name={"phoneno"}
                              required={false}
                              touched={true}
                            />
                            <NotRequiredInputField
                              label={"Enter E-mail"}
                              value={item.email}
                              type={"email"}
                              placeholder={"Enter E-mail"}
                              onChange={(e) => handleReferences(e, index)}
                              id={"validationCustom03"}
                              name={"email"}
                              required={false}
                            />
                          </div>
                        ))}
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

              {!data?.list ? (
                <div className="container">
                  <div className="loading">Loading&#8230;</div>
                  <div className="content">
                    <h3>Please wait while we fetch your checklist!</h3>
                  </div>
                </div>
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
                                        {console.log(item.value2)}
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
                                                  console.log(
                                                    "target",
                                                    e.target.value,
                                                  );

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
                                                  console.log(
                                                    "target",
                                                    e.target.value,
                                                  );

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
                                                  console.log(
                                                    "target",
                                                    e.target.value,
                                                  );
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
                                                  console.log(
                                                    "target",
                                                    e.target.value,
                                                  );
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
      console.log("params", params, queryUrl);

      const result = {
        id: params.get("id") || "",
        mail: params.get("mail") || "",
        r: params.get("r") || "",
        mi: params.get("mi") || "",
        tenant: params.get("tenant") || "",
        tenant: params.get("tenant") || "",
        url: queryUrl, // Hardcoded as per expected output
      };

      return result;
    }
    console.log("hello", url);
    const secretKey = "secretHello"; // Replace with your actual AES key
    const decryptedData = url ? decryptURL(url, secretKey) : null;
    console.log("decryptedData", decryptedData);
    let jsonObject;
    if (decryptedData) {
      jsonObject = parseQueryString(decryptedData);
    }
    console.log("jsonObject", jsonObject);
    console.log("jsonObject", jsonObject);
    // Ensure we are correctly extracting values from decryptedData
    return {
      props: {
        url: jsonObject.url,
        id: jsonObject?.id,
        mail: jsonObject?.mail,
        r: jsonObject?.r,
        mi: jsonObject?.mi,
        tenant: jsonObject?.tenant,
        tenant: jsonObject?.tenant,
      },
    };
  }
}
