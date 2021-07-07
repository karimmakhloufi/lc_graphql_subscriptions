import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";

import Login from "./Login";
import Messages from "./Messages";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/messages">
          <Messages />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
