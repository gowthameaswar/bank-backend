const express = require('express');
const mongoose = require('mongoose');
const csv = require('csv-parser');
const fs = require('fs');
const dotenv = require('dotenv');
require('colors');

dotenv.config();

const app = express();

const uri = 'mongodb+srv://gowtham07:gowtham07@cluster0.7sl4zdt.mongodb.net/myDB';
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log('MongoDB connection error:', err));


// Code for CSV - MONGODB
const branchSchema = new mongoose.Schema({
    "ifsc": String,
    "bank_id": String,
    "branch": String,
    "address": String,
    "city": String,
    "district": String,
    "state": String
});


const Branch = mongoose.model("Branch", branchSchema);

app.post('/api/upload-csv', (req, res) => {
  Branch.collection.drop();
  let i = 0;
  fs.createReadStream('bank_branches.csv')
    .pipe(csv())
    .on('data', (row) => {
      const data = new Branch({
        "ifsc": row.ifsc,
        "bank_id": row.bank_id,
        "branch": row.branch,
        "address": row.address,
        "city": row.city,
        "district": row.district,
        "state": row.state
      });
      console.log(i);
      i += 1;
      data.save();
    })
    .on('end', () => {
      res.send('CSV file successfully imported into database');
    });
});


//Code for getting values from MongoDB
app.get('/api/search', function (req, res) {
    const { q, limit, offset } = req.query;
  
    Branch.find({})
    .sort({ ifsc: 'asc' })
    .limit(Number(limit))
    .skip(Number(offset))
    .select('-_id -__v')
    .exec(function(err, result) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json({ result });
      }
    });
});


app.get('/api/branch', function (req, res) {
    const { q, limit, offset } = req.query;
    
    Branch.find({ branch: q.toUpperCase() })
  .sort({ ifsc: 'desc' })
  .limit(Number(limit))
  .skip(Number(offset))
  .select('-_id -__v')
  .exec(function(err, result) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.json({ result });
    }
  });
});



app.listen(3000, () => console.log('Server listening on port 3000'));
