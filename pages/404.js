import dynamic from "next/dynamic";
import Link from "next/link";
import React from "react";
const index = () => {
  React.useEffect(() => {
    // Send the error info to the API route
    console.log("urlrlr", window.location.href);

    fetch("http://tenantapi.theartemis.ai/api/v1/email/sendEmailChecklistLink", {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: "66eb3db89b7a936d1b86e767",
        email: "anubhav.kaushik@midasconsulting.org",
        recruiterEmail: "anubhav.kaushik@midasconsulting.org",
        linkHtml: window.location.href,
        checklistName: "lpn",
        mailSelection: "Checklist",
        jobTitle: "string",
        jobDuration: "string",
        guaranteedHours: "string",
        shift: "string",
        payRate: "string",
        facilityAddress: "string",
        grossWeekly: "string",
        responsibilities: ["string"],
        requirements: ["string"],
        firstName: "string",
        lastName: "string",
        userId: "string",
        phone: "string",
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Success:", data))
      .catch((error) => console.error("Error:", error));
  }, []);
  return (
    <>
      <div
        className="error-page-wrapper "
        style={{ backgroundImage: `url(/images/404.jpg)` }}
        data-aos="fade"
      >
        <div className="content-404">
          <div className="logo-404">
            <Link href="/">
              <img src="/images/logo.webp" alt="brand" className="image-logo" />
            </Link>
          </div>
          {/* End logo */} <h1>404!</h1>
          <p>The page you are looking for could not be found.</p>
          <Link className="theme-btn btn-style-three call-modal" href="/">
            BACK TO HOME
          </Link>
        </div>
        {/* End .content */}
      </div>
    </>
  );
};
export default dynamic(() => Promise.resolve(index), { ssr: false });
