import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "Mahmoud123",
  port: 5432,
});
db.connect();
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM visited_countries");
  const countries = result.rows.map((x) => x.country_code);
  const total = result.rows.length;
  res.render("index.ejs", { countries: countries, total: total });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) = $1",
      [input],
    );
    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode],
      );
    } catch (err) {
      console.log(err);
    }
  } catch (error) {
    console.log(error.message);
    const result = await db.query("SELECT * FROM visited_countries");
    const countries = result.rows.map((x) => x.country_code);
    const total = result.rows.length;
    res.render("index.ejs", {
      error: "Country not found, try again.",
      countries: countries,
      total: total,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
