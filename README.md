Title: Note take app

AWS Amplify and GraphQL. 

Very simple GraphQL schema:  

type Note @model @auth(rules:[{allow: owner}]){
  id: ID!
  note: String!
  description: String
}

