const express=require("express")  
const app = express()             
const path=require("path")        
const hbs=require("hbs")          
const { collection1 } = require("./mongodb");
const { collection2 } = require("./mongodb");
const { collection3 } = require("./mongodb");
const { v4: uuidv4 } = require("uuid"); 
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const exphbs  = require('express-handlebars');////
const bodyParser = require('body-parser');
const { Console } = require("console");
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }));
const flaskEndpoint = "http://localhost:5000/submit"; 
const tempelatePath=path.join(__dirname,'../tempelates')  
const static_path=path.join(__dirname, '../public')   
app.use(express.static(static_path))
app.set("view engine","hbs")  
app.set("views",tempelatePath)  

app.use(express.json())  
app.use(express.urlencoded({extended:false}))  

//===================================

const admin = require("firebase-admin");
const { serviceAccountPath, storageBucket } = require("./config");

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: storageBucket,
});

const bucket = admin.storage().bucket();


//const serviceAccount = require("C:\Users\HP\Desktop\chatgptpdf-56247-firebase-adminsdk-pyofm-c57d418cf0.json"); // Replace with the path to your Firebase service account key file
// const serviceAccount = require("C:\\Users\\HP\\Desktop\\chatgptpdf-56247-firebase-adminsdk-pyofm-c57d418cf0.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "chatgptpdf-56247.appspot.com",
// });


//==========================================
app.listen(port,()=>{
    console.log(`port connected and port is running at port no ${port}`);
});

app.get("/",(req,res)=>
{
    res.render("login")
})
app.get("/signup",(req,res)=>
{
    res.render("signup")
})
app.post("/signup", async (req, res) => {
    const userId = uuidv4();

    const data1 = {
      id: userId,  
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };
    
    const data2 = {
        id: userId,
        name: req.body.name,
        email: req.body.email,
        chatHistorys: [],
      };

    const data3 = {
        id: userId,
        name: req.body.name,
        email: req.body.email,
        chatHistorys: [],
    };

    try {
      const user1 = await collection1.create(data1); 
      const user = await collection2.create(data2); 
      const user3 = await collection3.create(data3); 

      res.render("home", { user });   //database 2
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).send("Failed to create a user");
    }
  });
app.post("/login", async (req, res) => {
    try {
        const user1 = await collection1.findOne({ name: req.body.name });
        if (user1.email === req.body.email && user1.password === req.body.password) 
        {
            const uId= user1.id;
            const user = await collection2.findOne({ id: uId });
            res.render("home", { user });
        } else {
            res.send("Wrong email or password");
        }
    } catch {
        res.send("User not found !");
    }
});

//=============================================
const upload = multer();  // Remove storage configuration to prevent local storage

app.post("/submit", upload.single('file'), async (req, res) => {
    const data = {
      query: req.body.query,
      file: req.file,
    };
  
    if (!data.file) {
      console.log("No file uploaded.");
      res.status(400).json({ error: "No file uploaded." });
      return;
    }
  
    try {
      // Upload the file directly to Firebase Storage without saving it locally
      const fileBuffer = data.file.buffer;  // Access the file buffer directly
      const fileBlob = bucket.file(data.file.originalname);
      await fileBlob.save(fileBuffer);
  
      // Get the Firebase Storage URL
      const storageUrl = await fileBlob.getSignedUrl({
        action: "read",
        expires: "01-01-2024", // Adjust the expiration date as needed
      });

      const flaskResponse = await axios.post("http://localhost:5000/submit", {
        query: data.query,
        filePath: storageUrl[0] // Include the file path in the request
      });

      const answerFromFlask = flaskResponse.data;
      console.log("Successful response from Flask:", answerFromFlask);
    
      response = answerFromFlask;
      res.json(response);
    } catch (error) {
      console.error("Error communicating with Flask:", error);
      res.status(500).send("An error occurred while sending the file to Flask.");
    }
});





//=============================================

//=============================================
// 2.
// app.post("/submit", upload.single('file'), async (req, res) => {
//     const data = {
//       query: req.body.query,
//       file: req.file,
//     };
  
//     if (!data.file) {
//       console.log("No file uploaded.");
//       res.status(400).json({ error: "No file uploaded." });
//       return;
//     }
  
//     try {
//       // Upload the file to Firebase Storage
//       const fileBuffer = fs.readFileSync(data.file.path);
//       const fileBlob = bucket.file(data.file.originalname);
//       await fileBlob.save(fileBuffer);
  
//       // Get the Firebase Storage URL
//       const storageUrl = await fileBlob.getSignedUrl({
//         action: "read",
//         expires: "01-01-2024", // Adjust the expiration date as needed
//       });

//     const flaskResponse = await axios.post("http://localhost:5000/submit", {
//         query: data.query,
//         filePath: storageUrl[0] // Include the file path in the request
//     });

//     const answerFromFlask = flaskResponse.data;
//     console.log("Successful response from Flask:", answerFromFlask);
    
//       response = answerFromFlask;
//       res.json(response);
//     } catch (error) {
//       console.error("Error communicating with Flask:", error);
//       res.status(500).send("An error occurred while sending the file to Flask.");
//     }
//   });


//==============================================
// 1.
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/'); 
//     },
//     filename: function (req, file, cb) {
//       const originalname = file.originalname;
//       cb(null, originalname); 
//     },
//   });
  
// const upload = multer({ storage: storage });


// app.post("/submit", upload.single('file'), async (req, res) => {      
//     const data = {
//         query: req.body.query,
//         file: req.file,
//     };

//     if (!data.file) {
//         console.log("No file uploaded.");
//     }
    
//     try 
//     {
//     const flaskResponse = await axios.post(flaskEndpoint, data);
//     answerFromFlask = flaskResponse.data;
//     console.log("Successful response from Flask:", answerFromFlask);
//     response=answerFromFlask
//     res.json(response);

//     } catch (error) 
//     {
//         console.error("Error communicating with Flask:", error);
//         res.status(500).send("An error occurred while sending the file to Flask.");
//     }
// })

app.post("/alreadyExistTitle/:uId/:title", async (req, res) => {
    try {
        const uId = req.params.uId;
        const title = req.params.title;

        const user = await collection2.findOne({ id: uId });

        // Check if chatEntry exists for the given title
        const chatEntry = user && user.chatHistorys.find(entry => entry.title === title);

        if (!chatEntry) {
            res.status(200).json("no"); // Title does not exist
        } else {
            res.status(404).json("yes"); // Title already exists
        }
    } catch (error) {
        console.error('Error while retrieving the saved chat history:', error);
        res.status(500).json("Failed to get saved chat history");
    }
});

app.post("/overrideMessage/:uId/:title", async (req, res) => {
    try {
        const uId = req.params.uId;
        const title = req.params.title;
        const { message } = req.body;

        const user = await collection2.findOne({ id: uId });

        const chatEntry = user && user.chatHistorys.find(entry => entry.title === title);

        if (chatEntry) {
            chatEntry.message = [];

            await user.save();

            const youMessages = message[0];
            const botMessages = message[1];

            const messageCount = Math.min(youMessages.length, botMessages.length);

            for (let i = 0; i < messageCount; i++) {
                chatEntry.message.push({
                    You: youMessages[i],
                    Bot: botMessages[i]
                });
            }

            chatEntry.date = new Date().toLocaleString();
            await user.save();

            res.status(200).json("Message and date modified successfully");
        } else {
            res.status(404).json("Chat entry not found");
        }
    } catch (error) {
        console.error('Error while modifying the chat history:', error);
        res.status(500).json("Failed to modify chat history");
    }
});


app.post("/saveChatHistory/:uId", async (req, res) => {
    try {
        const uId = req.params.uId; 
        const title = req.body.title; 
        const message = req.body.message; 
        //console.log(`Received Title: ${title}, Message: ${message}`);

        const date = new Date();
        const formattedDate = date.toLocaleString();
        console.log(formattedDate)
        
        const youMessages = message[0];
        const botMessages = message[1];

        const chatEntry = {
            date: formattedDate,
            title,
            message: [],
        };

        const messageCount = Math.min(youMessages.length, botMessages.length);

        for (let i = 0; i < messageCount; i++) {
            chatEntry.message.push({
                You: youMessages[i],
                Bot: botMessages[i],
            });
        }
        
        console.log("savedChatHistory  chatEntry : ",chatEntry)
        const user = await collection2.findOne({ id: uId });
        
        if (user) {
            user.chatHistorys.push(chatEntry);
            await user.save();
            console.log(user.chatHistorys[0].message[0].You);
            console.log(user.chatHistorys[0].message[0].Bot);

            user.chatHistorys.forEach((entry) => {
                entry.message.forEach((msg) => {
                    console.log(`You: ${msg.You}, Bot: ${msg.Bot}`);
                });
            });
            
            res.status(200).json("Chat history saved successfully"); 
        } else {
            res.status(404).json("User not found");  
        }
    } catch (error) {
        console.error('Error saving chat history:', error);
        res.status(500).json("Failed to save chat history");
    }
});

app.post("/deleteChat/:uId/:title", async (req, res) => {
    try {
        const uId = req.params.uId;
        const title = req.params.title;

        const user2 = await collection2.findOne({ id: uId });
        if (!user2) {
            return res.status(404).json("User not found in collection2");
        }
        const user3 = await collection3.findOne({ id: uId });
        if (!user3) {
            return res.status(404).json("User not found in collection3");
        }
        const chatEntry = user2.chatHistorys.find(entry => entry.title === title);

        if (chatEntry) 
        {
            await collection3.updateOne(
                { id: uId },
                {
                    $push: {
                        chatHistorys: {
                            date: chatEntry.date,
                            title: chatEntry.title,
                            message: chatEntry.message
                        }
                    }
                }
            );

            await collection2.updateOne(
                { id: uId },
                {
                    $pull: {
                        chatHistorys: { title: title }
                    }
                }
            );

            res.status(200).json("Chat history deleted successfully");
        } else {
            res.status(404).json("Chat history not found" );
        }
    } catch (error) {
        console.error('Error while deleting the chat history:', error);
        res.status(500).json({ error: "Failed to delete chat history", details: error.message });
    }
});


app.post("/clearSidebar/:uId", async (req, res) => {
    try {
        const uId = req.params.uId;
        const user2 = await collection2.findOne({ id: uId });

        if (user2) {
            // Move all chat history entries to collection3
            await collection3.updateOne(
                { id: uId },
                {
                    $push: {
                        chatHistorys: { $each: user2.chatHistorys }
                    }
                }
            );

            // Clear chat history in collection2
            await collection2.updateOne(
                { id: uId },
                { $set: { chatHistorys: [] } }
            );

            res.status(200).json("Chat history cleared successfully");
        } else {
            res.status(404).json("User not found");
        }
    } catch (error) {
        console.error('Error while clearing the chat history:', error);
        res.status(500).json("Failed to clear chat history");
    }
});


app.post("/savedChats/:uId", async (req, res) => {
    try {
        const uId = req.params.uId;         
        
        const user = await collection2.findOne({ id: uId });
        if (user) 
        {
            const chatHistorys = user.chatHistorys;
            chatHistorys.forEach(chatEntry => {
                console.log(`Title: ${chatEntry.title}`);
                chatEntry.message.forEach(message => {
                    console.log(`  You: ${message.You}, Bot: ${message.Bot}`);
                });
            });
            
            res.status(200).json(chatHistorys); 
        } else {
            res.status(404).json("User not found");
        }
    } catch (error) {
        console.error('Error while retrieving the saved chat history:', error);
        res.status(500).json("Failed to get saved chat history");
    }
});

// nodemon src/index.js


// Abhirag Kulkarni11:18 AM
// echo "# aaa" >> README.md
// git init
// git add README.md
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/Abhiragk17/aaa.git
// git push -u origin main
// echo "# aaa" >> README.md
// git init
// git add ./
// git commit -m "first commit"
// git branch -M main
// git remote add origin https://github.com/Abhiragk17/aaa.git
// git push -u origin main




//====================================

// const admin = require("firebase-admin");

// const serviceAccount = require("C:\\Users\\HP\\Desktop\\chatgptpdf-56247-firebase-adminsdk-pyofm-c57d418cf0.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   storageBucket: "chatgptpdf-56247.appspot.com",
// });

// const storageBucket = admin.storage().bucket();


//========================================

// const storage = multer.memoryStorage();
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5 MB limit (adjust as needed)
//   },
// });

// // Your other configurations...

// app.post("/submit", upload.single("file"), async (req, res) => {
//   const data = {
//     query: req.body.query,
//     file: req.file,
//   };

//   if (!data.file) {
//     console.log("No file uploaded.");
//     res.status(400).json({ error: "No file uploaded." });
//     return;
//   }

//   // Use the storageBucket to upload the file to Firebase Storage
//   const storageBucket = admin.storage().bucket();
//   const fileBucket = storageBucket.file(data.file.originalname);
//   const stream = fileBucket.createWriteStream({
//     metadata: {
//       contentType: data.file.mimetype,
//     },
//     resumable: false,
//   });

//   stream.on("error", (error) => {
//     console.error("Error uploading to Firebase Storage:", error);
//     res.status(500).json({ error: "Error uploading to Firebase Storage." });
//   });

//   stream.on("finish", async () => {
//     console.log("File uploaded to Firebase Storage.");

//     // After uploading the file, send the data to Flask for processing
//     try {
//       const flaskResponse = await axios.post("http://localhost:5000/submit", {
//         query: data.query,
//         file: {
//           originalname: data.file.originalname,
//         },
//       });

//       const answerFromFlask = flaskResponse.data;
//       console.log("Successful response from Flask:", answerFromFlask);

//       response=answerFromFlask
//       res.json(response);

//     } catch (error) {
//       console.error("Error communicating with Flask:", error);
//       res
//         .status(500)
//         .send("An error occurred while processing the file with Flask.");
//     }
//   });

//   stream.end(data.file.buffer);
// });
