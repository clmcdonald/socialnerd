import './App.css';
import EnrollPage from './components/EnrollPage';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Header from './components/Header';
import MessagesPage from './components/MessagesPage';
import AdminPage from './components/AdminPage';


function App() {
  return (
    <Router>
      <Header />
      <div style={{ marginTop: '90px' }}>
        <Switch>
          <Route path="/" exact>
            <EnrollPage />
          </Route>
          <Route path="/messages" exact>
            <MessagesPage />
          </Route>
          <Route path="/admin" exact>
            <AdminPage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
