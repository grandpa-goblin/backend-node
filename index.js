const express = require('express')
const pug = require('pug');
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt')
const PORT = 2000
const saltRounds = 10
const jwt = require('jsonwebtoken');
const { json } = require('body-parser');

var cors = require('cors');

app.set('view engine', 'pug');
app.set('views', './views');
app.use('/assets', express.static('assets'))
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(cors())

mongoose.connect('mongodb://localhost/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
},
  (err) => {
    if (err) {
      console.log("error occured");
    } else {
      console.log("database connected");
    }
  }
);


require('./model/User')
require('./model/Book')
var Book = mongoose.model("Book")
var User = mongoose.model("User")
// app.get('/book/add/:name/:auther',(req,res)=> {
//   console.log("books is",req.params);
//   var book = new Book()
//   book.name = req.params.name;
//   book.auther = req.params.auther; 
//   book.save()
//   res.send("book,s name is saved")
// })

app.post('/book/add', (req, res) => {
  console.log(req.body);
  var book = new Book()
  book.name = req.body.name;
  book.auther = req.body.auther;
  book.save().then((data) => {
    console.log(data);
    res.json({
      id: data._id,
      message: "book added"
    })
  })
  // res.send("book addeed")
})

app.get('/book/list', (req, res) => {
  Book.find().then((data) => {
    console.log(data);
    res.json({
      books: data
    });
  })
})





app.post('/book/update/:id', (req, res) => {
  Book.updateOne({_id: req.params.id}, { name: req.body.name, auther:req.body.auther}).then((data) => {
    console.log("DATA", data);
    res.json({
      message: "bookupdated"
    })
  }).catch((err) => {
    console.log("error", err);
  })


})


app.post('/book/delete/:id', (req, res) => {
  Book.deleteOne({ _id: req.params.id }).then((data) => {
    console.log("DATA", data);
    res.status(200).json({
      message: "bookdeleted"
    })
  }).catch((err) => {
    console.log("error", err);
    res.send("delete failed")
  })
})

app.post('/user/sign-up', (req, res) => {
  console.log(req.body);

  var user = new User()
  user.name = req.body.name;
  user.email = req.body.email;
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, hash) {
      // Store hash in your password DB.
      user.hash = hash;
      user.save();
    });
  })

  user.save();
  res.send("slayer has entered the building")
})

app.post('/user/login', (req, res) => {
  console.log('bodddy ', req.body);
  User.findOne({ email: req.body.email }).then(data => {
    console.log('email', data);
    if (!data) {
      res.send("there is no one by that name")
    }
    bcrypt.compare(req.body.password, data.hash, function (err, result) {
      console.log(result);
      if (result == false) {
        res.send("password is wrong")

      } else {
        // var jwt = require('jsonwebtoken');
        // var token = jwt.sign({_id.data.id }, 'hhhh');




        jwt.sign({
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 100),
          data: { id: data._id }
        }, 'var', (err, token) => {
          console.log(token);
          res.json({
            token: token
          })
        })
      }

    });
  })

})

app.post('/user/info', (req, res) => {
  var token = req.body.token;
  //   var decoded = jwt.verify(token, 'var');
  // console.log(decoded.foo)

  jwt.verify(token, 'var', function (err, decoded) {
    console.log('test', decoded) // bar
    User.findOne({ _id: decoded.data.id }).then((data) => {
      console.log('data', data);
      res.json({ user: data.email })
    })

  });

})


app.get('/', function (req, res) {
  res.render('fashion')
})

app.get('/home', function (req, res) {
  res.render('home')
})

app.get('/profile/:username/:rollno/hi', (req, res) => {
  console.log('username is ', req.params);
  let username = req.params.username;
  res.status(200).send('this is profile');
  // res.statusCode = 200;
})

app.get('/employes/:name/:empno', (req, res) => {
  console.log('name is', req.params)
  if (req.params.name == 'varun') {
    // res.send('varun-s employe status');  
    res.render('fashion', { name: req.params.name, isFound: true })
  } else {
    // res.send('empoloye not found')
    res.render('fashion', { isFound: false })
  }

})

app.get('/user', function (req, res) {
  res.send('hello')

})

app.listen(PORT, () => {
  console.log('App Started at port ', PORT);
})
