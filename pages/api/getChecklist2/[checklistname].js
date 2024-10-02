import dbConnect from "@/utils/DBConnect"; // Adjust path as necessary
import checklistJson from "@/model/Cretechecklist"; // Adjust the path based on your project structure

const GetCheckList = async (req, res) => {
  const queryParams = req.query;
  console.log("queryParams", queryParams);

  // Access the checklist item name from the query params
  const checklistitemname = queryParams.checklistname;
  await dbConnect(); // Connect to the database

  // Validate the parameter
  if (!checklistitemname) {
    return res.status(400).json({
      baseResponse: {
        status: 0,
        message: "Checklist item name is required",
      },
      response: [],
    });
  }

  try {
    console.log("req", req);
    console.log("checklistitemname:", checklistitemname);

    // Fetch all checklists
    const findChecklist = await checklistJson.find({}).lean();

    // Filter the checklist based on the name provided in the request
    const returnJson = findChecklist.filter(
      (item) => item.Listname === checklistitemname
    );
    console.log("returnJson:", returnJson);

    if (returnJson.length > 0) {
      res.status(200).json({
        baseResponse: {
          status: 1,
          message: "Json Found Successfully",
        },
        response: returnJson, // Always return an array
      });
    } else {
      res.status(404).json({
        baseResponse: {
          status: 0,
          message: "No Json Found with the given name",
        },
        response: [],
      });
    }
  } catch (error) {
    console.error("Error fetching checklist:", error);
    res.status(500).json({
      baseResponse: {
        status: 0,
        message: "Internal Server Error",
      },
      response: [],
    });
  }
};

export default GetCheckList;
