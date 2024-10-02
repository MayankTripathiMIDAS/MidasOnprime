import mongoose from "mongoose";
import listitems from "./checklistfields.js";

const newChecklist = new mongoose.Schema({
  Listname: String,
  list: [listitems],
});

const checklistJson = mongoose.model("newchecklist", newChecklist);
export default checklistJson;
