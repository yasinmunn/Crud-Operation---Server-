const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 9000;
const app = express()
const corsOptions = {
    origin: [true, 'http://localhost:5173/', 'http://localhost:5174/'],
    credentials: true,
    optionSuccessStatus: 200,

}
app.use(cors(corsOptions));
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bqxtqvh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const jobsCollection = client.db('solosphere').collection('jobs');
        const bidsCollection = client.db('solosphere').collection('bids');

        // Get All Jobs Data From DB

        app.get('/jobs', async (req, res) => {
            const result = await jobsCollection.find().toArray()

            res.send(result)
        })
        //Save a bid data in db
        app.post('/bid', async (req, res) => {
            const bidData = req.body
            const result = await bidsCollection.insertOne(bidData)
            res.send(result)
        })
        //Save a job data in db
        app.post('/job', async (req, res) => {
            const jobData = req.body
            const result = await jobsCollection.insertOne(jobData)
            res.send(result)
        })

        // Get a single job data from db using job id 

        app.get('/job/:id', async (req, res) => {
            const id = req.params.id
            // const query = {_id: new ObjectId(id)}
            const result = await jobsCollection.findOne({ _id: new ObjectId(id) })
            res.send(result)
        })

        // Get All Jobs Posted Data By User Email 
        app.get('/jobs/:email', async (req, res) => {
            const email = req.params.email
            const result = await jobsCollection.find({ 'buyer.email': email }).toArray()
            res.send(result)

        })
        //Update job Data
        app.put('/job/:id', async (req, res) => {
            const id = req.params.id;
            const jobData = req.body;
            const result = await jobsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: jobData },
                { upsert: true }
            );
            res.send(result);
        })


        //  Delete Operation
        app.delete('/job/:id', async (req, res) => {
            const id = req.params.id;
            const result = await jobsCollection.deleteOne({ _id: new ObjectId(id) });
            console.log(id)
            res.json(result);
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello From SoloSphere Server.....')
})

app.listen(port, () => console.log(`Server running on port ${port} `))



