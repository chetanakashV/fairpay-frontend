import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Register from './Pages/Auth/Register';
import Landing from './Pages/Landing'
import Login from './Pages/Auth/Login';
import Dashboard from './Pages/Options/Dashboard';
import Groups from './Pages/Options/Groups'
import Friends from './Pages/Options/Friends'
import Activity from './Pages/Options/Activity'
import Settings from './Pages/Options/Settings'
import UserProvider from './Helper/UserContext';
import Account from './Pages/Options/Account';
import Footer from './Components/Footer';
import Temp from './Pages/Temp';

import SignIn from './Pages/Authentication/SignIn';
import SignUp from './Pages/Authentication/SignUp';

import './App.css'

function App() {
  return (
     <UserProvider>
      <Router>
          <Routes>
              <Route exact path = "/" element = {<Landing/>}/>
              
              <Route exact path = "/login" element = {<SignIn/>} />
              <Route exact path = "/signup" element = {<SignUp/>}/> 

              <Route exact path = "/dashboard" element = {<Dashboard/>} />
              <Route exact path = "/groups" element = {<Groups/>} />
              <Route exact path = "/friends" element = {<Friends/>} />
              <Route exact path = "/activity" element = {<Activity/>} />
              <Route exact path = "/settings" element = {<Settings/>} />
              <Route exact path = "/account" element = {<Account/>} />
              <Route exact path = "/test" element = {<Temp/>} />
          </Routes>
      </Router>
      </UserProvider>
  );
}

export default App;
