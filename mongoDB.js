const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Car = require('../car_db/CabInfo');
const landmarks = require('../car_db/landmarks');

dotenv.config();

async function connect_mongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}
landmarks();

// var entry = new landmarks({name :'Mary Jane', latitude:'8.688174', longitude: '49.4078558', pincode: '69115' })
// entry.save();

// newCar.save()
//   .then(car => console.log('Car saved:', car))
//   .catch(err => console.error('Error saving car:', err));

module.exports = connect_mongoDB;
