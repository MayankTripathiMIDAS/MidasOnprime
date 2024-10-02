// pages/api/getChecklist.js

import dbConnect from "../../utils/DBConnect"; // Ensure you adjust this path as needed
import checklistJson from "@/model/Cretechecklist"; // Adjust the path based on your project structure

const getCreatedChecklist = async (req, res) => {
  await dbConnect(); // Connect to the database

  try {
    const getAll = await checklistJson.find({});
    console.log("getAll:", getAll);

    if (getAll.length > 0) {
      res.status(200).json({
        baseResponse: { message: "Fetched JSON", status: 1 },
        response: getAll,
      });
    } else {
      res
        .status(200)
        .json({ baseResponse: { message: "No data found", status: 0 } });
    }
  } catch (error) {
    console.error("Error fetching checklists:", error.message); // Log the error message
    console.error("Error stack:", error.stack); // Log the stack trace
    res
      .status(500)
      .json({ baseResponse: { message: error.message, status: 0 } });
  }
};

export default getCreatedChecklist;
