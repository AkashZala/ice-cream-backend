const express = require('express');
const app = express();
const pg = require('pg');
const client = new pg.Client('postgress://localhost/ice_cream_db');
const cors = require('cors');

app.use(cors());


app.get('/api/flavors', async (req,res, next) => {
    try {
        const SQL = `SELECT * FROM FLAVORS`;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch(error) {
        next(error);
    }
});

app.get('/api/flavors/:id', async (req, res, next) => {
    try {
       const SQL = `SELECT * FROM flavors WHERE id=$1;`;
       const response = await client.query(SQL, [req.params.id]);

       if (!response.rows.length) {
          next({
            name: 'MissingIDError',
            message: `Flavor with id ${req.params.id} not found`
          });
       }

       res.send(response.rows);

    } catch (error) {
        next(error);
    }
});

app.delete('/api/flavors/:id', async (req, res, next) => {
    const SQL = `DELETE FROM flavors WHERE id=$1;`;
    const response = await client.query(SQL, [req.params.id]);

    res.sendStatus(204);
});

app.use((error, req, res, next) => {
    res.status(500);
    res.send(error);
});

const startup = async () => {
    await client.connect();
    const SQL = `
      DROP TABLE IF EXISTS flavors;
      CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        name VARCHAR(25),
        favorite BOOLEAN
      );
      INSERT INTO flavors (name) VALUES ('Vanilla');
      INSERT INTO flavors (name, favorite) VALUES ('Strawberry', true);
      INSERT INTO flavors (name) VALUES ('Chocolate');
      INSERT INTO flavors (name) VALUES ('Mint Chocolate Chip');
      INSERT INTO flavors (name) VALUES ('Mango');
      INSERT INTO flavors (name, favorite) VALUES ('Cookies and Cream', true);
    `;

    await client.query(SQL);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {

    });
}

startup();