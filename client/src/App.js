import {useSelector} from "react-redux"
import Login from "./components/Login/Login"
import {getUser} from "./store/userSlice"
import Loading from "./components/Loading"
import authHook from "./util/userState"
import Header from "./components/Header/Header"
import "./styles/global.css"
import "./index.css"

function App() {

  const user=useSelector(getUser)
  const load=authHook()
  return  load ? (<Loading/>):(!user ?
    <Login/>:(
      <Header/>
    )
  )
}

export default App;