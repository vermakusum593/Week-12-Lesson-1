import express from 'express';
import axios from 'axios';
import swaggerUi from 'swagger-ui-express';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, 'swagger.yaml'), 'utf8'));


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


app.get('/crimes', async (req, res) => {
  try {
    const response = await axios.get('https://brottsplatskartan.se/api/events/?location=helsingborg&limit=5');
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to fetch crime data' });
  }
});


app.get('/crimes/locations', async (req, res) => {
  try {
    const response = await axios.get('https://brottsplatskartan.se/api/events/?location=helsingborg&limit=5');
    const headlines = response.data.map(event => event.title || event.headline);
    res.json(headlines);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch crime headlines' });
  }
});

app.get('/crimes/search', async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'City is required as a query parameter' });
  }

  try {
    const response = await axios.get(`https://brottsplatskartan.se/api/events/?location=${city}&limit=5`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: `Failed to fetch crimes for ${city}` });
  }
});


app.get('/crimes/latest', async (req, res) => {
  try {
    const response = await axios.get('https://brottsplatskartan.se/api/events/?location=helsingborg&limit=5');
    const latest = response.data[0];
    res.json(latest);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latest crime' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
