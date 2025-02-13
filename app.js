
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const port = process.env.port||3000;
const session = require("express-session");
const bcrypt = require("bcryptjs");

const User = require("./models/User")
const Person = require("./models/Person")





//create public folder as static
app.use("/public", express.static(path.join(__dirname,"public")));

app.use(express.urlencoded({extended:true}));
//set up middle ware to parse json requests 


app.use(bodyParser.json());

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false}//set to true if using https
}))

//create a fake user

const user = {
    admin:bcrypt.hashSync("12345", 10)
}

function isAuthenticated(req, res, next)
{
    if(req.session.user){return next();}
    return res.redirect("/login"); 
    
    
}

//mongoDB connection setup


//const mongoURI = "mongodb://localhost:27017/crudapp";
const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB Connection error"));

db.once("open", ()=>(
    console.log("Connected to mongodb database")
));


//setup mongoose schema
// const peopleSchema = new mongoose.Schema({
//     firstname:String,
//     lastname:String,
//     email:String
// });

//Person = mongoose.model("Person", peopleSchema, "people");

//app routes
/*app.get(protected, isAuthenticated,(req,res,next)=>{
    const filePath = path.join(__dirname,"public",req.path);
    res.sendFile(filePath);
})*/


app.get("/",isAuthenticated,(req,res)=>{
    res.sendFile("index.html");
})
//read routes

app.get("/users", isAuthenticated, (req,res)=>
{
    res.sendFile(path.join(__dirname, "/public/users.html"));
})
app.get("/login", (req,res)=>
{
    res.sendFile(path.join(__dirname+"/public/login.html"));
})


app.get("/peopleData", async(req,res)=>{
    try{
        const people = await Person.find();
        res.json(people);
        //console.log(people);
    }catch(err){
        res.status(500).json({error:"Failed to get people."});
    }
});


app.get("/people/:id", async(req,res)=>
{
    
    try{

        const person = await Person.findById(req.params.id);
        if(!person)
        {
            return res.status(404).json({error:"{Person not found}"});
        }
        res.json(person);





    }catch(err){
        console.log(err);
        res.status(500).json({error:"Failed to get person."});
    }
});
//create routes 

app.post("/addPerson",async (req,res)=>{

    try {
        const newPerson = new Person(req.body);
        const savePerson = await newPerson.save();
        //res.status(201).json(savePerson);
        res.redirect("/");
        console.log("A person was added!\n\n"+savePerson);
    } catch (err) {
        console.log(err);
        res.status(501).json({error:"Failed to add new person"});
    }


});
app.post("/login",(req,res)=>{
    const {username,password} = req.body;
    if(user[username] && bcrypt.compareSync(password,user[username]))
    {
        req.session.user = username;
        return res.redirect("/users");
    }
    req.session.error = "Invalid User";
    return res.redirect("/login");
})

app.get("/logout", (req,res)=>{
    req.session.destroy(()=>{
        res.redirect("/login");
    });
})

//update route
app.put("/updatePerson/:id", async(req,res)=>
{
    //example of a promise statement for a async function
    Person.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true
    }).then((updatedPerson)=>{
        if(!updatedPerson)
        {
            return res.status(404).json({error:"Failed to find person"});
        }
        res.json(updatedPerson);
    }).catch((err)=>{
        res.status(400).json({error:"Failed to update the person"});
    });//failed promises ;)
    
});

//delete      localhost:3000/deletePerson/firstname?firstname=dylan
app.delete("/deletePerson/firstname", async(req,res)=>{
    try {
        const personName = req.query;
        const person = await Person.find(personName);
        

        if(person.length === 0)
        {
            return res.status(404).json({error:"Failed to find the person for deletion"});
        }
        const deletePerson = await Person.findOneAndDelete(personName);

        res.json({message:"Person deleted successfully"});
    } catch (err){
        console.log(err);
        res.status(404).json({error:"person not found for deletion"});
    }
});

//starts the server
app.listen(port, ()=>(
    console.log(`Server us running on port ${port}`)
));


module.exports = app;