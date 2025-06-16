const express = require('express');
const cors = require('cors');
const stripe = require('stripe')('sk_test_xxx'); // Reemplaza por tu clave secreta de prueba

const app = express();
app.use(cors());
app.use(express.json());

app.post('/crear-sesion-pago', async (req, res) => {
  try {
    let line_items = [];
    // Soporta carrito (items) o servicio individual (nombre, precio)
    if (req.body.items && Array.isArray(req.body.items) && req.body.items.length > 0) {
      line_items = req.body.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.nombre },
          unit_amount: item.precio,
        },
        quantity: item.cantidad,
      }));
    } else if (req.body.nombre && req.body.precio) {
      line_items = [{
        price_data: {
          currency: 'usd',
          product_data: { name: req.body.nombre },
          unit_amount: req.body.precio,
        },
        quantity: 1,
      }];
    } else {
      return res.status(400).json({ error: 'Datos de pago inválidos' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://pets-six-iota.vercel.app/#services',
      cancel_url: 'https://pets-six-iota.vercel.app/#services',
    });
    res.json({ sessionId: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => console.log('Servidor backend Stripe escuchando en puerto 4242'));
