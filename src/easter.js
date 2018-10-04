// @flow

import 'console.image';

(async () => {
  setTimeout(() => {
    console.log('%cWelcome to Face2Face.', 'font-size: 15px;')
  }, 100)
})()

// $FlowFixMe
window.credits = 'Code by Alexey Ermolaev (http://dotterian.ru)'

// $FlowFixMe
window.kitty = () => {
  console.log('%cHere\'s some kitty for you:', 'font-size: 15px; font-weight: bold;')
  const width = Math.ceil(150 + Math.random() * 400)
  const height = Math.ceil(150 + Math.random() * 400)
  const isGrayscale = Math.random() >= 0.5
  let link = `http://placekitten.com/${width}/${height}`
  if (isGrayscale) {
    link = `http://placekitten.com/g/${width}/${height}`
  }
  // $FlowFixMe
  console.image(link, 1)
}
