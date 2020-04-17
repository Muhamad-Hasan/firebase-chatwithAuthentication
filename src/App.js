import React from 'react';
import './App.css';
import Row from './components/Row';
import * as userAction from "./redux/action/userAction";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import firebase from "firebase";
import TextField from '@material-ui/core/TextField'
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { ChatFeed, Message } from 'react-chat-ui'
 

const config = {
  apiKey: "AIzaSyBupZO4hr-nTUdidjAhNwB4_2hl3g0B5No",
  authDomain: "chatapp-60b21.firebaseapp.com",
  databaseURL: "https://chatapp-60b21.firebaseio.com",
  projectId: "chatapp-60b21",
  storageBucket: "chatapp-60b21.appspot.com",
  messagingSenderId: "452758335641",
  appId: "1:452758335641:web:da1e09a78cc6820c118808",
  measurementId: "G-BVG9ZZXPLT"
};
firebase.initializeApp(config);

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
     email : "",
     password : "",
      messages : [
        
      ],
      user : {},
      isAuthenticated : false,
      text : ""
    
    }
    this.signIn = this.signIn.bind(this); 
  }


  componentDidMount(){
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        this.setState({isAuthenticated : true});
        this.getMessage();
      } else {
        this.setState({ isAuthenticated: false, user: {}, messages: [] });
       }
     });
  }

  renderSignOutButton() {
    if (this.state.isAuthenticated) {
      return <Button onClick={() => this.signOut()}>Sign out</Button>;
    }
    return null;
  }


  renderChat() {
    return (
      <div>
        <ChatFeed
        user={localStorage.getItem('loginUserId')}
        messages={this.state.messages.slice().reverse()}
        showSenderName
      />
      <input type = "text" name="text" value={this.state.text} onChange={(e)=>{this.setState({text : e.target.value})}}  />
      <button onClick={()=>{this.onSend()}}>send</button> 
      </div>
      
    );
  }
  
  async onSend(){
    
    try{
      let  message = this.state.text;
    const db = firebase.firestore();
    alert(localStorage.getItem('loginUserId'));
    let send =await db.collection('chat').add({
      message : message ,
      sender_id : localStorage.getItem('loginUserId'),
      timestamp:firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log('send' , send);
    this.setState({text  :""});
    this.getMessage();  
  }
    catch(err){
      console.log("err" , err.message);
    }
    
  }

  async getMessage(){
    try {
      let message = [];
      const db  = firebase.firestore();
     let data =await db.collection("chat").get();
     data.forEach(function(doc){
       console.log("is" , doc.data() , doc.id);
       if(localStorage.getItem("loginUserId") != doc.data().sender_id){
         
        message = [...message ,  new Message({
          id: 1,
          message: doc.data().message,
          senderName :"hassan"
        })];
       }
       else{
        message = [...message ,  new Message({
          id: 0,
          message: doc.data().message,
          senderName :"Aun"
        })];
       }
       
     })
  
console.log("messages" , message);
this.setState({messages : message});
    }catch(err){
      console.log("err" , err);
    }
  }

renderPopup() {
  return (
    
    <Dialog  open={!this.state.isAuthenticated}>
      <DialogTitle id="simple-dialog-title">Sign In</DialogTitle>
      <div>
        <List>
        <DialogContent>
        <TextField id="email" label="Email" value ={this.state.email} variant="outlined" onChange={(e)=>{this.setState({email : e.target.value})}} />
        <br />
        <br />
        
        <TextField id="password" label="password" value = {this.state.password} variant="outlined" onChange={(e)=>{this.setState({password : e.target.value})}}/>
        
        </DialogContent>

        <DialogActions>
          <Button onClick={this.signIn} color="primary">
           signIn
          </Button>
          <Button onClick={()=>{this.login()}} color="primary">
            logIn
          </Button>
        </DialogActions>
          {/* <DialogTitle id="alert-dialog-slide-title">{"Sign In"}</DialogTitle> */}
        {/* <FormLabel color="black"> Email : </FormLabel> */}
        {/* <Input color ="primary" margin="dense"/> */}
          {/* <ListItem button onClick={() => this.signIn()}>
            <ListItemAvatar>
              <Avatar style={{ backgroundColor: "#eee" }}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                  height="30"
                  alt="G"
                />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Sign in with Google" />
          </ListItem> */}
        </List>
      </div>
    </Dialog>
  );
}

  async signIn(){
    console.log("this" , this.state.email)
    let {email , password} = this.state;
    console.log("email" , email , password , this.state);
    try{
      let auth = await firebase.auth().createUserWithEmailAndPassword(email, password);
      console.log("quth" , auth.user.uid);
      localStorage.setItem('loginUserId' , auth.user.uid);
      this.setState({isAuthenticated : true });
    }
    catch(err){
      console.error(err.code , err.message)
    }
    
  }
  async login(){
    let {email , password} = this.state;
    try{
      const db = firebase.firestore();
    
      let auth = await firebase.auth().signInWithEmailAndPassword(email , password);
      let uid = auth.user.uid;
      console.log("done");
      localStorage.setItem('loginUserId' , uid);
   
      this.setState({isAuthenticated : true , email : "" , password : ''});
    }
    catch(err){
      console.error(err.message);
    }
  } 
  async signOut() {
    firebase.auth().signOut();
    console.log("state" , this.state);
    this.setState({isAuthenticated : false  });
  }

  
  
  render(){
    console.log("mstart" , this.state.messages);

    return (
      <div style={styles.container}>
      {this.renderPopup()}
      <div style={styles.channelList}>Channels</div>
      <div style={styles.chat}>{this.renderChat()}</div>
      <div style={styles.settings}>{this.renderSignOutButton()}</div>
    </div>
    )
        
  }
}


const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    height: "100vh",
  },
  channelList: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
  chat: {
    display: "flex",
    flex: 3,
    flexDirection: "column",
    borderWidth: "1px",
    borderColor: "#ccc",
    borderRightStyle: "solid",
    borderLeftStyle: "solid",
  },
  settings: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
  },
};
const mapStateToProps = state => ({
  loading: state.userReducer.loading,
  usersData : state.userReducer.users,
  chat : state.userReducer.chat
});
const mapDispatchToProps = dispatch => ({
  addUser: bindActionCreators(userAction.createUser, dispatch),
  users: bindActionCreators(userAction.getUser, dispatch),
  checkUser : bindActionCreators(userAction.checkUser , dispatch),
  sendMessage : bindActionCreators(userAction.sendMessage , dispatch),
  getChat: bindActionCreators(userAction.getChat, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
