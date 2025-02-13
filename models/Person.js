const mongoose = require("mongoose");


//setup mongoose schema
const peopleSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String
});

const Person = mongoose.model("Person", peopleSchema, "people");


module.exports = Person;