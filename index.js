const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')

app.use(cors())
app.use(bodyParser.json());

morgan.token('body', req => {if (req.method === 'POST') return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let people = [
        {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
        },
        {
        "name": "franka",
        "number": "342322",
        "id": 6
        },
        {
        "name": "jasdf",
        "number": "dsf32r23",
        "id": 8
        }
]

const generateId = () => {
    return Math.floor(Math.random() * Math.floor(100000));
}

const doesNameExist = (name) => {
    return (people.findIndex(person => person.name === name))
}
//The name already exists in the phonebook

app.post('/api/persons', (req,res) => {
    const id = generateId();
    const { name, number } = req.body;
    if (!name){
        return res.status(400)
        .json({error: "name is missing"})
    }
    if (!number){
        return res.status(400)
        .json({error: "number is missing"})
    }
    if (doesNameExist(name) > 0){
        return res.status(400)
        .json({error: "name already exists"})
    }
    
    const newPerson = {name,number,id};
    people = people.concat(newPerson);
    res.json(newPerson);
})

app.get('/api/persons', (req, res) => {
  res.send(people)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const findPerson = people.filter(person => person.id === id);    
    if(findPerson.length === 0){
        res.status(404).end()
    }
    res.send(findPerson);
})

app.delete('/api/persons/:id', (req,res) => {
    const id = Number(req.params.id);
    people = people.filter(person => person.id === id);
    res.status(204).end()
})

app.get('/info', (req,res) => {
    const countPhonebook = people.length;
    const date = new Date()
    res.send(`<h3>Phonebook has info for ${countPhonebook}</h3><p>${date}</p>`)
})



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})