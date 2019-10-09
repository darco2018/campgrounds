$(document).ready(() => {
  const defaultImageUrl = '/images/default.jpg';

  console.log($);
  console.log(
    'If you see this message without error before it, JQuery is working.'
  );
  console.log(
    'To remove jQuery, remove the script link in view/partials/footer. Footer is part of landing.ejs'
  );

  //------ Fix unloaded images with default image -----------
  const images = document.getElementsByTagName('img');

  function isImgLoaded(imgElement) {
    return imgElement.complete && imgElement.naturalHeight !== 0;
  }

  for (let image of images) {
    if (!isImgLoaded(image)) {
      image.setAttribute('src', defaultImageUrl);
    }
    console.log(isLoaded);
  }

  // --------------------------------------------

  /*  const welcomeParag = document.getElementById('welcome');
  welcomeParag.innerHTML = 'Welcome ...'; */
});
