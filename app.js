const express = require('express')
const cors = require('cors')
const mysql = require('mysql2');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const secret = 'admin'

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'nike_store'
});

const app = express()
app.use(cors())
app.use(express.json())

app.get('/selectProducts', function (req, res) {
  connection.query(
    'SELECT * FROM `products`',
    function(err, results, fields) {
      res.json(results);
    }
  );
})

app.get('/product/:id', function (req, res) {
  const id = req.params.id;
  connection.query(
    'SELECT * FROM `products` WHERE `id` = ?',
    [id],
    function(err, results) {
      res.json(results);
    }
  );
})

app.put('/updateProduct', function(req, res) {
  const id = req.params.id;
  const { brand, colorway, release_date, retail_price } = req.body;

  connection.query(
    'UPDATE `products` SET `brand` = ?, `colorway` = ?, `release_date` = ?, `retail_price` = ? WHERE `id` = ?',
    [brand, colorway, release_date, retail_price, id],
    function(err, results) {
      if (err) {
        console.error("Error executing query", err);
        return res.status(500).json({ message: "Error" });
      }
      res.json({ message: "Product updated successfully"});
    }
  );
});

app.delete('/deleteProduct', function(req, res) {
  const id = req.query.id;
  connection.query(
    'DELETE FROM `products` WHERE `id` = ?',
    [id],
    function(err, results) {
      if (err) {
        console.error("Error executing query", err);
        res.status(500).json({ message: "Error" });
      } else {
        res.json({ message: "Product deleted successfully" });
      }
    }
  );
})

app.post('/product', function (req, res) {
  connection.query(
    'INSERT INTO `products`(`brand`, `colorway`, `release_date`, `retail_price`) VALUES (?, ?, ?, ?)',
    [req.body.brand, req.body.colorway, req.body.release_date, req.body.retail_price],
    function(err, results) {
      res.json(results);
    }
  );
})

app.get('/countProducts', function (req, res) {
  connection.query('SELECT COUNT(*) AS productCount FROM `products`', function (err, results) {
    if (err) {
      console.error("Error executing query", err);
      res.status(500).json({ message: "Error" });
    } else {
      const productCount = results[0].productCount;
      res.json({ count: productCount });
    }
  });
});

app.post('/login', function (req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  connection.query(
    'SELECT * FROM `users` WHERE `username` = ?',
    [username],
    function(err, results) {
      if (err) {
        console.error("Error executing query", err);
        return res.status(500).json({ message: "Error" });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ message: "Invalid username or password." });
      }
      const user = results[0];
      bcrypt.compare(password, user.password, function(err, result) {
        if (err) {
          console.error("Error comparing passwords", err);
          return res.status(500).json({ message: "Error" });
        }
        if (!result) {
          return res.status(401).json({ message: "Invalid username or password." });
        }
        const token = jwt.sign({ username: user.username }, secret);
        res.json({ message: "Login successful", token });
      });
    }
  );
});

app.post('/register', function (req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  bcrypt.hash(password, 10, function(err, hashedPassword) {
    if (err) {
      console.error("Error hashing password", err);
      return res.status(500).json({ message: "Error" });
    }
    connection.query(
      'INSERT INTO `users` (`username`, `password`) VALUES (?, ?)',
      [username, hashedPassword],
      function(err, results) {
        if (err) {
          console.error("Error executing query", err);
          return res.status(500).json({ message: "Error" });
        }
        res.json({ message: "Registration successful" , results });
      }
    );
  });
});

port = 8000
app.listen(port, function () {
  console.log('This server is listening on port', port)
})