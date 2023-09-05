// Instantiate Express and the application - DO NOT MODIFY
const express = require('express');
const app = express();

// Import environment variables in order to connect to database - DO NOT MODIFY
require('dotenv').config();
require('express-async-errors');

// Import the models used in these routes - DO NOT MODIFY
const { Author, Book, Review, Reviewer, sequelize } = require('./db/models');
const { Op } = require("sequelize");


// Express using json - DO NOT MODIFY
app.use(express.json());




// STEP #Ob: Test logging behavior - DO NOT MODIFY
app.get('/test-benchmark-logging', async (req, res) => {   // > 100 ms execution time
    const books = await Book.findAll({
        include: [
            { model: Author }, 
            { model: Review },
            { model: Reviewer }
        ],
        // Uncomment the lines below to see the data structure more clearly
        limit: 100,
        offset: 2000
    });
    res.json(books);
});


// STEP #1: Benchmark a Frequently-Used Query
app.get('/books', async (req, res) => {

    let queryOptions = { include: Author, };

    // Filter by price if there is a maxPrice defined in the query params
    if (req.query.maxPrice) {
        queryOptions.where = {
            price: {
                [Op.lt]: parseInt(req.query.maxPrice)
            }
        };
    };
    let books = await Book.findAll(queryOptions);
    res.json(books);
});

    // 1a. Analyze:

        // Record Executed Query and Baseline Benchmark Below:

        // - What is happening in the code of the query itself?


        // - What exactly is happening as SQL executes this query? 
        /* The sql query is fetching all rows from the "books" table and joining with the "authors" table based on the foreign key relationship
        it is not filtered by price at the database level but instead inside the node.js server.   THIS IS LESS EFFICIENT*/

 



// 1b. Identify Opportunities to Make Query More Efficient

    // - What could make this query more efficient?
    /* - filter the data at the database level 
       - pagination
       - select only necesary columns 
    */


// 1c. Refactor the Query in GET /books



// 1d. Benchmark the Query after Refactoring

    // Record Executed Query and Baseline Benchmark Below:

    // Is the refactored query more efficient than the original? Why or Why Not?

    // elapsed time went down from 135 ms to 61 ms
    // by doing the operation at the database level we improved operation  efficiency by over 50%



// STEP #2: Benchmark and Refactor Another Query
/*app.patch('/authors/:authorId/books', async (req, res) => {
    const author = await Author.findOne({
        include: { model: Book },
        where: {
            id: req.params.authorId
        }
    });

    if (!author) {
        res.status(404);
        return res.json({
            message: 'Unable to find an author with the specified authorId'
        });
    }

    for (let book of author.Books) {
        book.price = req.body.price;
        await book.save();
    }

    const books = await Book.findAll({
        where: {
            authorId: author.id
        }
    });

    res.json({
        message: `Successfully updated all authors.`,
        books
    });
});*/

app.patch('/authors/:authorId/books', async (req, res) => {
    const authorId = req.params.authorId;
    const newPrice = req.body.price;

    const authorExists = await Author.findOne({
        where: { id: authorId }
    });

    if (!authorExists) {
        res.status(404);
        return res.json({
            message: "unable to find author with that Id"
        });
    }

    await Book.update({ price: newPrice }, { where: { authorId } });

    res.json({
        message: `Successfully updated all authors.`,
        books
    });
});




// BONUS Step: Benchmark and Add Index
// Examples:
    // GET /reviews?firstName=Daisy&lastName=Herzog
    // GET /reviews?firstName=Daisy
    // GET /reviews?lastName=Herzog
app.get('/reviews', async (req, res) => {
    const { firstName, lastName } = req.query;

    // Check values in query parameters to define where conditions of the query
    const whereClause = {};
    if (firstName) whereClause.firstName = firstName;
    if (lastName) whereClause.lastName = lastName;

    const reviews = await Review.findAll({
        include: {
            model: Reviewer, 
            where: whereClause,
            attributes: ['firstName', 'lastName']
        },
    });

    res.json(reviews);
});



// Root route - DO NOT MODIFY
app.get('/', (req, res) => {
    res.json({
        message: "API server is running"
    });
});

// GET /authors/:authorId/books (test route) - DO NOT MODIFY
app.get('/authors/:authorId/books', async (req, res) => {
    const author = await Author.findOne({
        where: {
            id: req.params.authorId
        }
    });

    if (!author) {
        res.status(404);
        return res.json({ message: 'Unable to find an author with the specified authorId' });
    }

    const books = await Book.findAll({
        where: { authorId: author.id }
    });

    res.json(books);
});

// Set port and listen for incoming requests - DO NOT MODIFY
const port = 5000;
app.listen(port, () => console.log('Server is listening on port', port));