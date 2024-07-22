require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

app.post('/webhooks/orders/cancelled', async (req, res) => {
  const cancelledOrder = req.body;
  
  console.log('Received order cancellation webhook:', cancelledOrder);

  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [
        process.env.ODOO_DB,
        Number(process.env.ODOO_USER_ID),  // Convert user ID to number
        process.env.ODOO_API_KEY,
        "sale.order",
        "action_cancel",
        [[cancelledOrder.id]]
      ]
    },
    id: 1
  };

  try {
    const response = await axios.post(`${process.env.ODOO_API_URL}/jsonrpc`, payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log('Response from Odoo API:', response.data);

    if (response.data.result) {
      console.log('Order cancellation processed successfully in Odoo');
      res.status(200).send('Order cancellation processed successfully');
    } else {
      console.log('Failed to process order cancellation in Odoo');
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
