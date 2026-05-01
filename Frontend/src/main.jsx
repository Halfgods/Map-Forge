import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import Homes from './Components/Home/Homes.jsx'
import App from './App.jsx'

const QrScan = lazy(() => import('./Components/QrScan/QrScan.jsx'));
const Login = lazy(() => import('./Components/Auth/Login.jsx'))
const Signup = lazy(() => import('./Components/Auth/Signup.jsx'))
const Upload = lazy(() => import('./Components/Upload/Upload.jsx'))
const AllMap = lazy(() => import('./Components/Allmap/AllMap.jsx'))
const Error = lazy(() => import('./Components/Error/Error.jsx'))


import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from 'react-hot-toast';
import { store } from './Redux/Store'
import { Provider } from 'react-redux'

const Loader = () => {
  return (
    <div>Loading....</div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homes />
  },
  {
    path: "/qr",
    element: <Suspense fallback={<Loader />}><QrScan /></Suspense>
  },
  {
    path: "/map",
    element: <App />
  },
  {
    path: "/login",
    element: <Suspense fallback={<Loader />}><Login /></Suspense>
  },
  {
    path: "/signup",
    element: <Suspense fallback={<Loader />}><Signup /></Suspense>
  },
  {
    path: "/upload",
    element: <Suspense fallback={<Loader />}><Upload /></Suspense>
  },
  {
    path: "/all-map",
    element: <Suspense fallback={<Loader />}><AllMap /></Suspense>
  },
  {
    path: "/*",
    element: <Suspense fallback={<Loader />}><Error /></Suspense>
  }
])

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <>
    <Toaster />
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </>
  // </StrictMode>,
)
