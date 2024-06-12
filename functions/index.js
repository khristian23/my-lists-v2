/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.lists = onRequest((request, response) => {
  const lists = [
    { listId: 1, name: 'Christian' },
    { listId: 2, name: 'Ivonne' },
    { listId: 3, name: 'Rafaella' },
    { listId: 4, name: 'Emilia' },
  ];

  logger.info('Hello logs!', { structuredData: true });
  response.send(lists);
});
