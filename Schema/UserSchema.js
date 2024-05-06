import mongoose from "mongoose";
const SchemaModel = new mongoose.Schema({
  email: {
    required: [true, "Please input a valid email address"],
    trim: true,
    unique: true,
    type: String,
  },
  verified: {
    required: true,
    type: Boolean,
    default: false,
  },
  password: {
    required: [true, "Please input a password"],
    type: String,
  },
});
const userModel = mongoose.model("User Model", SchemaModel);
export default userModel;
