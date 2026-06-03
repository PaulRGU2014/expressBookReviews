const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const exists = users.some((user) => user.username === username);
  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  axios
    .get("http://localhost:5000/")
    .then((response) => {
      const allBooks = response.data;
      const book = allBooks[isbn];

      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      return res.status(200).json(book);
    })
    .catch((error) => {
      return res
        .status(500)
        .json({ message: "Error fetching books", error: error.message });
    });
});
// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  try {
    const author = req.params.author.toLowerCase();

    const response = await axios.get("http://localhost:5000/");
    const allBooks = response.data;

    const filteredBooks = Object.entries(allBooks).filter(
      ([isbn, book]) => book.author.toLowerCase() === author,
    );

    if (filteredBooks.length === 0) {
      return res
        .status(404)
        .json({ message: "No books found for this author" });
    }

    return res.status(200).json(Object.fromEntries(filteredBooks));
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  try {
    const title = req.params.title.toLowerCase();
    const response = await axios.get("http://localhost:5000/");
    const allBooks = response.data;

    const filteredBooks = Object.entries(allBooks).filter(
      ([isbn, book]) => book.title.toLowerCase() === title,
    );

    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: "No books found with this title" });
    }

    return res.status(200).json(Object.fromEntries(filteredBooks));
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching books", error: error.message });
  }
});
//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
