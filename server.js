const PORT = process.env.PORT || 3001;
const fs = require('fs');
const path = require('path');

const express = require('express');
const app = express();

const dbFilePath = path.join(__dirname, 'db', 'db.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
  const allNotes = getNotes();
  res.json(allNotes.slice(1));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function getNotes() {
  const notesData = fs.readFileSync(dbFilePath, 'utf8');
  return JSON.parse(notesData) || [];
}

function saveNotes(notesArray) {
  fs.writeFileSync(dbFilePath, JSON.stringify(notesArray, null, 2));
}

function createNewNote(body) {
  const newNote = body;
  const notesArray = getNotes();

  if (notesArray.length === 0) {
    notesArray.push({ id: 0 });
  }

  newNote.id = notesArray[0].id;
  notesArray[0].id++;

  notesArray.push(newNote);

  saveNotes(notesArray);

  return newNote;
}

app.post('/api/notes', (req, res) => {
  const newNote = createNewNote(req.body);
  res.json(newNote);
});

function deleteNote(id) {
  const notesArray = getNotes();

  for (let i = 0; i < notesArray.length; i++) {
    let note = notesArray[i];

    if (note.id == id) {
      notesArray.splice(i, 1);
      saveNotes(notesArray);
      break;
    }
  }
}

app.delete('/api/notes/:id', (req, res) => {
  deleteNote(req.params.id);
  res.json(true);
});

app.listen(PORT, () => {
  console.log(`API server on port ${PORT}`);
});
