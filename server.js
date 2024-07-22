require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

async function callOdooMethod(model, method, args) {
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      service: "object",
      method: "execute_kw",
      args: [
        process.env.ODOO_DB,
        Number(process.env.ODOO_USER_ID),
        process.env.ODOO_API_KEY,
        model,
        method,
        args
      ]
    },
    id: 1
  };

  const response = await axios.post(`${process.env.ODOO_API_URL}/jsonrpc`, payload, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  return response.data;
}

app.post('/webhooks/orders/cancelled', async (req, res) => {
  const cancelledOrder = req.body;
  console.log('Received order cancellation webhook:', cancelledOrder);

  try {
    // Step 1: Unlock the order
    const unlockResponse = await callOdooMethod('sale.order', 'action_unlock', [[cancelledOrder.id]]);
    console.log('Unlock response from Odoo API:', unlockResponse);

    // Step 2: Cancel the order
    const cancelResponse = await callOdooMethod('sale.order', 'action_cancel', [[cancelledOrder.id]]);
    console.log('Cancel response from Odoo API:', cancelResponse);

    if (cancelResponse.result) {
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
