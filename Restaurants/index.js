const express = require("express");

let app = express();

let path = require("path");

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");

app.use(express.urlencoded({extended:true}));

const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.USER_NAME || "postgres",
        password: process.env.RDS_PASSWORD || "Ju!c3WRLD999",
        database: process.env.RDS_DB_NAME || "restaurants",
        port: process.env.RDS_PORT || 5432,
        // ssl: process.env.DB_SSL ? {rejectUnauthorized:false}:false
    }
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
    knex("restaurants").insert({Rest_Name: req.body.Rest_Name, Rest_Location: req.body.Rest_Location, Rest_Rating: req.body.Rest_Rating, Rest_Link: req.body.Rest_Link, Rest_Dietary_Description: req.body.Rest_Dietary_Description}).then(myRestaurants => {
        res.redirect("/displayRestaurants");
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

app.listen(port, () => console.log("Server is listening"));