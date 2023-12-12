// Authors
const express = require("express");

let app = express();

let path = require("path");

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.urlencoded({extended:true}));

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

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/displayRestaurants", (req, res) => {
    knex.select().from("restaurants").then( (restaurants) => {
        res.render("displayRestaurants", {myRestaurants : restaurants});
    });
});

app.get("/addRestaurants", (req, res) => {
    res.render("addRestaurants");
});

app.post("/addRestaurants", (req, res) => {
    knex("restaurants").insert({Rest_Location: req.body.Rest_Location, Rest_Rating: req.body.Rest_Rating, Rest_Link: req.body.Rest_Link, Rest_Dietary_Description: req.body.Rest_Dietary_Description, Rest_Name: req.body.Rest_Name}).then(myRestaurants => {
        res.render("viewRestaurants", {myRestaurants: restaurants});
    }).catch(err => {
        console.log(err);
        res.status(500).json({err});
    });
});

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

app.post("/deleteRestaurants/:id", (req, res) => {
    knex("restaurants").where("Rest_ID", req.params.id).del().then(myRestaurants => {
        res.redirect("/displayRestaurants");
    }).catch(err => {
        console.log(err);
        res.status(500).json({err});
    });
});

app.get("/", (req, res) => {

        res.render("restaurantHome")
});

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

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/viewRestaurants", (req, res) => {
    knex.select().from("restaurants").then( (restaurants) => {
        res.render("viewRestaurants", {myRestaurants : restaurants});
    });
});

app.listen(port, () => console.log("Server is listening"));