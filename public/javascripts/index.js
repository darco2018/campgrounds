$(document).ready(() => {
  const defaultImageUrl = '/images/default.jpg';
  //------ Fix unloaded images with default image -----------
  const images = document.getElementsByTagName('img');

  function isImgLoaded(imgElement) {
    return imgElement.complete && imgElement.naturalHeight !== 0;
  }

  for (let image of images) {
    if (!isImgLoaded(image)) {
      image.setAttribute('src', defaultImageUrl);
    }
  }

  // --------------------------------------------

  /*  const welcomeParag = document.getElementById('welcome');
  welcomeParag.innerHTML = 'Welcome ...'; */
});
