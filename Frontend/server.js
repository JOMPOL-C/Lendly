const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//const adminRouter = require("./router/admin");

//app.use("/admin", adminRouter);

/* app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Frontend/src/view/home.html"));
}); */ 
// ---------- Page render ----------
 app.get("/", (req, res) => {
  try {
    //res.sendFile(path.join(__dirname,"src","view", "home.html"));


    res.render("home");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

 app.get("/detail-pro", (req, res) => {
  try {
    //res.sendFile(path.join(__dirname,"src","view", "home.html"));


    res.render("Detail_Pro");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

 app.get("/category", (req, res) => {
  try {
    res.render("category");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/my_rentals", (req, res) => {
  try {
    res.render("my_rentals");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/all_review", (req, res) => {
  try {
    res.render("all_review");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/favorites", (req, res) => {
  try {
    res.render("favorites");
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
