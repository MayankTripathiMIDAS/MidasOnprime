import dbConnect from "@/utils/DBConnect"; // Adjust path as necessary
import CheckList from "@/model/SubmitChecklist"; // Adjust based on your project structure
import puppeteer from "puppeteer-core"; // Use puppeteer-core
import nodemailer from "nodemailer"; // Ensure nodemailer is installed

const SubmitCheckList = async (req, res) => {
  await dbConnect(); // Connect to the database

  if (req.method !== "POST") {
    return res.status(405).json({
      baseResponse: {
        status: 0,
        message: "Method Not Allowed",
      },
      response: [],
    });
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
    htmlData,
    listName,
    requestTimeOffDate,
    categoryname,
    address,
  } = req.body;

  // Validation: Check if required fields are provided
  if (!email || !firstname || !lastname || !ssn || !dob || !phoneno) {
    return res.status(400).json({
      baseResponse: {
        status: 0,
        message: "Please check your request",
      },
      response: [],
    });
  }

  const newCheckList = new CheckList({
    firstname,
    lastname,
    phoneno,
    email,
    dob,
    ssn,
    references,
    list,
    requestTimeOffDate,
    categoryname,
    address,
  });

  async function createPDF() {
    const browser = await puppeteer.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser", // Use correct path
      headless: true, // Run headless
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(htmlData, { waitUntil: "networkidle0" });

    const pdfPath = `/tmp/${firstname}-${lastname}-${listName}.pdf`; // Save to /tmp
    await page.pdf({ path: pdfPath, format: "A3", printBackground: true });

    await browser.close();
    return pdfPath; // Return the path to the generated PDF file
  }

  async function sendEmail(pdfPath) {
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER, // Use environment variable
        pass: process.env.EMAIL_PASS, // Use environment variable
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Response Received - ${listName} Skills Checklist`,
      attachments: [
        {
          filename: `${firstname}-${lastname}-${listName}.pdf`,
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          reject(error);
        } else {
          await newCheckList.save();
          console.log("Email sent: " + info.response);
          resolve(info.response);
        }
      });
    });
  }

  async function createPDFAndSendEmail() {
    try {
      const pdfPath = await createPDF();
      await sendEmail(pdfPath);
      res.status(200).json({
        baseResponse: {
          status: 1,
          message: "Checklist submitted successfully",
        },
        response: newCheckList,
      });
    } catch (error) {
      console.log("An error occurred:", error);
      res.status(500).json({
        baseResponse: {
          status: 0,
          message: `An error occurred while processing your request: ${error}`,
        },
        response: [],
      });
    }
  }

  // Call the main function to create PDF and send email
  createPDFAndSendEmail();
};

export default SubmitCheckList;
