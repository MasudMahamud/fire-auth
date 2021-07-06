import './App.css';
import Button from '@material-ui/core/Button';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';


firebase.initializeApp(firebaseConfig);

function App() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignIn:false,
    name:'',
    email:'',
    password:'',
    photo:''
  });

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();

  const handleSignIn = ()=>{
    firebase.auth().signInWithPopup(googleProvider)
    .then(res =>{
      const {displayName, photoURL, email} =res.user;
      
      const signInUser={
        isSignIn:true,
        name: displayName,
        email: email,
        photo: photoURL
      }
      setUser(signInUser);
      //console.log(displayName,email,photoURL);
    })
    .catch(error=>{
      console.log(error);
      console.log(error.message);
    })
  }

 const handleSignOut = ()=>{
    firebase.auth().signOut()
    .then(res => {
      const signOutUser ={
        isSignIn:false,
        name:'',
        email:'',
        photo:'',
        error:'',
        success:false,
      }
      setUser(signOutUser);
    })
    .catch(error =>{
      console.log(error);
      console.log(error.message);
    });
 }
 
const handleFbSignIn = ()=>{
  firebase
  .auth()
  .signInWithPopup(fbProvider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
   // var credential = result.credential;

    // The signed-in user info.
    var user = result.user;
    console.log('facebook user', user)

    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
   // var accessToken = credential.accessToken;

  })
  .catch((error) => {
    // Handle Errors here.
   // var errorCode = error.code;
   // var errorMessage = error.message;
    // The email of the user's account used.
    //var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    //var credential = error.credential;

    // ...
  });
}

 const handleBlur = (e)=>{
  let isFormValid =true;
   if(e.target.name==='email'){
    isFormValid = /\S+@\S+\.\S+/.test(e.target.value); 
   }

   if(e.target.name==='password'){
    const isPasswordValid = e.target.value.length > 5;
    const passwordHasNumber = /\d{1}/.test(e.target.value);
    isFormValid =  isPasswordValid && passwordHasNumber
   }

   if(isFormValid){
     const newUserInfo = {...user};
     newUserInfo[e.target.name] = e.target.value;
     setUser(newUserInfo);
   }
 }


const handleSubmit = (e)=>{
  if( newUser && user.email && user.password){
    firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
    .then(res =>{
      const newUserInfo = {...user};
      newUserInfo.error ='';
      newUserInfo.success = true;
      setUser(newUserInfo);
      updateUserName(user.name);
    })
    .catch( error => {
      const newUserInfo = {...user};
      newUserInfo.error = error.message;
      newUserInfo.success = false;
      setUser(newUserInfo);
    });

  }

  if(!newUser && user.email && user.password){
    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
  .then((res) => {
    const newUserInfo = {...user};
      newUserInfo.error ='';
      newUserInfo.success = true;
      setUser(newUserInfo);
      console.log('sign in user info', res.user);
  })
  .catch((error) => {
    const newUserInfo = {...user};
      newUserInfo.error = error.message;
      newUserInfo.success = false;
      setUser(newUserInfo);
  });
  }

  e.preventDefault();
}

const updateUserName = name =>{
  const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
    }).then(() => {
      console.log('user update successful')
    }).catch((error) => {
      console.log(error)
    });
}


  return (
    <div className="App">
        {
          user.isSignIn ? <Button variant="contained" color="secondary" onClick={handleSignOut} >Sign out</Button>:
          <Button variant="contained" onClick={handleSignIn} >Sign in</Button>
        }
        <br /> <br />
        <button onClick={handleFbSignIn} >Sign in using Facebook</button>
         
        {
          user.isSignIn && <div>
            <p>welcome {user.name}</p>
            <p>Email: {user.email}</p>
            <img src={user.photo} alt="" />
          </div>
        }
      
      <h2>Our Authentication</h2>
      <input  onChange={()=>setNewUser(!newUser)} type="checkbox" name="newUser" id="" />
      <label htmlFor="newUser">New user Sign Up</label>        
        <form onSubmit={handleSubmit}>
          <br />
          {
            newUser && <input type="text" placeholder="Enter your name" /> 
          } <br /> <br />
         <input onBlur={handleBlur} type="text" name="email" placeholder="Your email" required />
          <br/><br/>
         <input onBlur={handleBlur} type="password" name="password" id="" placeholder="password" required /> 
         <br/><br/>
         <input type="submit" value={newUser ? 'Sign In' : 'Sign up'} /> <br/><br/>
         <Button variant="contained" color="secondary">Log in</Button>
        </form>
        <p style={{color:'red'}}>{user.error}</p>
        {user.success && <p style={{color:'green'}} >user { newUser ? 'create' : 'Log in'} successfully </p>}
         
    </div>
  );
} 

export default App;
