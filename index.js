const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
app.use(express.json())
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.3dmu96c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const Borders = client.db("Mess-Manager").collection("Borders")
    const Cost = client.db("Mess-Manager").collection("Cost")

    app.post("/addborder", async (req, res) => {
      const border = req.body;
      // console.log(border);
      const result = await Borders.insertOne(border)
      res.send(result);
    })
    app.get("/allborders", async (req, res) => {
      // const name = req?.query?.name;
      const Creatoremail = req?.query?.creatoremail;
      // console.log( "38", Creatoremail)
      let query = {}
      if (Creatoremail) {
        query = {
          creatorEmail: Creatoremail
        }
      }
      const result = await Borders.find(query).toArray()
      res.send(result);
    })

    app.get("/addmoneyspecific", async (req, res) => {
      const userEmail = req.query?.useremail;
      // console.log(userEmail);
      let filter = {};
      let query = {}
      if (userEmail) {
        filter = { borderEmail: userEmail };
      }
      const result1 = await Borders.findOne(filter)
      const creatorMail = result1?.creatorEmail
      if (!creatorMail) {
        return res.send([])
      }
      query = { creatorEmail: creatorMail }
      const result = await Borders.find(query).toArray();
      res.send(result);
      // console.log(result1, result1?.creatorEmail);
    })

    app.get("/crteatormess", async (req, res) => {
      const creatoremail = req.query?.email;
      let query = {}
      if (creatoremail) {
        query = {
          creatorEmail: creatoremail,
          role: "creator"
        }
      }
      const result = await Borders.find(query).toArray();
      res.send(result);
    })
    app.get("/borderone/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      let query = {};
      if (id) {
        query = { _id: new ObjectId(id) }
      }
      const result = await Borders.find(query).toArray();
      res.send(result);
    })
    app.get("/bordercount", async (req, res) => {
      const userMail = req?.query?.borderMail;
      let filter = {}
      let query = {};
      if (userMail) {
        filter = { borderEmail: userMail }
      }
      const result1 = await Borders.findOne(filter);
      const creatorMailOfUser = result1?.creatorEmail;
      if (creatorMailOfUser) {
        query = { creatorEmail: creatorMailOfUser }
      }
      const count = await Borders.countDocuments(query);
      res.send({ count });
    })
    app.get("/totalcost", async (req, res) => {
      let totalCost = 0;
      const borderMail = req?.query?.userMail;
      let filter = {}
      let query = {}
      if (borderMail) {
        filter = { borderEmail: borderMail }
      }
      const result1 = await Cost.findOne(filter);
      const creatorMailOfUser = result1?.creatorEmail;
      if (creatorMailOfUser) {
        query = { creatorEmail: creatorMailOfUser }
      }
      // console.log(borderMail,creatorMailOfUser, result1);
      const result = await Cost.find(query).toArray();
      result.forEach(cost => totalCost += parseFloat(cost?.costAmount))
      res.send(totalCost)
    })
    app.put("/costupdate/:id", async (req, res) => {
      const Id = req.params.id;
      const cost = req.body;
      const query = { _id: new ObjectId(Id) };
      // const thisCost = await Cost.findOne(query);
      // console.log(Id, cost,thisCost, cost);

      const updateDocument = {
        $set: {
          product: cost.product,
          costAmount: cost.costAmount,
          modify: {
            isModify: cost.isModify,
            modifyPerson: cost.modifyPerson,
            modifyTime: cost.modifyTime
          }
        }
      }
      const result = await Cost.updateOne(query, updateDocument);
      res.send(result);

    })
    app.delete("/deleteborder/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      let query = {}
      if (id) {
        query = { _id: new ObjectId(id) };
      }
      const result = await Borders.deleteOne(query)
      res.send(result);
    })
    app.delete("/deletemess/:id", async (req, res) => {
      const Id = req.params.id;
      let query = {};
      let filter = {};
      if (Id) {
        query = { _id: new ObjectId(Id) }
      }
      const result1 = await Borders.findOne(query);
      const creatorMail = result1?.creatorEmail;
      if (creatorMail) {
        filter = { creatorEmail: creatorMail }
      }
      const result = await Borders.deleteMany(filter)
      const result2 = await Cost.deleteMany(filter)
      res.send(result);
      console.log(result, result2);
    })

    app.put("/addblance/:id", async (req, res) => {
      const Id = req.params.id;
      const blance = req.body;
      const query = { _id: new ObjectId(Id) };
      const findDoc = await Borders.findOne(query);
      const priviousAccount = findDoc.account || {};
      const updateAccountDoc = { ...priviousAccount, ...blance }
      const updateDocument = {
        $set: {
          account: updateAccountDoc
        }
      }
      const result = await Borders.updateOne(query, updateDocument);
      res.send(result);

    })
    app.post("/addcost", async (req, res) => {
      const costData = req.body;
      const BorderEmail = req.query?.borderUserEmail
      // const borderemail = costData?.borderEmail; // same as BorderEmail
      let filter = {}
      if (BorderEmail) {
        filter = { borderEmail: BorderEmail }
      }
      const result1 = await Borders.findOne(filter);
      const creatorEmail = result1?.creatorEmail;
      const newCostData = { ...costData, creatorEmail }
      const result = await Cost.insertOne(newCostData)
      res.send(result);
      // console.log(costData, newCostData,BorderEmail)

    })
    app.get("/allcost", async (req, res) => {
      const bordermMail = req.query?.borderMail;
      console.log(bordermMail);
      let filter = {};
      let query = {}
      if (bordermMail) {
        filter = { borderEmail: bordermMail }
      }
      const result1 = await Cost.findOne(filter);
      const creatorMail = result1?.creatorEmail || "";
      if (!creatorMail) {
        return res.send([])
      }
      query = { creatorEmail: creatorMail }
      const result = await Cost.find(query).toArray();
      res.send(result);
    })
    app.get("/costone/:id", async (req, res) => {
      const Id = req.params.id;
      // console.log(Id)
      let query = {};
      if (Id) {
        query = { _id: new ObjectId(Id) };
      }
      const result = await Cost.findOne(query);
      res.send(result);
    })
    app.put("/costedit/:id", async (req, res) => {
      const Id = req.params?.id;
      const query = { _id: new ObjectId(Id) };
      const costData = await Cost.findOne(query ? query : {});

      console.log(costData)
    })
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("messManager server is running");
})
app.listen(port, () => {
  console.log(`messManager server is running on port: ${port}`);
})



