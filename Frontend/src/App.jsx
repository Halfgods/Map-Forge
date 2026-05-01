import React, { useEffect } from 'react'
import ARScene from './Components/ARScene/ARScene';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
const App = () => {
  const navigate = useNavigate()
  const { blueprint, panorama, buildings } = useSelector((state) => state.orgdata)

  useEffect(() => {
    if (!blueprint || !panorama) {
      navigate('/all-map');
    }
  }, []);

  if (!blueprint || !panorama) return null;

  return (
    <>
      <ARScene />
    </>
  )
}

export default App