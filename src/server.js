const express = require('express');
const cors = require('cors');
const { compute } = require('./vm');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/run', (req, res) => {
  const { memory } = req.body;
  const result = compute(memory);
  res.json({ memory: result });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
