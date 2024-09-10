const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const app = express();

// Firebase Service Account
var serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();


// CORS
app.use(cors({ origin: true }));


// Routes
app.get('/hello-world', (request, response) => {
  return response.status(200).send('Hello World!!');
});

// Create
app.post('/api/create', async (request, response) => {
    try {
      const newProduct  = await db.collection('products').add({
        name: request.body.name,
        description: request.body.description,
        price: request.body.price
      });

      return response.status(200).send(`Success with new ID: ${newProduct.id}`);
    } catch (error) {
      console.error(error);
      return response.status(500).send(error);
    }
});

// Read


// Update

//Delete

// Export the API to Firebase Cloud Functions
exports.app = functions.https.onRequest(app);
