$(document).ready(() => {
  //------ Fix unloaded images with default image -----------
  setTimeout(() => {
    const defaultImageUrl = '/images/default.jpg';
    const images = document.getElementsByTagName('img');

    function isImgLoaded(imgElement) {
      return imgElement.complete && imgElement.naturalHeight !== 0;
    }

    for (let image of images) {
      if (!isImgLoaded(image)) {
        image.setAttribute('src', defaultImageUrl);
      }
    }
  }, 2000);

  // --------------------------------------------

  /*  const welcomeParag = document.getElementById('welcome');
  welcomeParag.innerHTML = 'Welcome ...'; */
});
