import InputField from "../../components/InputField";
import moment from "moment-timezone";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import { addDays } from "date-fns";
import { DateRange, DateRangePicker } from "react-date-range";
import { Button, Modal } from "react-bootstrap";
import axios from "axios";
import swal from "sweetalert";
import "react-datepicker/dist/react-datepicker.css";
import ReactDatePicker from "react-datepicker";
import { host } from "../../static";
// const host = "http://192.168.0.22:9000/";

const Url = ({ url }) => {
  const [active, setActive] = useState(false);
  const newDate = moment().tz("US/Central").format("YYYY-MM-DD");
  const [html, setHTML] = useState("");
  const [dob, setDob] = useState(false);
  const [sign, setSign] = useState("");
  const [dateofBirth, setDateOfBirth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    phoneno: "",
    email: "",
    dob: dateofBirth,
    ssn: "",
  });
  const [showDate, setShowDate] = useState(false);
  const [state, setState] = useState([
    {
      startDate: "",
      endDate: "",
      key: "selection",
    },
  ]);
  //Validation*************************************************

  const formik = useFormik({
    initialValues: {
      name: "",
      phoneno: "",
      email: "",
      dob: "",
      ssn: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required"),
      phoneno: Yup.string().required("Required"),
      ssn: Yup.string()
        .required("Social Security Number is required")
        .min(4, "Social Security Number Must be 4 Digits long")
        .max(4, "Social Security Number Must be 5 Digits long"),
      email: Yup.string().email("Invalid email address").required("Required"),
      dob: Yup.string()
        .required("Contact-Number is required")
        .min(10, "Contact Number should not be long less than 10 digits")
        .max(10, "Contact Number should not be long more than 10 digits"),
    }),
    onSubmit: (values) => {
      CreateEmployee(values, navigate);
      alert(JSON.stringify(values, null, 2));
      // setFormState(values);
    },
  });

  //Validation*************************************************

  const [references, setReferenes] = useState([
    {
      name: "",
      phoneno: "",
      email: "",
    },
  ]);
  const from = moment(state[0].startDate).format("MM/DD/YYYY");
  const to = moment(state[0].endDate).format("MM/DD/YYYY");

  function renderTable(datas, title) {
    // Start building the table markup

    let tableHTML = `<div class="container" style="width: 400px; text-align: center; margin-top: 20px;">`;
    tableHTML = `<div class="row">`;
    tableHTML = `<div  class="col-md-6" >`;
    tableHTML = `<form>`;
    tableHTML = `<table class="table table-bordered" style="width: 400px; text-align: center;">`;

    tableHTML += `<thead class="health-table">`;
    tableHTML += "<tr>";

    tableHTML += `<th class="health-row" colspan="4">${title}</th>`;
    tableHTML += `<th  class="health-row small" scope="col" style="width: 30px; text-align: center;">1</th>`;
    tableHTML += `<th  class="health-row small" scope="col" style="width: 30px; text-align: center;">2</th>`;
    tableHTML += `<th  class="health-row small" scope="col" style="width: 30px; text-align: center;">3</th>`;
    tableHTML += `<th  class="health-row small" scope="col" style="width: 30px; text-align: center;">4</th>`;

    tableHTML += "</tr>";
    tableHTML += "</thead>";

    datas.map((ite, index) => {
      tableHTML += "<tbody>";

      tableHTML += "<tr>";

      tableHTML += `<th class="table-data" colspan="4" scope="row">${ite.name}</th>`;

      tableHTML += `<td class="table-data">${
        ite.value1 === "checked"
          ? `<input class="form-check-input" type="radio" name=${ite.name}
                        required id="flexRadioDefault" value=${ite.value1} checked disabled>`
          : `<input class="form-check-input" type="radio" name=${ite.name}
                        required id="flexRadioDefault" disabled > `
      } </td>`;
      tableHTML += `<td class="table-data">${
        ite.value2 === "checked"
          ? `<input class="form-check-input" type="radio" name=${ite.name}
                        required id="flexRadioDefault" value=${ite.value2} checked disabled>`
          : `<input class="form-check-input" type="radio" name=${ite.name}
                        required id="flexRadioDefault" disabled > `
      } </td>`;
      tableHTML += `<td class="table-data">${
        ite.value3 === "checked"
          ? `<input class="form-check-input" type="radio" name=${ite.name}
                        required id="flexRadioDefault" value=${ite.value3} checked disabled>`
          : `<input class="form-check-input" type="radio" name=${ite.name}
                        required id="flexRadioDefault" disabled >`
      } </td>`;
      tableHTML += `<td class="table-data">${
        ite.value4 === "checked"
          ? `<input class="form-check-input" type="radio" name=${ite.name}
                        required id="flexRadioDefault" value=${ite.value4} checked disabled>`
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

  const date = `${from}-${to}`;
  const StringDate = JSON.stringify(date);
  const dateofbith = moment().format("DD/MM/YYYY");
  const inputDate = JSON.stringify(dateofbith);

  const submitData = (e) => {
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
          diplay : none;
        }
    </style>
</head>
<body>
<span><strong>Candidate's Details</strong></span>
<div>

          <div class="form-group row mb-3 d-flex align-items-center" style="display:flex; flex-direction:row;">
          <div class="col-md-3">

          <input disabled type="text" class="form-control" id="firstname" 
          style=" padding : 10px;  margin :10px;width: 180px; text-align: center;"
          name="firstname" required="" value=${userData.firstname}>
          
          
          </div>
           <div class="col-md-3">

          <input disabled type="text" class="form-control" id="lastname" 
          style=" padding : 10px;  margin :10px;width: 180px; text-align: center;"
          name="lastname" required="" value=${userData.lastname}>
          
          
          </div>
          <div class="col-md-3">
        
          <input disabled type="number" class="form-control" id="phoneno"  style=" padding : 10px; width: 180px; text-align: center; margin :10px;" name="phoneno" required="" value=${
            userData.phoneno
          }></div><div class="col-md-3"><input disabled type="email" class="form-control" id="email"  name="email" style=" padding : 10px; width: 180px; text-align: center; margin :10px;" required="" value=${
      userData.email
    }></div><div class="col-md-3"><input disabled type="text" class="form-control" id="dob"  name="dob" style=" padding : 10px; width: 180px; text-align: center; margin :10px;" required="" value=${moment(
      inputDate
    ).format("DD/MM/YYYY")} /></div>
          </div>
          <div class="form-group row mb-3 d-flex align-items-center" style="display:flex; flex-direction:row;"> 
          <div class="col-md-3">
          <input disabled type="number" class="form-control" id="name"  style=" padding : 10px; width: 180px; text-align: center; margin :10px;" name="ssn" required="" value=${
            userData.ssn
          }></div>
      
          <div class="col-md-3">
          <input type="text" class="form-control" id="name"  style=" padding : 10px; width:200px; text-align: center; margin :10px;" name="ssn" required="" value=${
            StringDate === "Invalid Date-Invalid Date" ? "" : StringDate
          } 
          disabled /></div>
          </div>
          </div>
          

              <span><strong>Candidate References's details </strong></span>


          <div>
          <div class="form-group row mb-3 d-flex align-items-center" style="display:flex; flex-direction:row;">
      <div class="col-md-3">
          
          <input disabled type="text" class="form-control" id="name" 
          style=" padding : 10px;  margin :10px;width: 180px; text-align: center;"
          name="name" required="" value=${references[0].name}></div>
          <div class="col-md-3">
        
          <input disabled type="number" class="form-control" id="phoneno"  style=" padding : 10px; width: 180px; text-align: center; margin :10px;" name="phoneno" required="" value=${
            references[0].phoneno
          }></div>
          <div class="col-md-3"><input disabled type="email" class="form-control" id="email"  name="email" style=" padding : 10px; width: 180px; text-align: center; margin :10px;" required="" value=${
            references[0].email
          }></div>
          </div>
          ${
            references[1]
              ? `  <div class="form-group row mb-3 d-flex align-items-center" style="display:flex; flex-direction:row;">
          <div class="col-md-3">
          
          <input disabled type="text" class="form-control" id="name" 
          style=" padding : 10px;  margin :10px;width: 180px; text-align: center;"
          name="name" required="" value=${references[1].name}></div>
          <div class="col-md-3">
        
          <input disabled type="number" class="form-control" id="phoneno"  style=" padding : 10px; width: 180px; text-align: center; margin :10px;" name="phoneno" required="" value=${references[1].phoneno}></div>
          <div class="col-md-3"><input disabled type="email" class="form-control" id="email"  name="email" style=" padding : 10px; width: 180px; text-align: center; margin :10px;" required="" value=${references[1].email}></div>`
              : ""
          }
        
       
          </div>
</div>
    ${
      th === undefined || th === "Wait"
        ? ""
        : th.map((item, index) => {
            const tab = renderTable(item.items, item.title);

            return tab;
          })
    }
    <div>
            <div class="form-group row mt-3 d-flex ">
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
            >
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
                <input
                 style=" padding : 5px; width: 180px; text-align: center; margin-top :10px;"" 
                  type="text"
                  className="form-control"
                  id="exampleInputEmail1"
                  aria-describedby="emailHelp"
                  placeholder="Your Signature"
                  value=${sign}
                  disabled
                    />
              </div>
            </div>
            
          </div>
    
    </body></html>`;
    setHTML(Html);
    const options = {
      method: "POST",
      url: `${host}list/submitCheckList`,
      headers: { "Content-Type": "application/json" },
      data: {
        name: userData.name,
        phoneno: userData.phoneno,
        email: userData.email,
        dob: userData.dob,
        ssn: userData.ssn,
        references: references,
        list: data.list,
        htmlData: Html,
        listName: data.Listname,
        requestTimeOffDate: { startDate: from, endDate: to },
      },
    };

    axios
      .request(options)
      .then(function (response) {
        if (response.data.baseResponse.status == 1) {
          swal({
            title: "We have gathered all your information",
            text: "Please proceed to submit request.",
            icon: "success",
          }).then((willDelete) => {
            if (willDelete) {
              swal("Your Request Has Been Submitted!", "success");
              window.location.reload();
            }
          });
        }
      })
      .catch(function (error) {
        alert(error);
      });
  };

  const handledetailsChange = (e, name) => {
    if (name === "phoneno" || name === "ssn") {
      setUserData({ ...userData, [name]: parseInt(e.target.value) });
    } else if (name === "dob") {
      setDob(true);
      setUserData({
        ...userData,
        [name]: moment(e).format("MM/DD/YYYY"),
      });
    } else {
      setUserData({ ...userData, [name]: e.target.value });
    }
  };

  const handleReferences = (e, index) => {
    const { name, value } = e.target;
    if (name === "phoneno") {
      const list = [...references];
      list[index][name] = parseInt(value);
      setReferenes(list);
    } else {
      const list = [...references];
      list[index][name] = value;
      setReferenes(list);
    }
  };

  const handleAddReference = (e) => {
    e.preventDefault();
    setReferenes([
      ...references,
      {
        name: "",
        phoneno: "",
        email: "",
      },
    ]);
  };
  const tableData = () => {
    const options = { method: "GET" };

    fetch(`${host}list/getCheckList/${url}`, options)
      .then((response) => response.json())
      .then((response) => setData(response.response));
  };
  const word = url;

  const capitalized = url.charAt(0).toUpperCase() + url.slice(1);
  useEffect(() => tableData(), []);
  return (
    <>
      <div className="container checklist-head">
        <div className="midas-logo">
          <img src="/images/logo.webp" />
        </div>

        {url == undefined ? (
          <h2>Wait While we fetch data for you</h2>
        ) : (
          <h2>{capitalized} Skills Checklist</h2>
        )}

        <div className="col-md-12 p-5">
          <div className="row">
            <div class="form-group row mb-3 d-flex align-items-center bg-light border rounded p-2">
              <div className="form-group row mb-3 d-flex align-items-center">
                <InputField
                  label={"Enter First Name"}
                  value={userData.firstname}
                  type={"text"}
                  placeholder={"First Name"}
                  onChange={(e) => handledetailsChange(e, "firstname")}
                  id={"firstname"}
                  name={"firstname"}
                />
                <InputField
                  label={"Enter Last Name"}
                  value={userData.lastname}
                  type={"text"}
                  placeholder={"Last Name"}
                  onChange={(e) => handledetailsChange(e, "lastname")}
                  id={"lastname"}
                  name={"lastname"}
                />
                <InputField
                  label={"Enter Phone number"}
                  value={userData.phoneno}
                  type={"number"}
                  placeholder={"Enter Phone number"}
                  onChange={(e) => handledetailsChange(e, "phoneno")}
                  id={"phoneno"}
                  name={"phoneno"}
                />
                <InputField
                  label={"Enter E-mail"}
                  value={userData.email}
                  type={"email"}
                  placeholder={"Enter E-mail"}
                  onChange={(e) => handledetailsChange(e, "email")}
                  id={"email"}
                  name={"email"}
                />
                {dob === true ? (
                  <div className="btn col-md-3" onClick={() => setDob(false)}>
                    <InputField
                      label={"Date Of Birth"}
                      value={userData.dob}
                      type={"button"}
                      id={"dob"}
                      name={"dob"}
                      disabled={true}
                      style={{ width: "180px" }}
                    />
                  </div>
                ) : (
                  <div className="col-md-3">
                    <label className="m-2 text-dark" style={{ width: "180px" }}>
                      Enter DOB
                    </label>
                    <ReactDatePicker
                      selected={dateofBirth}
                      name="dob"
                      onChange={(date) => handledetailsChange(date, "dob")}
                      className="form-control calender"
                      placeholderText="Select Date Of Birth"
                      peekNextMonth
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                  </div>
                )}
                <InputField
                  label={"Last four SSN digit"}
                  value={userData.ssn}
                  type={"number"}
                  placeholder={"Last four SSN digit"}
                  onChange={(e) => handledetailsChange(e, "ssn")}
                  id={"name"}
                  name={"ssn"}
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

                <div className="col-md-3" style={{ marginTop: "40px" }}>
                  <span
                    className="btn  bg-light border rounded"
                    onClick={() => setShowDate(true)}
                  >
                    Select Request time off
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
                        <Modal.Title>Modal title</Modal.Title>
                      </Modal.Header>

                      <Modal.Body>
                        <DateRange
                          onChange={(item) => setState([item.selection])}
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
              <div class="form-group row mt-3 ">
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
              {active === false ? (
                <form>
                  <div className="form-group row mb-3 d-flex align-items-center">
                    {references.map((item, index) => (
                      <>
                        <InputField
                          label={"Enter Referre's Name"}
                          value={item.name}
                          type={"text"}
                          placeholder={"Full Name"}
                          onChange={(e) => handleReferences(e, index)}
                          id={"name"}
                          name={"name"}
                        />
                        <InputField
                          label={"Enter Referre's Phone"}
                          value={item.phoneno}
                          type={"number"}
                          placeholder={"Enter Phone number"}
                          onChange={(e) => handleReferences(e, index)}
                          id={"phoneno"}
                          name={"phoneno"}
                        />
                        <InputField
                          label={"Enter E-mail"}
                          value={item.email}
                          type={"email"}
                          placeholder={"Enter Referre's E-mail"}
                          onChange={(e) => handleReferences(e, index)}
                          id={"email"}
                          name={"email"}
                        />
                        {references.length === 2 ? (
                          <button
                            className="btn btn-danger col-md-3 mt-5 mb-2"
                            disabled={true}
                          >
                            Add References
                          </button>
                        ) : (
                          <button
                            className="btn btn-danger col-md-3 mt-5  mb-2"
                            onClick={(e) => handleAddReference(e)}
                          >
                            Add References
                          </button>
                        )}
                      </>
                    ))}
                  </div>
                </form>
              ) : null}

              <div class="form-group row mt-3 ">
                <div className="col-md-11">
                  <p>
                    <strong style={{ color: "#cb1829" }}>Instructions:</strong>{" "}
                    <span className="text-muted text-sm declare-para">
                      This checklist is meant to serve as a general guideline
                      for our client facilities as to the level of your skills
                      within your nursing specialty. Please use the scale below
                      to describe your experience/expertise in each area listed
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
                <strong style={{ color: "#cb1829" }}>Proficiency Scale:</strong>
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
      {/* <form> */}
      {data?.list === undefined ? (
        <>Wait</>
      ) : (
        <form onSubmit={(e) => submitData(e)}>
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
                                    class="form-check-input"
                                    type="radio"
                                    value={"checked"}
                                    onChange={(e) =>
                                      (ItemsVariable.value1 = e.target.value)
                                    }
                                    name={ItemsVariable.name}
                                    required={true}
                                    id="flexRadioDefault"
                                  />
                                </td>
                                <td class="table-data">
                                  <input
                                    class="form-check-input"
                                    type="radio"
                                    value={"checked"}
                                    onChange={(e) =>
                                      (ItemsVariable.value2 = e.target.value)
                                    }
                                    name={ItemsVariable.name}
                                    required
                                    id="flexRadioDefault"
                                  />
                                </td>
                                <td class="table-data">
                                  <input
                                    class="form-check-input"
                                    type="radio"
                                    value={"checked"}
                                    onChange={(e) =>
                                      (ItemsVariable.value3 = e.target.value)
                                    }
                                    name={ItemsVariable.name}
                                    required
                                    id="flexRadioDefault"
                                  />
                                </td>

                                <td class="table-data">
                                  <input
                                    class="form-check-input"
                                    type="radio"
                                    value={"checked"}
                                    onChange={(e) =>
                                      (ItemsVariable.value4 = e.target.value)
                                    }
                                    name={ItemsVariable.name}
                                    required
                                    id="flexRadioDefault"
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
                                      class="form-check-input"
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
                                        id="date"
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
                                    id="date"
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
                                    id="date"
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
                                style={{ width: "20px", textAlign: "center" }}
                                scope="col"
                              >
                                1
                              </th>
                              <th
                                className="health-row small"
                                style={{ width: "20px", textAlign: "center" }}
                                scope="col"
                              >
                                2
                              </th>
                              <th
                                className="health-row small"
                                style={{ width: "20px", textAlign: "center" }}
                                scope="col"
                              >
                                3
                              </th>
                              <th
                                className="health-row small"
                                style={{ width: "20px", textAlign: "center" }}
                                scope="col"
                              >
                                4
                              </th>
                            </tr>
                          </thead>
                          {list.items.map((item, index) => (
                            <tbody key={index}>
                              <tr>
                                <th
                                  className="table-data"
                                  colspan="4"
                                  scope="row"
                                >
                                  {item.name}
                                </th>
                                <td class="table-data">
                                  <input
                                    class="form-check-input"
                                    type="radio"
                                    value={"checked"}
                                    onChange={(e) =>
                                      (item.value1 = e.target.value)
                                    }
                                    name={item.name}
                                    required
                                    id="flexRadioDefault"
                                  />
                                </td>
                                <td class="table-data">
                                  <input
                                    class="form-check-input"
                                    type="radio"
                                    value={"checked"}
                                    onChange={(e) =>
                                      (item.value2 = e.target.value)
                                    }
                                    name={item.name}
                                    required
                                    id="flexRadioDefault"
                                  />
                                </td>
                                <td class="table-data">
                                  <input
                                    class="form-check-input"
                                    type="radio"
                                    value={"checked"}
                                    onChange={(e) =>
                                      (item.value3 = e.target.value)
                                    }
                                    name={item.name}
                                    required
                                    id="flexRadioDefault"
                                  />
                                </td>

                                <td class="table-data">
                                  <input
                                    class="form-check-input"
                                    type="radio"
                                    value={"checked"}
                                    onChange={(e) =>
                                      (item.value4 = e.target.value)
                                    }
                                    name={item.name}
                                    required
                                    id="flexRadioDefault"
                                  />
                                </td>
                              </tr>
                            </tbody>
                          ))}
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
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="declare"
                    required
                  />
                </div>
                <div className="col-md-11">
                  <p className="declare-para">
                    I hereby certify that ALL information I have provided on
                    this skills checklist and all other documentation, is true
                    and accurate. I understand and acknowledge that any
                    misrepresentation or omission may result in disqualification
                    from employment and/or immediate termination.
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
                  />
                </div>
              </div>
              <div>
                <button
                  style={{ marginTop: "20px", marginBottom: "20px" }}
                  className="btn btn-primary"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default Url;

export async function getServerSideProps(context) {
  const { url } = context.query;

  return {
    props: { url: url },
  };
}
