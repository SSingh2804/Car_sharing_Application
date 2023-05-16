const neo4j = require('neo4j-driver');

// localhost and credentials are specific to the local environment setup 
const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic('neo4j', 'passpass'));

const session = driver.session();

module.exports = session;