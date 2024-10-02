import nodemailer from "nodemailer";
import puppeteer from "puppeteer";
import CheckList from "@/model/SubmitChecklist"; // Adjust the path based on your project structure
import dbConnect from "@/utils/DBConnect"; // Ensure your MongoDB connection logic is handled here

export default async function submitCheckListTwo(req, res) {
  await dbConnect(); // Connect to your database

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    firstname,
    lastname,
    phoneno,
    email,
    dob,
    ssn,
    references,
    list,
    listName,
    htmlData,
    htmlData1,
    requestTimeOffDate,
    categoryname,
    address,
    senderMail,
  } = req.body;

  // Check for required fields
  if (!email || !firstname || !lastname || !ssn || !dob || !phoneno) {
    return res.status(400).json({
      baseResponse: {
        status: 0,
        message: "Please check your request",
      },
      response: [],
    });
  }

  const typeValue =
    wrapperRtr.get() === "ortr"
      ? "RTR"
      : wrapperRtr.get() === "nortr"
      ? "Checklist"
      : "Both";

  const sender = wrapperRecruiter.get();

  const newCheckList = new CheckList({
    firstname,
    lastname,
    phoneno,
    email,
    dob,
    ssn,
    references,
    listName,
    type: typeValue,
    sentby: sender,
    list,
    requestTimeOffDate,
    categoryname,
    address,
  });

  // Function to create PDF
  async function createPDF(htmlData, filename, format) {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlData, { waitUntil: "networkidle0" });
    const pdfPath = `/tmp/${filename}.pdf`; // Save to /tmp directory for temporary storage
    await page.pdf({ path: pdfPath, format: format, printBackground: true });
    await browser.close();
    return pdfPath;
  }

  // Function to send email with PDF attachment
  async function sendEmail(pdfPath, rtrPdf) {
    const attachments = [];

    if (rtrPdf) {
      attachments.push({
        filename: `${firstname}-RTR.pdf`,
        path: rtrPdf,
        contentType: "application/pdf",
      });
    }

    if (pdfPath) {
      attachments.push({
        filename: `${firstname + "-" + lastname + "-" + listName}.pdf`,
        path: pdfPath,
        contentType: "application/pdf",
      });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER, // Use environment variable
        pass: process.env.SMTP_PASS, // Use environment variable
      },
    });

    const mailOptions = {
      from: "skill-checklist@midasconsulting.org",
      to: `${senderMail}, skill-checklist@midasconsulting.org`,
      subject: `Response Received- ${listName} Skills Checklist`,
      attachments: attachments,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        res.status(404).json({
          baseResponse: {
            status: 0,
            message: error.message,
          },
          response: [],
        });
      } else {
        await newCheckList.save();
        res.status(200).json({
          baseResponse: {
            status: 1,
            message: "Checklist submitted successfully",
          },
          response: newCheckList,
        });
      }
    });
  }

  // Main function to create PDF and send email
  async function createPDFAndSendEmail() {
    try {
      const pdfPath = await createPDF(htmlData, "pdf1", "A3");
      let rtrPdf = null;

      if (wrapperRtr.get() === "ortr") {
        rtrPdf = await createPDF(htmlData1, "pdf2", "A3");
        await sendEmail(null, rtrPdf); // Send only rtrPdf
      } else if (wrapperRtr.get() === "wrtr") {
        rtrPdf = await createPDF(htmlData1, "pdf2", "A3");
        await sendEmail(pdfPath, rtrPdf); // Send both pdfPath and rtrPdf
      } else if (wrapperRtr.get() === "nortr") {
        await sendEmail(pdfPath, null); // Send only pdfPath
      } else {
        console.log("Invalid wrapperRtr.get() value");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      res.status(500).json({
        baseResponse: {
          status: 0,
          message: "Internal server error",
        },
        response: [],
      });
    }
  }

  // Call the main function
  createPDFAndSendEmail();
}
