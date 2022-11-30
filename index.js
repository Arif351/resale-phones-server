const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uvhk0wp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const allBrandsCollection = client.db('cellRoom').collection('allPhonesAndCategory')

        app.get('/allPhones', async (req, res) => {
            const query = {};
            const categories = await allBrandsCollection.find(query).toArray();
            res.send(categories)
        });

        app.get('/allPhones/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const allCategories = await allBrandsCollection.find(query).toArray();
            console.log(allCategories);
            res.send(allCategories)
        })

        // app.get('/allPhones/:id', async (req, res) => {
        //     const query = {};
        //     const categories = await phoneCategoriesCollection.find(query).toArray();
        //     res.send(categories)
        // });
        // app.post('/buyerList', async (req, res) => {
        //     const buyer = req.body;
        //     const result = await buyerCollection.insertOne(buyer);
        //     res.send(result);
        // })

    }
    finally {

    }

}
run().catch(console.log());


app.get('/', async (req, res) => [
    res.send('Assignment 12 server is running')
])
app.listen(port, () => {
    console.log(`Assignment 12 server is runing on ${port}`);
})