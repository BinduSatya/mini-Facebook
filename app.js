const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const userModel = require("./models/user.js");
const jwt = require("jsonwebtoken");
const postModel = require("./models/post.js");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("create");
});

const isLoggedIn = async (req, res, next) => {
  if (req.cookies.token === "") res.redirect("/login");
  else {
    const data = jwt.verify(req.cookies.token, "shhhh");
    const user = await userModel.findOne({ _id: data.userId });
    req.user = user;
    next();
  }
};

app.post("/register", async (req, res) => {
  try {
    const { username, name, age, email, password } = req.body;
    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      return res.status(400).send("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let newUser = await userModel.create({
      username,
      name,
      age,
      email,
      password: hashedPassword,
    });

    let token = jwt.sign(
      { email: email, password: hashedPassword, userId: newUser._id },
      "shhhh"
    );
    res.cookie("token", token);
    res.redirect("/profile");
  } catch (error) {
    console.log(error);

    res.status(500).send("An error occurred while saving user details.");
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) return res.status(404).send("user not found");
  if (await bcrypt.compare(password, user.password)) {
    let token = jwt.sign(
      { email: email, password: user.password, userId: user._id },
      "shhhh"
    );
    res.cookie("token", token);
    res.redirect("/profile");
  } else return res.status(404).send("user not found");
});

app.post("/create-post", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  //   console.log(user)
  const data = req.body.textarea;
  let newPost = await postModel.create({
    user: user._id,
    content: data,
  });
  user.posts.push(newPost._id);
  await user.save();
  res.redirect("/profile");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

app.get("/profile", isLoggedIn, (req, res) => {
  const user = req.user.populate("posts");
  //   console.log(req.user);
  res.render("profile", { user });
});

app.listen(3000, () => {
  console.log("port is running");
});
