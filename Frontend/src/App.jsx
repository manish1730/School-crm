// import './App.css'
// import Login from './pages/Login'

// function App() {
//   return (
//     <>
//    <Login/>
//     </>
//   )
// }

// export default App
import DashboardLayout from "./layouts/Dasboardlayout.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Login from "./pages/Login/Login.jsx";
import AppRoutes from "./routes/appRoutes.jsx"

function App() {
  return <AppRoutes/>;
}

export default App;
