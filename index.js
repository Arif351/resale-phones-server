const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uvhk0wp.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const allBrandsCollection = client.db('cellRoom').collection('allPhonesAndCategory');
        const bookingsCollection = client.db('cellRoom').collection('bookingPhones');
        const usersCollection = client.db('cellRoom').collection('usersCollection');
        const addProductCollection = client.db('cellRoom').collection('AddedProduct')
        const blogCollection = client.db('cellRoom').collection('blog');

        function verifyJWT(req, res, next) {
            console.log('token inside', req.headers.authorization);
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).send('Unauthorized access.')
            }
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
                if (err) {
                    return res.status(403).send({ message: 'forbidden access' })
                }
                req.decoded = decoded;
                next();
            })

        }

        app.get('/allPhones', async (req, res) => {
            const query = {};
            const categories = await allBrandsCollection.find(query).toArray();
            res.send(categories)
        });

        app.get('/allPhones/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const allCategories = await allBrandsCollection.find(query).toArray();
            res.send(allCategories)
        });

        app.get('/buyers', async (req, res) => {
            const query = {};
            const buyers = await usersCollection.find(query).toArray();
            res.send(buyers)
        });

        app.get('/buyers/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const buyerAdmin = await usersCollection.findOne(query);
            res.send({ isAdmin: buyerAdmin?.role === 'admin' })
        })

        app.put('/buyers/admin/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail }
            const user = await usersCollection.findOne(query)
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options)
            res.send(result);
        })

        app.get('/blog', async (req, res) => {
            const query = {};
            const blogsAnswer = await blogCollection.find(query).toArray();
            res.send(blogsAnswer)
        })

        app.post('/bookings', async (req, res) => {
            const bookings = req.body
            console.log(bookings);
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result);
            console.log(result);
        });

        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const query = { email: email }
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.send(result)
        })

        app.post('/addProduct', async (req, res) => {
            const product = req.body;
            const result = await addProductCollection.insertOne(product);
            console.log(result);
            res.send(result)
        })

        app.get('/myProductList', async (req, res) => {
            const query = {};
            const addedProductFind = await addProductCollection.find(query).toArray();
            res.send(addedProductFind)
        })

        app.get('/seller', (req, res) => {

        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '8h' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })

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