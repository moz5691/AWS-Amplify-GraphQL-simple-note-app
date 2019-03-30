import React, { Component } from 'react';
import { withAuthenticator} from "aws-amplify-react";
import { API, graphqlOperation} from 'aws-amplify';
import {Header, Form, TextArea, Button, List} from 'semantic-ui-react';
import {createNote, deleteNote, updateNote} from "./graphql/mutations";
import {onCreateNote, onDeleteNote, onUpdateNote} from "./graphql/subscriptions";
import {listNotes} from "./graphql/queries";
import "./App.css";



class App extends Component {

  state = {
    id: "",
    note: "",
    notes:[]

  };

  componentDidMount() {
    this.getData();

    this.createNoteListener = API.graphql(graphqlOperation(onCreateNote)).subscribe({
      next: newData => {
        const newNote = newData.value.data.onCreateNote;
        const prevNote = this.state.notes.filter((note)=> note.id !== newNote.id);
        this.setState({notes: [newNote, ...prevNote]});
      }
    });

    this.deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
      next: deleteData => {
        const {notes} = this.state;
        console.log(deleteData.value.data.onDeleteNote);
        const deletedNoteId = deleteData.value.data.onDeleteNote.id;
        const newNotes = notes.filter((item)=> item.id !== deletedNoteId);
        this.setState({notes: newNotes});
      }
    });

    this.updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
       next: updateData => {
         const {notes} = this.state;
         console.log(updateData.value.data.onUpdateNote);
         const updatedNote = updateData.value.data.onUpdateNote
         const index = notes.findIndex((note)=> note.id === updatedNote.id);
         const updatedNotes = [
           ...notes.slice(0, index),
           updatedNote,
           ...notes.slice(index + 1)
         ];
         this.setState({notes: updatedNotes})

         }
      }
    )

  }

  componentWillUnmount() {
    this.createNoteListener.unsubscribe();
    this.deleteNoteListener.unsubscribe();
    this.updateNoteListener.unsubscribe();
  }

  getData = async () => {
    const result = await API.graphql(graphqlOperation(listNotes));
    this.setState({notes: result.data.listNotes.items});
  };

  existingItem = () => {
    const {notes, id} = this.state;
    if (id){
      return  notes.findIndex((note) => note.id === id) > -1;
    }
    return false;
  };

  handleAddUpdateSubmit = async (e) => {
    e.preventDefault();
    const {note} = this.state;

    // decide if update or add,
    if ( this.existingItem() ){
      // update item
      console.log("need update!!")
      this.handleUpdate()

    } else {
      // add item
      const input = {note};
      await API.graphql(graphqlOperation(createNote, {input} ));
      //const newNote = result.data.createNote;
      //console.log("new note", newNote);
      //this.setState({notes: [newNote, ...notes], note:""});
      this.setState({note: ""});

    }
  };

  handleUpdate = async () => {
    const {id, note} = this.state;
    const input = {id, note };
    await API.graphql(graphqlOperation(updateNote, {input}));
    // console.log("update", result);
    // const updatedNote = result.data.updateNote;
    // const index = notes.findIndex((note)=> note.id === updatedNote.id);
    // const updatedNotes = [
    //     ...notes.slice(0, index),
    //     updatedNote,
    //     ...notes.slice(index + 1)
    // ];
    this.setState({note:"", id:""})

  };

  handleDelete = async (noteId)=>{
    const input = {id: noteId}; // very careful, input should be map format, not string
    await API.graphql(graphqlOperation(deleteNote,{input}));
    //console.log('deleted', result);
    // const deletedNoteId = result.data.deleteNote.id;
    // const newNotes = notes.filter((item)=> item.id !== deletedNoteId);
    // this.setState({notes: newNotes});
  };

  handleSetItem = ({id, note}) =>{
    this.setState({note, id});
  };

  handleChange = (e) => {
    this.setState({note: e.target.value});
  };

  render() {
    const {notes, id, note} = this.state;
    return (
      <div className={"header"}>
        <Header as={"h1"} block textAlign={'center'}>Note taker</Header>
        <Form onSubmit={this.handleAddUpdateSubmit}>
            <Form.Field
                control={TextArea}
                label="Note"
                placeholder="write your note"
                value={note}
                onChange={this.handleChange}
            />
            <Form.Field control={Button} className="button" color="blue">{id ? 'Update Note':'Add Note'}</Form.Field>
        </Form>

        <List>
          {notes.map((item)=>
              <List.Item key={item.id}>
                <List.Content floated='right'>
                  <Button
                      color="orange"
                      onClick={()=>this.handleDelete(item.id)}
                  >Delete</Button>
                </List.Content>
                <List.Content onClick={()=>this.handleSetItem(item)}>
                  {item.note}
                </List.Content>
              </List.Item>

          )}
        </List>

      </div>
    );
  }
}

export default withAuthenticator(App, {includeGreetings: true});
