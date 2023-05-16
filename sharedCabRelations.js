var express = require('express');
var router = express.Router();
//var session = require('../db_connections/neo4j.js');
const neo4j = require('neo4j-driver');
const CabInfo = require('../car_db/CabInfo');


const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j', 'passpass'))
const session = driver.session();


router.get('/', function(req, res) {
    res.render('sharedcab', { title: 'heySharedCAb' });
});



//Defining User position as global.
let location = {};
router.post('/live_location', async function(req,res,next){

  location = req.body;
  console.log("location ",location);
  const {lat,lng} = location;

  // query for Neo4j database to get all cabs near passenger location
  const ses = await session.run(`MATCH (n:Cab)
  WITH point({longitude: toFloat(n.lon), latitude: toFloat(n.lat)}) as n1, point({longitude: toFloat(${lng}), latitude: toFloat(${lat})}) as n2, n
  WITH n, n1, n2, point.distance(n1, n2)/1000 as d
  WHERE d < 8
  RETURN n.cab_id AS cab_id, n1.longitude AS longitude, n1.latitude AS latitude, d`);
  //print the result of the query
  console.log("records",ses);
  const cabs = ses.records.map(record => {
    const cab =  {Name: record.get('cab_id'), Longitude: record.get('longitude'), Latitude: record.get('latitude'), Distance: record.get('d')};
    return cab
  }

);     
res.json(cabs);
})

router.post('/get_destination', async function(req,res,next){

  //Get the destination selected by the user.
  const {user_destination,newLocation} = req.body;

  console.log('user destination ',user_destination)
  //Get user location
  const {lat,lng} = newLocation;

  //Using this Destination choose Cab Ids from MongoDB
  const dest_cabs = await CabInfo.find({CarDestinations:user_destination});
  console.log(dest_cabs);
  // same_dest_cab = db.CabInfo.find({"Car Destinations": "Mannheim"}). //Replace Mannheim with the variable user_dest
  const carIds = dest_cabs.map(car => car.Car_ID.toString());
  //console.log(JSON.stringify(carIds));


  //From the list of cabs run a Neo4j Query, to search locations of the cabs near me and show..
  //Foe eg. ["1001","1002","1003","1008","1009"] in the query with array cabIDList, having all cab IDs as string
  
  const ses = await session.run(`
    WITH  ${JSON.stringify(carIds)} as cabids
    MATCH (m:Cab)
    WHERE m.cab_id IN cabids
    WITH point({longitude: toFloat(m.lon), latitude: toFloat(m.lat)}) as m1, point({longitude: toFloat(${lng}), 
    latitude: toFloat(${lat})}) as m2, m
    WITH m, m1, m2, point.distance(m1, m2)/1000 as d
    WHERE d < 8
    MATCH (m)-[:CATEGORY]->(ct:CabType)
    RETURN m.cab_id AS cab_id, m1.longitude AS longitude, m1.latitude AS latitude, d,ct.name as cabcategory
  `);
  console.log(ses.records);
 
  const cabs = ses.records.map(record => {
      const cabDetails = dest_cabs.find(car => car.Car_ID.toString()===record.get('cab_id'))
      console.log(cabDetails);
      const cab =  {Name: record.get('cab_id'), Longitude: record.get('longitude'), 
                    Latitude: record.get('latitude'), Distance: record.get('d'), vacantSeats:cabDetails.vacantSeats, 
                    CarDestination: cabDetails.CarDestinations, CabType:record.get('cabcategory')};
      return cab
    }
  );  
  console.log(cabs);
  
  res.json(cabs)
})



//router.get
module.exports = router;

