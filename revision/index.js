import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import { url } from "inspector";
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
const logger = (req, res, next) => {
  console.log("Request received at " + req);
  next();
};
app.use(logger);
app.post("/auth", (req, res) => {
  const { username, password } = req.body;
  password === "123456"
    ? res.send(`welcome ${username}`)
    : res.send("invalid password");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
