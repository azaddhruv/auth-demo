if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')
const User = require('./models/user.js')
const sgMail = require('@sendgrid/mail')
const Joi = require('joi')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const { signupValidate, loginValidate } = require('./middleware.js')
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/auth-demo'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
sgMail.setApiKey(process.env.API_KEY)

main().catch((err) => console.log(err))

async function main() {
  await mongoose.connect(dbUrl)
}

app.get('/', (req, res) => {
  res.send(
    'Hello Welcome to my api, quick tour, at /api/signup and include username email and password for register. At /api/login send username and password. At /api/forgotpassword send registered email to recieve reset mail and send your new password as password only to that link to change password.  '
  )
})

app.post('/api/signup', signupValidate, async (req, res) => {
  try {
    const { username, email, password } = req.body
    const hashPassword = await bcrypt.hash(password, 12)
    const user = await new User({ username, email, password: hashPassword })
    await user.save()
    res.send('User Added')
  } catch (err) {
    if (err.code === 11000) {
      const key = err.keyPattern
      return res.send(`${Object.keys(key)[0]} already in use`)
    }
    console.log(err)
    res.send(err)
  }
})

app.post('/api/login', loginValidate, async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })
    if (user) {
      const matchPass = await bcrypt.compare(password, user.password)
      if (matchPass) {
        res.send('User Logged in successfully')
      } else {
        res.send('username or password mismatch')
      }
    } else {
      res.send('User not found')
    }
  } catch (err) {
    res.send(err)
  }
})

app.post('/api/forgotpassword', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    console.log(user)
    if (user) {
      const message = {
        to: email,
        from: 'azadrohan2001@gmail.com',
        subject: 'Hello from azadrohan',
        text: `use this endpoint to update password - https://rocky-dusk-09700.herokuapp.com/api/reset/${user._id}`,
        html: `<h4>use this endpoint to update password - https://rocky-dusk-09700.herokuapp.com/api/reset/${user._id}</h4>`,
      }

      sgMail
        .send(message)
        .then((res) => console.log(res))
        .catch((err) => console.log(err))
      res.send('check you mail')
    } else {
      res.send('enter a valid email address')
    }
  } catch (err) {
    console.log(err)
    res.send('error')
  }
})

app.put('/api/reset/:id', async (req, res) => {
  try {
    const { id } = req.params
    console.log(id)
    const { password } = req.body
    const newPassword = await bcrypt.hash(password, 12)
    const user = await User.findByIdAndUpdate(
      id,
      { password: newPassword },
      { new: true }
    )
    console.log(user)
    res.send('password changed successfully')
    if (user) {
    }
  } catch (err) {
    console.log(err)
    res.send('error')
  }
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`listining on port ${port}...`)
})
