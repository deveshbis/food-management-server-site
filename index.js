const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.Port || 5000;


const app = express()

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.95g0ypv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const featuredFoodsCollection = client.db('fooddb').collection('featuredFoods')

    app.get('/featuredFoods', async (req, res) => {
      const result = await featuredFoodsCollection.find().toArray()
      res.send(result)
    })

    app.get('/food/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await jobsCollection.findOne(query)
      res.send(result)
    })


    //user Data

    const userCollection = client.db('fooddb').collection('userData');

    app.get('/userData', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
  })

    app.post('/userData', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
  });

  app.delete('/deleteData/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await userCollection.deleteOne(query);
    res.send(result);
})
























  //sort
  app.get('/userData', async (req, res) => {
    const size = parseInt(req.query.size)
    const page = parseInt(req.query.page) - 1
    const filter = req.query.filter
    const sort = req.query.sort
    const search = req.query.search
    console.log(size, page)

    let query = {
      card_title: { $regex: search, $options: 'i' },
    }
    if (filter) query.category = filter
    let options = {}
    if (sort) options = { sort: { expiredDate: sort === 'asc' ? 1 : -1 } }
    const result = await userCollection
      .find(query, options)
      .skip(page * size)
      .limit(size)
      .toArray()

    res.send(result)
  })



  // app.get('/userData', async (req, res) => {
  //   const { sort, search } = req.query;
    
  //   try {
  //     let query = {
  //       job_title: { $regex: search, $options: 'i' },
  //     };
      
  //     let options = {};
  //     if (sort) {
  //       options.sort = { expiredDate: sort === 'asc' ? 1 : -1 };
  //     }
      
  //     const userData = await User.find(query, null, options);
  //     res.json(userData);
  //   } catch (error) {
  //     console.error('Error fetching user data:', error);
  //     res.status(500).json({ error: 'Internal server error' });
  //   }
  // });
 























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
    res.send('Hello from Foods Server....')
  })
app.listen(port, () => console.log(`Server running on port ${port}`))