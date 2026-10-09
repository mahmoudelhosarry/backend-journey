import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "school",
  password: "123456",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function checkVisisted() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1; ",
    [currentUserId],
  );

  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
const getCurrentUser = async () => {
  const result = await db.query("SELECT * FROM users ");
  users = result.rows;
  return users.find((user) => user.id == currentUserId);
};

app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const currentUser = await getCurrentUser();

  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()],
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode],
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    // إذا ضغط المستخدم على Add Family Member نعرض له صفحة new.ejs

    res.render("new.ejs");
  } else {
    // إذا اختار مستخدم موجود، نأخذ الـ id ونحدث الـ currentUserId
    currentUserId = req.body.user;
    const visited_countries = await checkVisisted();
    const user = await getCurrentUser();
    // ونعيد توجيهه للصفحة الرئيسية التي ستجلب بياناته وتحدث الخريطة
    res.render("index.ejs", {
      countries: visited_countries,
      total: visited_countries.length,
      users: users,
      color: user.color,
    });
  }
});

app.post("/new", async (req, res) => {
  const { name, color } = req.body;

  try {
    // 1. نضيف RETURNING * عشان ترجع بيانات العضو بعد الإضافة
    const result = await db.query(
      "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *;",
      [name, color],
    );

    // 2. نستخرج الـ id الجديد
    const id = result.rows[0].id;

    // 3. نحدد العضو الجديد كـ currentUserId
    currentUserId = id;

    // 4. نرجع للصفحة الرئيسية
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
