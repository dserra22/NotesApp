import "./App.css";
import { Dexie } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import {
  ButtonGroup,
  Button,
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";

// Dexie
var db = new Dexie("NotesDB"); // Store our notes in a database
let id = 0;
// DB with single table "friends" with primary key "id"
// index properties "name", "age"
db.version(3).stores({
  notes: `++id,
    title,
    body`,
});

db.notes.toArray().then((arr) => {
  id = arr.length;
});

// Now add some values.
// db.notes.bulkPut([{ id: 1, title: "da", body: "lorem!asodijij" }]);

const addNoteDatabase = (data) => {
  let newNote = { id: data.id, title: data.title, body: data.body };
  id += 1;
  db.notes
    .add(newNote)
    .then((result) => console.log("result" + result))
    .catch((err) => console.log(err));
};

function App() {
  const [isModalOpened, openModal] = useState(false);

  const [isUpdateModalOpened, openUpdateModal] = useState(false);

  const allNotes = useLiveQuery(() => db.notes.toArray());

  const [aNote, updateANote] = useState({ title: "", body: "", id: "" });

  const openTheModal = () => {
    openModal((prevState) => !prevState);
  };

  const openTheUpdateModal = () => {
    openUpdateModal((prevState) => !prevState);
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    borderRadius: "10px",
    p: 4,
  };

  const addNote = (e) => {
    let form = e.target;
    let title = form.querySelector("input").value;
    let body = form.querySelector("textarea").value;
    addNoteDatabase({ id: id, title: title, body: body });
  };

  const viewNote = (note, e) => {
    updateANote((prevNote) => {
      prevNote.body = note.body;
      prevNote.title = note.title;
      return { ...prevNote };
    });
  };

  const deleteNote = async (id, e) => {
    console.log(id);
    try {
      await db.notes.delete(id);
    } catch (error) {
    } finally {
      console.log("complete");
    }
  };

  const updateNote = (e) => {
    let form = e.target;
    let body = form.querySelector("textarea").value;
    console.log(body);

    console.log(aNote);
    db.notes.put({ id: aNote.id, title: aNote.title, body: body });
  };

  let updateModal = (
    <Modal
      open={isUpdateModalOpened}
      onClose={openTheUpdateModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="modal"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Update!
        </Typography>
        <form className="modal-form" onSubmit={updateNote}>
          <textarea placeholder="body" style={{ width: "100%" }} />
          <Button type="submit">Submit</Button>
        </form>
      </Box>
    </Modal>
  );

  const update = (aNote, e) => {
    updateANote((prevNote) => {
      prevNote.body = aNote.body;
      prevNote.title = aNote.title;
      prevNote.id = aNote.id;
      return { ...prevNote };
    });
    openTheUpdateModal((prevState) => !prevState);
  };
  return (
    <div className="App">
      <header className="App-header">
        {updateModal}
        <Modal
          open={isModalOpened}
          onClose={openTheModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          className="modal"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add a note to the application!
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Add a title and a body, then press submit
            </Typography>
            <form className="modal-form" onSubmit={addNote}>
              <input placeholder="title" style={{ width: "100%" }} />
              <textarea placeholder="body" style={{ width: "100%" }} />
              <Button type="submit">Submit</Button>
            </form>
          </Box>
        </Modal>
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
        >
          <Button onClick={openTheModal}>Add</Button>
        </ButtonGroup>

        <List>
          {allNotes?.map((aNote, i) => {
            return (
              <ListItem key={i}>
                <ListItemText
                  primary={aNote.title}
                  secondary={`${
                    aNote.body.slice(0, 10).length < 10
                      ? aNote.body.slice(0, 10)
                      : aNote.body.slice(0, 10) + "..."
                  }`}
                />
                <Button onClick={deleteNote.bind(null, aNote.id)} color="error">
                  Delete
                </Button>
                <Button onClick={update.bind(null, aNote)}>Update</Button>
                <Button color="success" onClick={viewNote.bind(null, aNote)}>
                  View
                </Button>
              </ListItem>
            );
          })}
        </List>

        {aNote.title !== "" ? (
          <Paper className="note">
            <Typography variant="h6" component="h2">
              {aNote.title}
            </Typography>
            <Typography sx={{ mt: 2 }}>{aNote.body}</Typography>
          </Paper>
        ) : (
          <></>
        )}
      </header>
    </div>
  );
}

export default App;
