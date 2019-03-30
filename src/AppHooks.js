import React, { useState, useEffect } from 'react';
import { withAuthenticator} from "aws-amplify-react";
import { API, graphqlOperation} from 'aws-amplify';
import {Header, Form, TextArea, Button, List} from 'semantic-ui-react';
import {createNote, deleteNote, updateNote} from "./graphql/mutations";
import {onCreateNote, onDeleteNote, onUpdateNote} from "./graphql/subscriptions";
import {listNotes} from "./graphql/queries";
import "./App.css";



const App = () => {

    const [id, setId] = useState("");
    const [note, setNote] = useState("");
    const [notes, setNotes] = useState([]);

    useEffect( ()=> {
        getData();

        const createNoteListener = API.graphql(graphqlOperation(onCreateNote)).subscribe({
            next: newData => {
                const newNote = newData.value.data.onCreateNote;
                // const prevNotes = notes.filter((note)=> note.id !== newNote.id);
                // const updatedNotes = [...prevNotes, newNote];
                // setNotes((prevNotes)=>[newNote, ...prevNotes]);

                setNotes(prevNotes => {
                    const oldNotes = prevNotes.filter(item => item.id !== newNote.id);
                    const updatedNotes = [...oldNotes, newNote];
                    return updatedNotes;
                })
            }
        });

        const deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe({
            next: deleteData => {
                console.log(deleteData.value.data.onDeleteNote);
                const deletedNoteId = deleteData.value.data.onDeleteNote.id;
                // const newNotes = notes.filter((item)=> item.id !== deletedNoteId);
                // setNotes(newNotes);

                setNotes(prevNotes => {
                    const newNotes = prevNotes.filter(item => item.id !== deletedNoteId);
                    return newNotes;
                })
            }
        });

        const updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe({
                next: updateData => {
                    console.log(updateData.value.data.onUpdateNote);
                    const updatedNote = updateData.value.data.onUpdateNote
                    // const index = notes.findIndex((note)=> note.id === updatedNote.id);
                    // const updatedNotes = [
                    //     ...notes.slice(0, index),
                    //     updatedNote,
                    //     ...notes.slice(index + 1)
                    // ];
                    setNotes(prevNotes =>{
                        const index = prevNotes.findIndex(item => item.id === updatedNote.id);
                        const updatedNotes = [...prevNotes.slice(0,index), updatedNote, ...prevNotes.slice(index+1)];
                        return updatedNotes;
                    });
                    setNote("");
                    setId("");

                }
            }
        );

        // clean up functions
        return ()=>{
            createNoteListener.unsubscribe();
            deleteNoteListener.unsubscribe();
            updateNoteListener.unsubscribe();
        }
    }, []);


    const getData = async () => {
        const result = await API.graphql(graphqlOperation(listNotes));
        setNotes(result.data.listNotes.items);
    };

    const existingItem = () => {
        if (id){
            return  notes.findIndex((note) => note.id === id) > -1;
        }
        return false;
    };

    const handleAddUpdateSubmit = async (e) => {
        e.preventDefault();

        // decide if update or add,
        if ( existingItem() ){
            // update item
            console.log("need update!!");
            handleUpdate()

        } else {
            // add item
            const input = {note};
            await API.graphql(graphqlOperation(createNote, {input} ));
            setNote("");

        }
    };

    const handleUpdate = async () => {
        const input = {id, note };
        await API.graphql(graphqlOperation(updateNote, {input}));
    };

    const handleDelete = async (noteId)=>{
        const input = {id: noteId}; // very careful, input should be map format, not string
        await API.graphql(graphqlOperation(deleteNote,{input}));
    };

    const handleSetItem = ({id, note}) =>{
        setId(id);
        setNote(note);
    };

    const handleChange = (e) => setNote(e.target.value);


    return (
        <div className={"header"}>
            <Header as={"h1"} block textAlign={'center'}>Simple Note App</Header>
            <Header as={"h4"} textAlign={'center'}>Add notes, query by GraphQL, multi-user, on-subscription update</Header>
            <Header as={"h4"} textAlign={'center'}>Open multiple browsers with the same URL to see how it works.</Header>
            <Form onSubmit={handleAddUpdateSubmit}>
                <Form.Field
                    control={TextArea}
                    label="Note"
                    placeholder="write your note"
                    value={note}
                    onChange={handleChange}
                    autoFocus
                />
                <Form.Field control={Button} className="button" color="blue">{id ? 'Update Note':'Add Note'}</Form.Field>
            </Form>

            <List size={"huge"}>
                {notes.map((item)=>
                    <List.Item key={item.id}>
                        <List.Content floated='right'>
                            <Button
                                size="mini"
                                color="orange"
                                onClick={()=>handleDelete(item.id)}
                            >Delete</Button>
                        </List.Content>
                        <List.Content onClick={()=>handleSetItem(item)}>
                            <List.Header onFocus>{item.note}</List.Header>
                        </List.Content>
                    </List.Item>

                )}
            </List>

        </div>)

};

export default withAuthenticator(App, {includeGreetings: true});