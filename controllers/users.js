const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const db = mysql.createConnection({
  connectionLimit: 30,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  database: process.env.DATABASE,
  port: process.env.DATABASE_PORT
});

db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).render("login", {
        msg: "Please Enter Your Email and Password",
        msg_type: "error",
      });
    }

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).render("login", {
            msg: "Internal Server Error",
            msg_type: "error",
          });
        }

        if (!result || result.length === 0) {
          return res.status(401).render("login", {
            msg: "Email or Password is incorrect",
            msg_type: "error",
          });
        }

        const user = result[0];
        const isPasswordMatch = await bcrypt.compare(password, user.pass);

        if (!isPasswordMatch) {
          return res.status(401).render("login", {
            msg: "Email or Password is incorrect",
            msg_type: "error",
          });
        }

        const id = user.ID;
        const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
        console.log("The Token is " + token);

        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
          ),
          httpOnly: true,
        };
        res.cookie("joes", token, cookieOptions);
        res.status(200).redirect("/");
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(500).render("login", {
      msg: "Internal Server Error",
      msg_type: "error",
    });
  }
};

exports.register = (req, res) => {
  console.log(req.body);

  const { name, email, password, confirm_password, phone, role } = req.body;

  db.query(
    "SELECT email FROM users WHERE email = ?",
    [email],
    async (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).render("register", {
          msg: "Internal Server Error",
          msg_type: "error",
        });
      }

      if (result.length > 0) {
        return res.render("register", {
          msg: "Email id already taken",
          msg_type: "error",
        });
      } else if (password !== confirm_password) {
        return res.render("register", {
          msg: "Passwords do not match",
          msg_type: "error",
        });
      }

      let hashedPassword = await bcrypt.hash(password, 8);

      db.query(
        "INSERT INTO users SET ?",
        { name: name, email: email, pass: hashedPassword, phoneno: phone, role: role },
        (error, result) => {
          if (error) {
            console.error(error);
            return res.status(500).render("register", {
              msg: "Internal Server Error",
              msg_type: "error",
            });
          } else {
            return res.render("register", {
              msg: "User registration successful",
              msg_type: "good",
            });
          }
        }
      );
    }
  );
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.joes) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.joes,
        process.env.JWT_SECRET
      );

      db.query(
        "SELECT * FROM users WHERE id = ?",
        [decode.id],
        (err, results) => {
          if (err || !results || results.length === 0) {
            return next();
          }
          req.user = results[0];
          return next();
        }
      );
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
};

exports.logout = async (req, res) => {
  res.cookie("joes", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });
  res.status(200).redirect("/login");
};
