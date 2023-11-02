const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


console.log(process.env.DB_USER)
console.log(process.env.DB_PASS)



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ygezfuj.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const productCollection = client.db("productDB").collection("product");
        const cartCollection = client.db('productDB').collection("cart");


        app.get('/product', async (req, res) => {
            const cursor = productCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })


        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result);
        })

        app.get("/product/brand/:brand", async( req,res ) =>{
            const brand = req.params.brand;
            console.log(brand)
            const result = await productCollection.find({brand}).toArray()
            console.log(result)
            res.send(result)
        })

        // app.get("/product/brand_name/brand_name/:brand_name", async( req,res ) =>{
        //     const brand_name = req.params.brand_name;
        //     const result = await productCollection.find({brand_name}).toArray()
        //     console.log(result)
        //     res.send(result)
        // })


        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })


        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateProduct =req.body;
            const updated = {
                $set: {
                     name: updateProduct.name,
                     brand: updateProduct.brand,
                     type: updateProduct.type,
                     description: updateProduct.description,
                     price: updateProduct.price,
                     rating: updateProduct.rating,
                     photo: updateProduct.photo,
                }
            }

            const result = await productCollection.updateOne(filter, updated, options);
            res.send(result);
        })

        app.get("/cart/:email", async( req,res ) =>{
            const email = req.params.email
            const result = await cartCollection.find({email}).toArray()
            res.send(result)
        })

        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/cart', async (req, res) => {
            const newProduct = req.body;
            delete newProduct._id
            console.log(newProduct);
            const result = await cartCollection.insertOne(newProduct);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('fashion apparel is running')
})

app.listen(port, () => {
    console.log(`fashion server is running on port: ${port}`)
})