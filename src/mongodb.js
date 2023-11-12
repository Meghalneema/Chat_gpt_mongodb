const mongoose = require("mongoose");

// Connect to the first database
const db1 = mongoose.createConnection("mongodb://localhost:27017/LoginSign");
db1.on("open", () => {
  console.log("Connected to the LoginSign database");
});
db1.on("error", (err) => {
  console.log("Failed to connect to the LoginSign database", err);
});

// const uniqueId = uuidv4();

const LogInSchema = new mongoose.Schema({
  id:{
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }  
});

const collection1 = db1.model("collection1", LogInSchema);

//=========================================================================
const db2 = mongoose.createConnection("mongodb://localhost:27017/chatHistoryData");
db2.on("open", () => {
  console.log("Connected to the chatHistoryData database");
});
db2.on("error", (err) => {
  console.log("Failed to connect to the chatHistoryData database", err);
});

const chatHistoryData = new mongoose.Schema({
  id:{
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  chatHistorys: [{
    date: String,
    title: String,
    message: [{
      You:String,
      Bot: String
    }]
  }]
});

const collection2 = db2.model("collection2", chatHistoryData);


//=========================================================================
const db3 = mongoose.createConnection("mongodb://localhost:27017/deletedHistory");
db3.on("open", () => {
  console.log("Connected to the deletedHistory database");
});
db3.on("error", (err) => {
  console.log("Failed to connect to the deletedHistory database", err);
});

const deletedHistory = new mongoose.Schema({
  id:{
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  chatHistorys: [{
    date: String,
    title: String,
    message: [{
      You:String,
      Bot: String
    }]
  }]
});

const collection3 = db3.model("collection3", deletedHistory);

module.exports = {
  collection1,
  collection2,
  collection3,
};











// module.exports=collection2

// module.exports=collection1

// =============================================================================================
// const mongoose=require("mongoose")

// mongoose.connect("mongodb://localhost:27017/LoginSign")
// .then(()=>
// {
//     console.log("mongodb connected successfully")
// })
// .catch(()=>
// {
//     console.log("mongodb failed to connected ")
// })

// const LogInSchema=new  mongoose.Schema({
//     name:{
//         type:String,
//         require:true
//     },
//     email:{
//         type:String,
//         require:true,
//         unique:true
//     },
//     password:{
//         type:String,
//         require:true
//     },
//     chatHistory: [{
//         date: Date,
//         title: String,
//         message: String
//     }]
// })

// const collection=new mongoose.model("collection",LogInSchema)

// module.exports=collection

// ===================================================