const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors())
app.use(express.json())




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
        <p>To interact with the API, use a client like <code>camps</code> <code>Postman</code> <code>Insomnia</code> or <code>cURL</code> .</p>
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