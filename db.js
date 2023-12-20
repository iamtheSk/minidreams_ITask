const mongoose = require("mongoose");

const DB = "mongodb://127.0.0.1:27017/notesdb";

module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
  };
  try {
    mongoose.connect(DB, connectionParams);
    console.log("Mongo is Connected");
  } catch (error) {
    console.log("Could not connect to database");
    console.log(error)
  }
};
