require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const Url = require('./urlSchema')

// Basic Configuration
const port = process.env.PORT || 3000;

// DB Configuration
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', async function(req, res) {
  const { url } = req.body;  
  const urlPattern = /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;

  // check url is valid
  if(url && !!urlPattern.test(url)) {
    const newUrl = new Url({ original_url: url, short_url: Math.floor(Math.random() * 100000) });
    await newUrl.save();
    res.json({ original_url: newUrl.original_url, short_url: newUrl.short_url });
  }else {
    res.json({ error: 'invalid url' });
  }
  

})

app.get('/api/shorturl/:short_url', async function(req, res){
  const { short_url } = req.params;
  const url = await Url.findOne({ short_url });
  if(url) {
    res.redirect(url.original_url);
  }else {
    res.json({ error: 'invalid url' });
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
