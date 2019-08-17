require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path');
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(bodyParser.json());

morgan.token('body', req => {if (req.method === 'POST') return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

app.post('/api/persons', (req,res,next) => {

    const { name, number } = req.body;
    if (!name){
        res
            .status(400)
            .json({error: "name is missing"})
    }
    if (!number){
        res
            .status(400)
            .json({error: "number is missing"})
    }

    const newPerson = new Person({
        name,
        number
      });
    

    newPerson
        .save()
        .then(savedPerson => savedPerson.toJSON())
        .then(savedAndFormattedPerson => res.status(201).json(savedAndFormattedPerson))
        .catch(error => next(error))
    
})

app.get('/api/persons', (req, res,next) => {
    Person
        .find({})
        .then(people =>res.json(people))
        .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res,next) => {
    Person
        .findById(req.params.id)
        .then(returnedPerson => res.json(returnedPerson))
        .catch(error => next(error));
})

app.delete('/api/persons/:id', (req,res,next) => {
    Person
        .findByIdAndRemove(req.params.id)
        .then(result => {
                result  
                ? res.status(204).end()
                : next({name: `No object`, id: req.params.id}) 
            })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number, id } = req.body
  
    const newPerson = {
      name,
      number,
      id
    }
  
    Person.findByIdAndUpdate(req.params.id, newPerson, { new: true })
      .then(updatedPerson => {
        res.json(updatedPerson.toJSON())
      })
      .catch(error => next(error))
  })

app.get('/info', (req,res,next) => {
    Person
        .find({})
        .then(people => {
            res.send(`<h3>Phonebook has info for ${people.length}</h3><p>${new Date()}</p>`)
        })
        .catch(error => next(error))
})

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const errorHandler = (error, request, response, next) => {
  
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      response.status(400).json({ error: 'malformatted id' })
    } 

    else if (error.name === 'ValidationError') {
        response.status(400).json({ error: error.message })
    }
    
    else if (error.name === 'No object'){
        response.status(404).json({error: `Missing object with ID: ${error.id}`})
    }
  
    next(error)
}
  
app.use(errorHandler)

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})