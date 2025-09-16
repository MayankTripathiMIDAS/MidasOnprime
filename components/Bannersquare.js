import React from "react";
import Smallsquare from "./Smallsquare";
const Bannersquare = () => {
  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div
            className="col-md-6"
            style={{
              backgroundImage: `url("/images/twodoctor.jpg")`,
            }}
          ></div>
          <div className="col-md-6 text-background">
            <div className="square-information" style={{ padding: "0px 20px" }}>
              <h1>
                Our Talent
                <br />
                Solutions
              </h1>
              <h4 style={{ marginBottom: "80px" }}>
                Have a look at how our specialised industry knowledge and years
                of experience enable higher-quality recruits and revolutionary
                workforce solutions.
              </h4>
            </div>
          </div>
          <Smallsquare
            color="#ebeae8"
            href={"/healthcare"}
            title="Midas Healthcare"
          />
          {/* <Smallsquare
            color="#e5ded8"
            href={"/lifescience"}
            title="Midas Life Sciences"
          /> */}
          {/* <Smallsquare color="#002454" href={"#"} title="Midas Life Science"/>
    <Smallsquare color="#004582" href={"#"} title="Midas Enginerring"/> */}
        </div>
      </div>
    </>
  );
};

export default Bannersquare;
