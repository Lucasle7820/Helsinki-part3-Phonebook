import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import Person from './modules/person.js'
import './mongo.js'

const app = express()
const PORT = process.env.PORT || 3001


app.use(cors())
app.use(express.json())

morgan.token('body', (req) => {
  return req.method === 'POST' || req.method === 'PUT'
    ? JSON.stringify(req.body)
    : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', async (req, res, next) => {
  try {
    const people = await Person.find({})
    res.json(people)
  } catch (err) {
    next(err)
  }
})


app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id)
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  } catch (err) {
    next(err)
  }
})


app.get('/info', async (req, res, next) => {
  try {
    const count = await Person.countDocuments({})
    res.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${new Date()}</p>
    `)
  } catch (err) {
    next(err)
  }
})

app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    await Person.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

app.post('/api/persons', async (req, res, next) => {
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({ error: 'name or number is missing' })
  }

  try {
    const exists = await Person.exists({ name })
    if (exists) {
      return res.status(400).json({ error: 'name must be unique' })
    }

    const newPerson = new Person({ name, number })
    const saved = await newPerson.save()
    res.status(201).json(saved)
  } catch (err) {
    next(err)
  }
})

app.put('/api/persons/:id', async (req, res, next) => {
  const { number } = req.body

  if (!number) {
    return res.status(400).json({ error: 'number is missing' })
  }

  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      { number },
      {
        new: true,             // return the updated document
        runValidators: true,   // ensure the new number meets schema rules
        context: 'query'       // needed for some validator types
      }
    )

    if (updatedPerson) {
      res.json(updatedPerson)
    } else {
      res.status(404).end()
    }
  } catch (err) {
    next(err)
  }
})



app.use((err, req, res, next) => {
  console.error(err.message)
  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }
  next(err)
})


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})