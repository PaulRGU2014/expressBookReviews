const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  return users.some(
    (user) => user.username === username && user.password === password,
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (!isValid(username) || !authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }
  const accessToken = jwt.sign({ data: username }, "access", {
    expiresIn: "1h",
  });
  req.session.authorization = { accessToken };

  return res.status(200).json({ message: "User successfully logged in" });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review || req.body.review;

  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  const token = req.session.authorization && req.session.authorization.accessToken;
  if (!token) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const decoded = jwt.verify(token, "access");
  const username = decoded.data;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    isbn: isbn,
    reviews: book.reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const token = req.session.authorization && req.session.authorization.accessToken;
  if (!token) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const decoded = jwt.verify(token, "access");
  const username = decoded.data;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!Object.prototype.hasOwnProperty.call(book.reviews, username)) {
    return res.status(404).json({ message: "No review found for this user" });
  }

  delete book.reviews[username];

  return res.status(200).json({
    message: `Review by ${username} for ISBN ${isbn} has been deleted`,
    isbn: isbn,
    reviews: book.reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
