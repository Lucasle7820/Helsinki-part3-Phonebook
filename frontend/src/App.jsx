import { useState, useEffect, useMemo } from 'react'
import personService from './services/person'
import Notification from './components/Noti'


const Filter = ({searchQuery, setSearchQuery}) => {
    return (
      <div>
        filter shown with <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>
    )
}

const PersonForm = ({onSubmit, newPerson, setNewPerson}) => {
  return(
      <form onSubmit = {onSubmit}>
        <div>
          name: <input 
          value={newPerson.name} 
          onChange={e=>setNewPerson({ ...newPerson, name: e.target.value })}/>
        </div>
        <div>
          number: <input 
          value={newPerson.number} 
          onChange={e=>setNewPerson({ ...newPerson, number: e.target.value })} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
  )
}

const Persons = ({searchQuery, filteredPersons, persons, onClick}) => {
  return(
  <div>
    {(searchQuery === '' ? persons : filteredPersons).map(person => (
      <div key={person.id}>
        {person.name} {person.number}
        <button onClick={()=> onClick(person.id, person.name)}>delete</button>
      </div>
    ))}
  </div>
  )
}


const App = () => {
  const [persons, setPersons] = useState([])

  const [newPerson, setNewPerson] = useState({ name: '', number: '' })

  const [searchQuery, setSearchQuery] = useState('')

  const [Noti, setNoti] = useState({ message: '', type: ''})

  useEffect(() => {
    personService.getAll().then(initialPersons => {
        setPersons(initialPersons);
      })
      .catch(err => {
        setError(err);
      });
  }, []); 


  const handleAdd = (e) => {
    e.preventDefault();

    const exist = persons.find(
      person => person.name.toLowerCase() === newPerson.name.toLowerCase()
    );

    if (exist) {
      const confirmUpdate = window.confirm(
        `${newPerson.name} is already added to phonebook, replace the old number with a new one?`
      );

      if (confirmUpdate) {
        const updatedPerson = {
          ...exist,
          number: newPerson.number,
        };

        personService
          .update(updatedPerson.id, updatedPerson)
          .then(returnedNew => {
            setPersons(
              persons.map(person =>
                person.id !== updatedPerson.id ? person : returnedNew
              ));
            setNewPerson({ name: '', number: '' });
            setNoti({ message: `number from ${updatedPerson.name} was changed`, type: 'success' })
            })
            .catch(error => {
              setNoti({ message: `infor of ${updatedPerson.name} has already been removed from server`, type: 'error' })
            })
        ;
      }
    } else {
      const newPersonObj = {
        name: newPerson.name,
        number: newPerson.number,
      };

      personService.create(newPersonObj).then(returnedNew => {
        setPersons([...persons, returnedNew]);
        setNewPerson({ name: '', number: '' });
        setNoti({ message: `Added ${newPerson.name}`, type: 'success' })
      });
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id));
        })
        .catch(error => {
          console.error("Failed to delete person:", error)
          setNoti({ message: 'Failed to delete person', type: 'error' })
        });
    }
  };


  const filteredPersons = useMemo(() =>
    persons.filter(person =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase())
    ), [persons, searchQuery])


  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={Noti.message} setMessage={setNoti} type={Noti.type} />

      <Filter searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <h2>add a new</h2>
      <PersonForm onSubmit={handleAdd}  newPerson={newPerson} setNewPerson={setNewPerson} />

      <h2>Numbers</h2>
      <Persons onClick={handleDelete} searchQuery={searchQuery} filteredPersons={filteredPersons} persons={persons} />
    </div>
  )
}

export default App