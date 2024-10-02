import mongoose from "mongoose";

const ChecklistSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  phoneno: Number,
  email: String,
  categoryname: String,
  dob: String,
  ssn: Number,
  references: Array,
  listName: String,
  type: String,
  sentby: String,
  list: Array,
  requestTimeOffDate: Object,
  address: String,
  senderMail: String,
});

const CheckList = mongoose.model("CheckList", ChecklistSchema);
export default CheckList;
