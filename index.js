const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.Port || 5000;


const app = express()

// middleware
// app.use(cors());
// app.use(express.json());
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://foods-master-487ce.web.app',
  ],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

// verify jwt middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token
  if (!token) return res.status(401).send({ message: 'unauthorized access' })
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log(err)
        return res.status(401).send({ message: 'unauthorized access' })
      }
      console.log(decoded)

      req.user = decoded
      next()
    })
  }
}


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




    //jwt

    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '365d',
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })

    app.get('/logout', (req, res) => {
      res
        .clearCookie('token', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          maxAge: 0,
        })
        .send({ success: true })
    })






//featuredFoods


    const featuredFoodsCollection = client.db('fooddb').collection('featuredFoods')

    app.get('/featuredFoods', async (req, res) => {
      const result = await featuredFoodsCollection.find().toArray()
      res.send(result)
    })

    // app.get('/food/:id', async (req, res) => {
    //   const id = req.params.id
    //   const query = { _id: new ObjectId(id) }
    //   const result = await featuredFoodsCollection.findOne(query)
    //   res.send(result)
    // })

    app.get('/singleDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await featuredFoodsCollection.findOne(query);
      res.send(result);
    })










    //user Data

    const userCollection = client.db('fooddb').collection('userData');


    app.get('/userData/:email', verifyToken, async (req, res) => {
      const tokenEmail = req.user.email
      const email = req.params.email
      if (tokenEmail !== email) {
        return res.status(403).send({ message: 'forbidden access' })
      }
      const query = { 'postOwner.email': email }
      const result = await userCollection.find(query).toArray()
      res.send(result)
    })


    app.post('/userData', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });


    app.put('/updateData/:id', verifyToken, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedFood = req.body;

      const tourSpot = {
        $set: {
          foodImage: updatedFood.foodImage,
          foodName: updatedFood.foodName,
          foodQuantity: updatedFood.foodQuantity,
          expiredDate: updatedFood.expiredDate,

        }
      }
      const result = await userCollection.updateOne(filter, tourSpot, options);
      res.send(result);
    })

    app.delete('/deleteData/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/availableSingleFoodDetails/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.findOne(query);
      res.send(result);
    })

























    // Get all jobs data from db for sorting and search
    app.get('/userData', async (req, res) => {
      const sort = req.query.sort
      const search = req.query.search
      let query = {
        // foodName: { $regex: search, $options: 'i' },
      }
      let options = {}
      if (sort) options = { sort: { expiredDate: sort === 'asc' ? 1 : -1 } }
      const result = await userCollection.find(query, options).toArray()

      res.send(result)
    })





















    //request Data
    const reqCollection = client.db('fooddb').collection('reqData');

    app.post('/reqData', async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await reqCollection.insertOne(user);
      res.send(result);
    });

    app.get('/reqData/:email', verifyToken, async (req, res) => {
      const email = req.params.email
      const query = { 'postOwner.email': email }
      const result = await reqCollection.find(query).toArray()
      res.send(result)
    })

    app.get('/reqData', async (req, res) => {
      const cursor = reqCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.delete('/deleteData/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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