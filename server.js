require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/webhooks/orders/cancelled', async (req, res) => {
  const cancelledOrder = req.body;
  
  console.log('Received order cancellation webhook:', cancelledOrder);

  try {
    const response = await axios.post(`${process.env.ODOO_API_URL}/api/annuler_commande`, {
      order_id: cancelledOrder.id,
    }, {
      auth: {
        username: process.env.ODOO_API_USER,
        password: process.env.ODOO_API_KEY
      }
    });

    if (response.status === 200) {
      res.status(200).send('Order cancellation processed successfully');
    } else {
      res.status(500).send('Failed to process order cancellation');
    }
  } catch (error) {
    console.error('Error processing order cancellation:', error);
    res.status(500).send('Error processing order cancellation');
  }
});

app.listen(3000, () => {
  console.log('Webhook listener running on port 3000');
});
