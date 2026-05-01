
import React from 'react'
import NavigationCompass from './NavigationCompass'
import NavigationController from './NavigationController'
import Pannellum from './Pannellum';
import '../../SCSS/ARScene.scss'
import CameraBackground from './CameraBackground'
import ARMap from './ARMap';
import BackNavigation from './BackNavigation';
import ImgCarousel from './ImgCarousel';
import { useSelector } from 'react-redux';

const ARScene = () => {
  const imgUrl = useSelector((state) => state.orgdata.blueprint);
  const [isARScence, setIsARScence] = React.useState(true);
  const [coords, setCoords] = React.useState({
    src: null,
    dest: null
  });
  const [data, setData] = React.useState({
    image_url: imgUrl,
    phone_width: null,
    phone_height: null,
    start: null,
    end: null
  })
  const [apiData, setApiData] = React.useState(null)
  const [loading, setLoading] = React.useState(false);

  const [carouselToggle, setCarouselToggle] = React.useState(false)
  const [onTheGoToggle, setOnTheGoToggle] = React.useState(true)

  return (
    <>
      {isARScence ?
        <section className="on-the-go">
          <div className="ar-scene">
            <BackNavigation
              setCarouselToggle={setCarouselToggle}
              setOnTheGoToggle={setOnTheGoToggle}
              carouselToggle={carouselToggle}
              onTheGoToggle={onTheGoToggle}
            />
            <NavigationCompass />
            <ARMap
              imgUrl1={imgUrl}
              coords={coords}
              setCoords={setCoords}
              loading={loading}
              setLoading={setLoading}
              setData={setData}
              apiData={apiData}
            />
            {carouselToggle && <ImgCarousel />}
            <NavigationController
              setIsARScence={setIsARScence}
              coords={coords}
              loading={loading}
              setLoading={setLoading}
              data={data}
              setApiData={setApiData}
            />
          </div>
          {onTheGoToggle && <CameraBackground />}
        </section> :
        <Pannellum setIsARScence={setIsARScence} />
      }
    </>


  )
}

export default ARScene