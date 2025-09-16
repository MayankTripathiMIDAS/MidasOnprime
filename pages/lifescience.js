// import Navbar from "../components/Navbar";
// import React from "react";
// import Picture from "../components/Picture";
// import Heading from "../components/Heading";
// import Paragraph from "../components/Paragraph";
// import Buttonwhite from "../components/Buttonwhite";
// import Lightheading from "../components/Lightheading";
// import Category from "../components/Category";
// import Navlink from "../components/Navlink";
// import Blackheading from "../components/Blackheading";
// import Testimonial from "../components/Testimonial";
// import Footer from "../components/Footer";
// import Link from "next/link";
// import Head from "next/head";

// const technology = () => {
//   return (
//     <>
//       <Head>
//         <title>Midas Consulting</title>
//         <meta name="description" content="Midas Consulting" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <link rel="icon" href="/favicon.png" />
//       </Head>
//       <Navbar />
//       <div className="container-fluid firstbanner">
//         <div className="row">
//           <div className="col-md-6 color-row">
//             <div className="banner-data">
//               <Heading heading="All Science Transformation" />
//               <Heading heading="Starts with Talent." />

//               <Paragraph para="With the help of our devoted, knowledgeable life sciences workforce solutions and recruiting teams, Midas Life Sciences makes sure your teams stay up with the rate of innovation and discovery." />
//               <Link href="/contact">
//                 <Buttonwhite buttonTitle="Contact Us" />
//               </Link>
//             </div>
//           </div>
//           <div
//             className="col-md-6 firstimage"
//             style={{
//               backgroundImage: `url("/images/redhair.jpg")`,
//             }}
//           ></div>

//           {/* <div className="col-md-12 covidlines">
//             <div className="col-md-7 guidelines">
//               <h5>
//                 Midas COVID-19 staffing support programs are helping hospitals,
//                 medical practices, labs and businesses rapidly bolster their
//                 resources and capabilities.
//               </h5>
//               <ul>
//                 <li>See Occupational Health/Testing Site & Lab Services</li>
//                 <li>See Contact Tracing Services</li>
//                 <li>See COVID-19 Vaccinator Services</li>
//               </ul>
//             </div>
//           </div> */}
//         </div>
//       </div>

//       <div className="container-fluid lightcontainer">
//         <div className="row" style={{ justifyContent: "center" }}>
//           <Lightheading light="What We Do" />
//           <div className="col-md-3 span-tag">
//             <Category spantitle="SCIENTIFIC CONSULTING" />
//           </div>
//           <div className="col-md-3 span-tag">
//             <Category spantitle="CLINICAL RESEARCH STAFFING" />
//           </div>
//           <div className="col-md-3 span-tag">
//             <Category spantitle="IT RECRUITMENT" />
//           </div>
//           <div className="col-md-3 span-tag">
//             <Category spantitle="DIGITAL TRANSFORMATION" />
//           </div>
//         </div>
//       </div>
//       <div className="container plan-container">
//         <div className="row">
//           <div className="col-md-6 category-info">
//             <Blackheading head="Scientific Consulting" />
//             <Paragraph para="Teams working in science need highly specialised skill sets that are more in demand than ever. Regulations across a wide range of scientific contexts demand an experienced staff, and the talent skills gap is a genuine issue." />
//             <Paragraph para="Midas Life Sciences staffing solutions serve teams in the following areas:" />
//             <ul>
//               <li>Pharma/Biotech </li>
//               <li>Medical Device </li>
//               <li>Consumer Products</li>
//               <li>Executive Search</li>
//             </ul>
//             <h2 className="collapse-replace">
//               Ready to make the most of your Scientific solution?
//             </h2>
//             <Navlink move={"#"} linktitle="Learn More" />
//           </div>
//           <div className="col-md-6">
//             <Picture image="/images/explaining.jpg" alt="Portrait Doctor" />
//           </div>
//         </div>
//       </div>

//       <div className="container plan-container">
//         <div className="row">
//           <div className="col-md-6">
//             <Picture image="/images/close.jpg" alt="Portrait Doctor" />
//           </div>
//           <div className="col-md-6 category-info">
//             <Blackheading head="Clinical Research Staffing" />
//             <Paragraph para="Your goal is to advance transformative clinical research in order to favourably improve people's lives. Our goal is to have a favourable effect on you. Midas Clinical Research Staffing and Consulting Services guarantee you have the people, resources, and direction required to develop and increase your effect on science with the help of our devoted, knowledgeable teams." />

//             <h2 className="collapse-replace">
//               Ready to make the most of your EHR/Epic talent?
//             </h2>
//             <Navlink move={"#"} linktitle="Learn More" />
//           </div>
//         </div>
//       </div>

//       {/* <div className="container plan-container">
//         <div className="row">
//           <div className="col-md-6 category-info">
//             <Blackheading head="IT Recruitment" />
//             <Paragraph para="Midas Technology, a leading technology staffing firm, will use its skilled recruitment professionals to find the best candidates for your contract, SOW, contract-to-hire, and direct openings." />
//             <ul>
//               <li>Hire the best development, Cloud, BI/analytics, application/software, and EMR/EHR talent for difficult-to-fill positions.</li>
//               <li>Adopt digital transformation with the help of experts qualified to guide and aid efforts across technology disciplines.</li>
//               <li>Close critical skill gaps to keep pace with industry innovation and IT advancement</li>
//             </ul>
//             <h2 className="collapse-replace">Ready to learn more about the top tech talent we can provide your team?</h2>
//             <Navlink
//               move={"#"}
//               linktitle="Learn More"
//             />
//           </div>
//           <div className="col-md-6">
//             <Picture image="/images/happy.jpg" alt="Portrait Doctor" />
//           </div>
//         </div>
//       </div> */}

//       {/* <div className="container plan-container">
//         <div className="row">
//           <div className="col-md-6">
//             <Picture image="/images/working.jpg" alt="Portrait Doctor" />
//           </div>
//           <div className="col-md-6 category-info">
//             <Blackheading head="Digital Transformation " />
//             <Paragraph para="Midas Technology powers business transformation by providing tech talent to plan, lead, implement and optimize digital solutions." />
//             <Paragraph para="Midas Technology creates strong, competent teams for digital transformation using unrivalled recruitment resources and expertise in cloud, business analytics, and applications development." />

//             <ul>
//               <li>Filling contract, SOW, contract-to-hire and direct hire digital roles</li>
//               <li>Dedicated team of digital recruiters with an average of 9 years of experience</li>
//             </ul>
//             <Navlink
//               move={"#"}
//               linktitle="Contact Us to Discuss Your Digital Transformation Project Today."
//             />
//           </div>
//         </div>
//       </div> */}

//       <div
//         className="container-fluid"
//         style={{ background: "#522e6e", color: "white" }}
//       >
//         <Testimonial />
//       </div>

//       <div
//         className="container plan-container"
//         style={{ marginBottom: "60px" }}
//       >
//         <div className="row">
//           <div className="col-md-6">
//             <Blackheading head="Embrace the Midas! Talent Advantage" />
//             <Paragraph para="Midas Consulting is our digital hiring and talent management platform that allows you to rapidly access pre-vetted tech talent on demand." />
//             <ul>
//               <li>Automated job order management</li>
//               <li>Advanced soft skill assessments</li>
//               <li>Real-time recruitment analytics</li>
//             </ul>
//             <Navlink move={"#"} linktitle="Explore!" />
//           </div>
//           <div className="col-md-6">
//             <Picture image="/images/laptop.jpg" alt="Laptop" />
//           </div>
//         </div>
//       </div>
//       <div
//         className="container-fluid largecontainer"
//         // style={{
//         //   backgroundImage: `url("/images/green.svg")`,
//         // }}
//         style={{ background: "linear-gradient(to top left, #891D3D, #C12716)" }}
//       >
//         <h2 className="largeheading">
//           Power your digital transformations with the strategy and talent of
//           Midas Technology.
//         </h2>
//         <Link href="/contact">
//           <Buttonwhite buttonTitle="Contact Us" />
//         </Link>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default technology;
