require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const cors = require('cors')




const stripe = require("stripe")(process.env.key)

const port = process.env.PORT || 5000

//middlewares
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hblj92w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const usersCollection = client.db("Project-12").collection("users");
        const petsCollection = client.db("Project-12").collection("pets");
        const adoptionCollection = client.db("Project-12").collection("adopt");
        const donationCollection = client.db("Project-12").collection("donation");
        const howCollection = client.db("Project-12").collection("doantionsData");

        //middlewares
        const verifyToken = (req, res, next) => {
            console.log(req.headers.authorization);

            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'forbidden access' })
            }
            const token = req.headers.authorization.split(' ')[1]
            jwt.verify(token, process.env.ACCESS_TOkEN, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: 'unauthorized access' })
                }
                req.decoded = decoded
                next()
            })


        }
        //veriyfy admin
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            const isAdmin = user?.role === 'admin'
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next()
        }
        //jwt
        app.post('/jwt', async (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOkEN, { expiresIn: '1h' })
            res.send({ token })
        })

        app.get('/pets', async (req, res) => {
            const result = await petsCollection.find().toArray()
            res.send(result)

        })
        //add pet
        app.post('/pets', async (req, res) => {
            const item = req.body
            const result = await petsCollection.insertOne(item)
            res.send(result)
        })
        //delete a pet
        app.delete('/petDelete/:id', verifyToken, async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await petsCollection.deleteOne(query)
            res.send(result)
        }),
            //update adoption data 
            app.patch('/petAdopted/:id', async (req, res) => {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const updateDoc = {
                    $set: {
                        adopted: true
                    }
                };
                const result = await petsCollection.updateOne(filter, updateDoc);
                res.send(result);
            });
        //update my peats
        app.patch('/pets/:id', async (req, res) => {
            const id = req.params.id;
            const updatedate = req.body
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: updatedate
            }
            const result = await petsCollection.updateOne(query, update);
            res.send(result);
        });

        app.get('/donation', async (req, res) => {
            const result = await donationCollection.find().toArray()
            res.send(result)

        })
        app.delete('/donation/:id', verifyToken, async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await donationCollection.deleteOne(query)
            res.send(result)
        }),
        app.patch('/donation/:id', async (req, res) => {
            const id = req.params.id;
            const updatedate = req.body
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: updatedate
            }
            const result = await donationCollection.updateOne(query, update);
            res.send(result);
        });
        app.patch('/donation/user/:id', async (req, res) => {
            const id = req.params.id;
            const updatedate = req.body
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: updatedate
            }
            const result = await donationCollection.updateOne(query, update);
            res.send(result);
        });
        app.post('/donation', async (req, res) => {
            const item = req.body
            const result = await donationCollection.insertOne(item)
            res.send(result)
        })
        app.get('/donation/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await donationCollection.findOne(query);
            res.send(result);
        })
        app.get('/pets/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await petsCollection.findOne(query);
            res.send(result);
        }),
            //delet pet admin
            app.delete('/delete/pets/:id', async (req, res) => {
                const id = req.params.id
                const query = { _id: new ObjectId(id) }
                const result = await petsCollection.deleteOne(query)
                res.send(result)
            })
        app.post('/adopt/pet', async (req, res) => {
            const item = req.body
            const result = await adoptionCollection.insertOne(item)
            res.send(result)
        })
        //get adopt data
        app.get('/getAdoptPet', async (req, res) => {
            const result = await adoptionCollection.find().toArray()
            res.send(result)
        })
        //delete a data pet
        app.delete('/delete/adopt/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await adoptionCollection.deleteOne(query)
            res.send(result)
        })
        app.patch('/adopted/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    adopted: true
                }
            };
            const result = await adoptionCollection.updateOne(filter, updateDoc);
            res.send(result);
        });
        //update donation amount
        app.post('/update/donation/:id', async (req, res) => {
            const id = req.params.id
            const newDonation = req.body.amount
            const query = { _id: new ObjectId(id) }
            const update = {
                $inc: {
                    donatedAmount: newDonation
                }
            }
            const result = await donationCollection.updateOne(query, update)
            res.send(result)
        })
        //how donated
        app.post('/how/donated', async (req, res) => {
            const item = req.body
            const result = await howCollection.insertOne(item)
            res.send(result)
        })
        app.delete('/donater/refund/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await howCollection.deleteOne(query)
            res.send(result)
        }),
        //get donater info
        app.get('/donater/data', async (req, res) => {
            const result = await howCollection.find().toArray()
            res.send(result)
        })
        //check admin
        app.get('/users/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email
            if (email !== req.decoded.email) {
                return res.status(403).send({ message: 'forbiden access' })
            }

            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let admin = false
            if (user) {
                admin = user?.role === 'admin'
            }
            res.send({ admin })
        })
        //get user
        app.get('/users', verifyToken, verifyAdmin, async (req, res) => {

            const result = await usersCollection.find().toArray()
            res.send(result)
        })
        //create user
        app.post('/users', async (req, res) => {
            const user = req.body
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: "user Already exists", insertedID: null })
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })
        //admin create
        app.patch('/users/admin/:id', verifyToken, verifyAdmin, async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const role = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(query, role)
            res.send(result)
        })
        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;

            // Ensure that the amount is greater than the minimum allowed
            const MIN_AMOUNT = 50; // Assuming $0.50 as minimum amount for USD, Stripe expects amount in cents

            if (price < MIN_AMOUNT) {
                return res.status(400).json({ error: 'Amount must be at least $0.50' });
            }

            try {
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: price,
                    currency: 'usd',
                    payment_method_types: ['card'],
                });

                res.send({
                    clientSecret: paymentIntent.client_secret,
                });
            } catch (error) {
                console.log('Error creating payment intent:', error);
                res.status(500).json({ error: error.message });
            }
        });

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
    res.send('project setting')
})

app.listen(port, () => {
    console.log(`Project-12 ${port}`);

})