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
      const name = req?.query?.name;
      let query = {}
      if (name) {
        query = { borderName: name }
      }
      const result = await Borders.find(query).toArray()
      res.send(result);
    })
    app.get("/bordercount", async(req,res) =>{
      const count = await Borders.estimatedDocumentCount();
      res.send({count});
    })
    app.get("/totalcost", async(req,res) =>{
      let totalCost = 0;
      const result = await Cost.find().toArray();
      result.forEach(cost => totalCost += parseFloat(cost?.costAmount))
      res.send(totalCost)
    })
    app.put("/costupdate/:id", async(req,res)=>{
      const Id = req.params.id;
      const cost = req.body;
      const query = {_id: new ObjectId(Id)};
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
      const query = { _id: new ObjectId(id) };
      const result = await Borders.deleteOne(query)
      res.send(result);
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
      const result = await Cost.insertOne(costData)
      res.send(result);
      // console.log(costData)

    })
    app.get("/allcost", async (req, res) => {
      const result = await Cost.find().toArray();
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
      const Id = req.params.id;
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



