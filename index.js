// Names: Adam Forbush, Chris Fowler, Ryan Hawkins, Joshua Thatcher
// Description: This website is designed to allos users to add restaurants that support different dietary needs. They can filter by clicking on images that display
//       different dietary restrictions. An admin can login to edit the database as needed

// Setup to be able to easily make a node.js application
const express = require("express");
let app = express();
let path = require("path");
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));

//Connects to our database
const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "awseb-e-nnpbrzbmqd-stack-awsebrdsdatabase-xend9pan3nnh.cnvqawbqywld.us-east-1.rds.amazonaws.com",
        user: process.env.USER_NAME || "ebroot",
        password: process.env.RDS_PASSWORD || "root1234",
        database: process.env.RDS_DB_NAME || "ebdb",
        port: process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? {rejectUnauthorized:false}:false
    }
});

//Renders the home page
app.get("/", (req, res) => {
    res.render("index");
});

//Renders the display restaurants where the admin can edit and delete records (only accessible by the admin). View restaurants is another page that anyone can see
app.get("/displayRestaurants", (req, res) => {
    knex.select().from("restaurants").then( (restaurants) => {
        res.render("displayRestaurants", {myRestaurants : restaurants});
    });
});

//Renders the add restaurants form
app.get("/addRestaurants", (req, res) => {
    res.render("addRestaurants");
});

//Submits the add restaurants form to our postgres server and inputs it into our restaurants table. Then renders the view restaurants page
app.post("/addRestaurants", (req, res) => {
    knex("restaurants").insert({Rest_Location: req.body.Rest_Location, Rest_Rating: req.body.Rest_Rating, Rest_Link: req.body.Rest_Link, Rest_Dietary_Description: req.body.Rest_Dietary_Description, Rest_Name: req.body.Rest_Name}).then(restaurants => {
        res.redirect("/viewRestaurants");
    }).catch(err => {
        console.log(err);
        res.status(500).json({err});
    });
});

//Renders the edit restaurant page based on the id of the record selected 
app.get("/editRestaurants/:id", (req, res) => {
    knex.select("Rest_ID", "Rest_Name", "Rest_Location", "Rest_Rating", "Rest_Link", "Rest_Dietary_Description")
    .from("restaurants")
    .where("Rest_ID", req.params.id)
    .then(restaurants => {
        res.render("editRestaurants", {myRestaurants: restaurants});
    }).catch(err => {
        console.log(err);
        res.status(500).json({err});
    });
})

//Submits the form from the edit restaurants page that updates a record in our table
app.post("/editRestaurants", (req, res) => {
    knex("restaurants").where("Rest_ID", parseInt(req.body.Rest_ID)).update({
        Rest_Name: req.body.Rest_Name,
        Rest_Location: req.body.Rest_Location,
        Rest_Rating: req.body.Rest_Rating,
        Rest_Link: req.body.Rest_Link,
        Rest_Dietary_Description: req.body.Rest_Dietary_Description
    }).then(myRestaurants => {
        res.redirect("/displayRestaurants");
    });
});

//When the delete button is clicked on from the admin page, removes the corresponding record form the database
app.post("/deleteRestaurants/:id", (req, res) => {
    knex("restaurants").where("Rest_ID", req.params.id).del().then(myRestaurants => {
        res.redirect("/displayRestaurants");
    }).catch(err => {
        console.log(err);
        res.status(500).json({err});
    });
});

//Submits the login form and tests to see if it is equal to the hard coded user name and password. Otherwise it won't render the display restaurants page
app.post("/submitLogin", (req, res) => {

    //Sets the admin username and password and compares it to the username and password entered in the form
    const sAdminUsername = 'Admin'
    const sAdminPassword = 'P3'
    const username = req.body.username
    const password = req.body.password

    //If they enter the admin username and password, it will render the admin's display restaurants page where the admin can edit, delete, and view all the data
    if (username === sAdminUsername && password === sAdminPassword)  
    {
        knex.select().from("restaurants").then( (restaurants) => {
            res.render("displayRestaurants", {myRestaurants : restaurants});
        });
    }
});

//Renders the login page
app.get("/login", (req, res) => {
    res.render("login")
})

//Renders the view restaurants page with all the data in our restaurants table
app.get("/viewRestaurants", (req, res) => {
    knex.select().from("restaurants").then( (restaurants) => {
        res.render("viewRestaurants", {myRestaurants : restaurants});
    });
});

//Renders the view restaurants page but only with the dietary restrictions filtered down
app.get("/filterRestaurants",(req,res) => {
    const preference= req.query.preference
    console.log("looking for "+ preference)
    knex.select()
    .from("restaurants")
    .where("Rest_Dietary_Description", preference)
    .then (restaurants =>
        {
        res.render('viewRestaurants', { myRestaurants: restaurants });
        })
    
})

app.listen(port, () => console.log("Server is listening"));