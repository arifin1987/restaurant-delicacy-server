const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.59h68ks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const menuCollection = client.db("restaurantDelicacy").collection("menu");
    const userCollection = client.db("restaurantDelicacy").collection("users");
    const reviewCollection = client.db("restaurantDelicacy").collection("reviews");
    const cartCollection = client.db("restaurantDelicacy").collection("carts");


    // jwt related api
    app.post('/jwt', async(req,res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
      });
      res.send({token});
    })
    // middlewares
    const verifyToken = (req,res, next)=>{
      console.log('inside verify token', req.headers);
      if(!req.headers.authorization){
        return res.status(401).send({message: 'unauthorized access'});
      }
      const token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(error,decoded)=>{
        if(error){
          return res.status(401).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next();
      })
    }
    // use verify admin after verifyToken
    // req.decoded.email can found cause this middleware is after verifyToken
      const verifyAdmin = async(req,res, next)=>{
      const email = req.decoded.email;
      const query = {email: email};
      const user =  await userCollection.findOne(query);
      const isAdmin = user?.role === 'admin';
      if(!isAdmin){
        return res.status(403).send({message: 'forbidden access'});
      }
      next();
    }

    // users related api
    
    // get users data from the database
      app.get('/users',verifyToken,verifyAdmin, async(req,res)=>{
      console.log(req.headers.authorization)
      const result = await userCollection.find().toArray();
      
      res.send(result);
    })
    // this will find whether the user is a admin or not
    app.get('/users/admin/:email', verifyToken, async(req,res)=>{
      const email = req.params.email;
      // from req.decoded we will get email because in AuthProvider.jsx while sending userInfo to jwt we set email there
      if(email !== req.decoded.email){
        return res.status(403).send({message: 'forbidden access'})
      }
      const query = {email : email};
      const user = await userCollection.findOne(query);
      let admin = false;
      if(user){
        admin = user?.role === 'admin';
      }
      res.send({admin});
    })
    // post users data form client side
    app.post('/users', async(req,res)=>{
      const user = req.body;
      // insert email if user doesn't exists:
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query);
      if(existingUser){
        return res.send ({message: 'user already exists', insertedId: null})
      }
      const result = await userCollection.insertOne(user);
      res.send(result);

    })
    

    app.delete('/users/:id',verifyToken, verifyAdmin, async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })
    // this will make the user as a admin
    app.patch('/users/admin/:id',verifyToken,verifyAdmin, async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
      $set: {
        role: 'admin'
      },
    };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send(result);
    })

    // menu collection
    app.get('/menu', async (req,res)=>{
      const result =await menuCollection.find().toArray();
      res.send(result);
    })
    // reviews collection
    app.get('/reviews', async(req,res)=>{
      const result =await reviewCollection.find().toArray();
      res.send(result);
    })
    // Carts related api
    app.post('/carts', async(req,res)=>{
      const item = req.body;
      const result = await cartCollection.insertOne(item)
      res.send(result);
    })

    app.get('/carts', async(req,res)=>{
      const email = req.query.email;
      const query = {email: email};
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })
    app.delete('/carts/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await cartCollection.deleteOne(query);
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



app.get('/', (req,res)=>{
    res.send('restaurant delicacy server')
})

app.listen(port, ()=>{
    console.log(`Restaurant delicacy server is running on port ${port}`);
})