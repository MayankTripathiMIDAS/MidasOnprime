const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");
const mongooseserial = require("mongoose-serial");

const AuthSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  password: String,
  managerId: String || Number,
  managerName: String,
  roleId: String || Number,
  status: String || Number,
  refreshToken: String,
  accessToken: String,
});

autoIncrement.initialize(mongoose.connection);
AuthSchema.plugin(mongooseserial, { field: "id", digits: 2 });

const Auth = new mongoose.model("User", AuthSchema);
module.exports = Auth;
