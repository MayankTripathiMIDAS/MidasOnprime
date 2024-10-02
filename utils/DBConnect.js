import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://Mayank:Mayank12@legal-crm.wsfzr5m.mongodb.net/Legal-CRM-onprime?retryWrites=true&w=majority", // Removed MONGODB_URI=
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("DB is connected");
  } catch (err) {
    console.error("DB connection error:", err);
  }
};

export default dbConnect;
