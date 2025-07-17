const express = require('express');
const cors = require('cors');
const app = express()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const Stripe = require('stripe');
require('dotenv').config()
const stripe = Stripe(process.env.STRIP_KEY);

app.use(cors({
  origin: ['http://localhost:5173','https://medicamp-ce784.web.app' ],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
}))
app.use(express.json())



const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).send({ message: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  console.log(token);
  

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(403).send({ message: 'Forbidden' });

    req.decoded = decoded; 
    next();
  });
};





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eqhhjdx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();

        const campsCollection = client.db('mediCampDB').collection('camps')
        const usersCollection = client.db('mediCampDB').collection('users')
        const participantCollection  = client.db('mediCampDB').collection('participant')
        const feedbackCollection  = client.db('mediCampDB').collection('feedback')

      
      
      // * JWT      
      app.post('/jwt', async (req, res) => {
        const user = req.body; 
        const token = jwt.sign(user, process.env.JWT_ACCESS_SECRET, { expiresIn: '1h' });
        res.send({ token });
      });




      // * All operations for camps
      app.post('/camps', async (req, res) => {
          try {
            const campData = req.body;

            // Optional validation
            if (!campData.name || !campData.imageUrl || !campData.sortingTime) {
              return res.status(400).json({ error: 'Missing required fields' });
            }

            const result = await campsCollection.insertOne(campData);

            res.status(201).json({
              message: 'Camp added successfully',
              insertedId: result.insertedId,
            });
          } catch (error) {
            console.error('Error inserting camp:', error);
            res.status(500).json({ error: 'Failed to insert camp' });
          }
      });


      app.get('/camps', async (req, res) => {
        try {
          const camps = await campsCollection.find().toArray();

          res.status(200).json(camps);
        } catch (error) {
          console.error('Error retrieving camps:', error);
          res.status(500).json({ error: 'Failed to retrieve camps' });
        }
      });



      app.get('/camps/:id', verifyToken, async (req, res) => {
        const id = req.params.id;

        try {
          const query = { _id: new ObjectId(id) };
          const result = await campsCollection.findOne(query);

          if (!result) {
            return res.status(404).json({ error: 'Item not found' });
          }

          res.status(200).json(result);
        } catch (error) {
          console.error('Error fetching item by ID:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });



    app.get('/TopCamps', async (req, res) => {
      const topRecipes = await campsCollection.find().sort({ participantCount: -1 }).limit(6).toArray();
      res.send(topRecipes);
    });



        app.put('/update-camp/:id', verifyToken, async (req, res) => {
          try {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedCamp = req.body;

            const updateDoc = { $set: updatedCamp };

            const result = await campsCollection.updateOne(filter, updateDoc);
            res.send(result);
          } catch (err) {
            console.error('Error updating camp:', err);
            res.status(500).send({ error: 'Failed to update camp' });
          }
        });
      
      
      
      app.patch('/camps/participantCount/:id', verifyToken, async (req, res) => {
        const { id } = req.params;

        try {
          const result = await campsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
              $inc: { participantCount: 1 }
            }
          );

          res.status(200).json({
            message: 'Participant count updated successfully',
            modifiedCount: result.modifiedCount,
          });
        } catch (error) {
          console.error('Error updating participant count:', error);
          res.status(500).json({ message: 'Failed to update participant count', error: error.message });
        }
      });


      
      
      app.delete('/delete-camp/:id', verifyToken, async (req, res) => {
        try {
          const id = req.params.id;

          if (!ObjectId.isValid(id)) {
            return res.status(400).send({ error: 'Invalid ID format' });
          }

          const query = { _id: new ObjectId(id) };
          const result = await campsCollection.deleteOne(query);

          if (result.deletedCount === 0) {
            return res.status(404).send({ error: 'Item not found' });
          }

          res.send({ message: 'Item deleted successfully', result });
        } catch (error) {
          console.error('Delete error:', error);
          res.status(500).send({ error: 'Server error during deletion' });
        }
      });



      // * All operation for users
      app.post('/users', verifyToken, async (req, res) => {
        try {
          const usersData = req.body;
          const email = usersData.email;

          if (!email) {
            return res.status(400).json({ error: 'Email is required' });
          }

          const existingUser = await usersCollection.findOne({ email });

          if (existingUser) {
            return res.status(409).json({ 
              message: 'User already exists',
              userId: existingUser._id 
            });
          }

          const result = await usersCollection.insertOne(usersData);

          res.status(201).json({
            message: 'User added successfully',
            insertedId: result.insertedId,
          });
        } catch (error) {
          console.error('Error inserting user:', error);
          res.status(500).json({ error: 'Failed to insert user' });
        }
      });


      app.get('/users/:email', verifyToken, async (req, res) => {
        try {
          const email = req.params.email
          const query = { email: email };
          const users = await usersCollection.find(query).toArray();

          res.status(200).json(users);
        } catch (error) {
          console.error('Error retrieving users:', error);
          res.status(500).json({ error: 'Failed to retrieve users' });
        }
      });


      // participantData.registeredAt = new Date();
      // * All operations for participants
      app.post('/participants', verifyToken, async (req, res) => {
        try {
          const participantData = req.body;
          const result = await participantCollection.insertOne(participantData);

          res.status(201).json({
            message: 'Participant registered successfully',
            insertedId: result.insertedId,
          });

        } catch (error) {
          console.error('Error registering participant:', error);
          res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
          });
        }
      });



      app.get('/participants', verifyToken, async (req, res) => {
        try {
          const participants = await participantCollection.find().toArray();

          res.status(200).json(participants);
        } catch (error) {
          console.error('Error retrieving participants:', error);
          res.status(500).json({ error: 'Failed to retrieve participants' });
        }
      });




      app.get('/participants/email/:email', verifyToken, async (req, res) => {
        try {
          const email = req.params.email;

          const participants = await participantCollection
            .find({ participant_email: email })
            .toArray();

          if (participants.length === 0) {
            return res.status(404).json({ message: 'No participants found for this email' });
          }

          res.status(200).json(participants);
        } catch (error) {
          console.error('Error fetching participants by email:', error);
          res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
          });
        }
      });




    app.delete('/participants/delete/:id', verifyToken, async (req, res) => {
      const id = req.params.id;

      try {
        const query = { _id: new ObjectId(id) };
        const result = await participantCollection.deleteOne(query);

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Participant not found or already deleted.' });
        }

        res.status(200).json({
          message: 'Participant successfully deleted.',
          deletedId: id,
        });

      } catch (error) {
        console.error('Error deleting participant:', error);
        res.status(500).json({
          message: 'Internal server error while deleting participant.',
          error: error.message,
        });
      }
    });

      
      app.patch('/participants/payment/:id', verifyToken, async (req, res) => {
        const { id } = req.params;
        const data = req.body;

        try {
          const result = await participantCollection.updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                isPayment_confirmed: true,
                isPayment_pending: false,
                data
              },
            }
          );
          res.send(result);
        } catch (error) {
          res.status(500).json({ message: 'Payment update failed', error: error.message });
        }
      });



      // * All Operation for feedback
      
      app.post('/feedback', verifyToken, async (req, res) => {
        try {
          const data = req.body;

          const result = await feedbackCollection.insertOne(data);

          res.status(201).json({
            message: 'Feedback submitted successfully.',
            insertedId: result.insertedId,
          });
        } catch (error) {
          console.error('Error submitting feedback:', error);
          res.status(500).json({
            message: 'Internal server error while submitting feedback.',
            error: error.message,
          });
        }
      });



      app.get('/feedbacks', async (req, res) => {
        try {
          const feedback = await feedbackCollection.find().toArray();

          res.status(200).json(feedback);
        } catch (error) {
          console.error('Error retrieving feedbacks:', error);
          res.status(500).json({ error: 'Failed to retrieve feedbacks' });
        }
      });

      
      

      // * Operation for Payment Gateway
      app.post('/create-payment-intent', async (req, res) => {
        const { amount } = req.body;

        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: parseInt(amount * 100), 
            currency: 'usd',
            payment_method_types: ['card'],
          });

          res.send({
            clientSecret: paymentIntent.client_secret,
          });
        } catch (error) {
          console.error('Error creating payment intent:', error);
          res.status(500).send({ error: error.message });
        }
      });

      
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>MEDICAMP Server API</title>
      <link rel="icon" type="image/svg+xml" href="https://res.cloudinary.com/dv6p7mprd/image/upload/v1752010021/ChatGPT_Image_Jul_8__2025__03_05_06_AM-removebg-preview_nbdpj2.png" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
      <style>
        :root {
          --bg-color: #0d1117;
          --card-bg-color: rgba(22, 27, 34, 0.6);
          --primary-color: #58a6ff;
          --secondary-color: #3fb950;
          --text-color: #c9d1d9;
          --text-muted-color: #8b949e;
          --border-color: rgba(139, 148, 158, 0.3);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(63, 185, 80, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(63, 185, 80, 0); }
          100% { box-shadow: 0 0 0 0 rgba(63, 185, 80, 0); }
        }

        body {
          font-family: 'Poppins', sans-serif;
          background-color: var(--bg-color);
          color: var(--text-color);
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          font-weight: 300;
        }

        .container {
          max-width: 800px;
          width: 90%;
          margin: auto;
          background: var(--card-bg-color);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 30px;
        }

        .header h1 {
          font-size: 3rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
          letter-spacing: -1px;
        }
        
        .header h1 .highlight {
            background: -webkit-linear-gradient(45deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .header p {
          font-size: 1.1rem;
          color: var(--text-muted-color);
          margin-top: 10px;
        }
        
        h2 {
          font-weight: 600;
          color: #fff;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 10px;
          margin-top: 40px;
          margin-bottom: 20px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .info-item {
          background: rgba(0,0,0,0.2);
          padding: 15px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .info-item .icon {
          width: 24px;
          height: 24px;
        }
        
        .info-item strong {
            color: #fff;
            font-weight: 500;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .status-dot {
            width: 12px;
            height: 12px;
            background-color: var(--secondary-color);
            border-radius: 50%;
            animation: pulse 2s infinite;
        }

        code {
          font-family: 'Roboto Mono', monospace;
          background: rgba(0,0,0,0.3);
          color: var(--primary-color);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.9rem;
          border: 1px solid var(--border-color);
        }

        .footer {
          margin-top: 50px;
          font-size: 0.9rem;
          color: var(--text-muted-color);
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
            <h1>Welcome to the <span class="highlight">MEDICAMP</span> API</h1>
            <p>The backend service powering community health initiatives.</p>
        </div>

        <h2>Server Status</h2>
        <div class="info-grid">
            <div class="info-item">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 17a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.9a2 2 0 0 1-1.66-.9l-.82-1.2a2 2 0 0 0-3.24 0l-.82 1.2a2 2 0 0 1-1.66.9H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <div>
                    <strong>Status:</strong>
                    <span class="status-indicator">
                        <span class="status-dot"></span>
                        Running
                    </span>
                </div>
            </div>
            <div class="info-item">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><path d="M4 12h11"></path></svg>
                <div><strong>Port:</strong> ${port}</div>
            </div>
            <div class="info-item">
                <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 12v-4"></path><path d="M12 16h.01"></path></svg>
                <div><strong>Database:</strong> MongoDB Atlas (Connected)</div>
            </div>
        </div>

        <h2>API Guide</h2>
        <p>The API <code>https://medicamp-server-three.vercel.app</code></p>
        <p>To interact with the API, use a client like <code>/camps</code> <code>/camps/:id</code> <code>/users</code>  <code>/users/:email</code> .</p>
        <p>Start by fetching all available camps via the <code>GET /camps</code> endpoint.</p>

        <div class="footer">
          &copy; ${new Date().getFullYear()} MEDICAMP. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `);
});


app.listen(port, () => {
    console.log('The mighty server is running on port', port)

})