const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json()); // For Parsing the application/json


// Connect to MongoDB Database
mongoose.connect("mongodb+srv://satish:mongodb374@cluster0.ltudgvf.mongodb.net/myFistDatabase?retryWrites=true&w=majority").then(() => {
    console.log("MongoDB is Connected...")
})


// Define Book schema
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    ISBN: String,
    fileFormat: String,
});

// Define Book model
const BookModel = mongoose.model('Book', bookSchema);


// Create a Class Book
class Book {
    constructor(title, author, ISBN) {
        this.title = title;
        this.author = author;
        this.ISBN = ISBN;
    }

    displayInfo() {
        return `{Title: ${this.title}, Author: ${this.author}, ISBN: ${this.ISBN}}`;
    }
}


//Create a SubClass EBook that inherits from the Book Class
class EBook extends Book {
    constructor(title, author, ISBN, fileFormat) {
        super(title, author, ISBN);
        this.fileFormat = fileFormat;
    }

    displayInfo() {
        return `${super.displayInfo()}, File Format: ${this.fileFormat}`;
    }

}


//Creating Class Library
class Library {
    constructor() {
        this.books = [];
    }

    async addBook(book) {
        try {
            const newBook = new BookModel(book);
            await newBook.save();
            return `Book '${book.title}' added to the library.`;
        } catch (error) {
            throw new Error(`Failed to add book: ${error.message}`);
        }
    }

    async displayBooks() {
        try {
            const books = await BookModel.find();
            if (books.length === 0) {
                return "The library is empty.";
            } else {
                return books.map(book => new Book(book.title, book.author, book.ISBN).displayInfo()).join(",  ");
            }
        } catch (error) {
            throw new Error(`Failed to display books: ${error.message}`);
        }
    }

    async searchByTitle(title) {
        try {
            const foundBooks = await BookModel.find({ title: new RegExp(title, 'i') });
            if (foundBooks.length > 0) {
                return foundBooks.map(book => new Book(book.title, book.author, book.ISBN).displayInfo()).join("\n\n");
            } else {
                return `Book with title '${title}' not found in the library.`;
            }
        } catch (error) {
            throw new Error(`Failed to search for books: ${error.message}`);
        }
    }

    async deleteBook(title) {
        try {
            const result = await BookModel.deleteOne({ title: new RegExp(title, 'i') });
            if (result.deletedCount > 0) {
                return `Book with title: '${title}' deleted from the library.`;
            } else {
                return `Book with title: '${title}' not found in the library. No books deleted.`;
            }
        } catch (error) {
            throw new Error(`Failed to delete book: ${error.message}`);
        }
    }
}


// Create instances
const library = new Library();



// API Endpoints

//Create an API interface to ADD the books into the database.
app.post('/addBook', async (req, res) => {
    try {
        const { title, author, ISBN, fileFormat } = req.body;
        const newBook = fileFormat ? new EBook(title, author, ISBN, fileFormat) : new Book(title, author, ISBN);
        const message = await library.addBook(newBook);
        res.status(201).json({ message });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



//Create an API interface to GET the books from the database.
app.get('/listBooks', async (req, res) => {
    try {
        const booksInfo = await library.displayBooks();
        res.status(200).json({ books: booksInfo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



//Create an API interface to DELETE the books from the database.
app.delete('/deleteBook/:title', async (req, res) => {
    try {
        const { title } = req.params;
        const message = await library.deleteBook(title);
        res.status(200).json({ message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Start server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});





