import { useState} from 'react'
import './App.css'
import { Routes,BrowserRouter,Route,Navigate } from 'react-router-dom'
import Login from './pages/Login'
function App() {
  //const [count, setCount] = useState(0)

  return (
   <BrowserRouter>
   <Routes>
    <Route path='/' element={<Navigate to ="/login" replace/>} />
    <Route path='/login' element={<Login/>}/>


   </Routes>
   </BrowserRouter>


  )
}

export default App
