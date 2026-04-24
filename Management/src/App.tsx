
import './App.css'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import HomePage from './components/HomePage'

function App() {


  return (
    <>
   <Routes>
    <Route path='/' element={<LoginPage/>}/>
    <Route path='/home' element={<HomePage/>}/>
   </Routes>
    </>
  )
}

export default App
