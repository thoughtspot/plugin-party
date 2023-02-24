/**
 * @OnlyCurrentDoc
 */

function onOpen() {
  SlidesApp.getUi()
    .createMenu('ThoughtSpot to Slides')
    .addItem('Get Liveboards', 'showTSSidebar')
    .addSeparator()
    .addItem('Reset instance url', 'resetTSInstance')
    .addToUi();
}

function showTSSidebar() {
  const widget = HtmlService.createHtmlOutputFromFile('index.html');
  widget.setTitle('ThoughtSpot');
  SlidesApp.getUi().showSidebar(widget);
}

function showTSDialog() {
  const widget = HtmlService.createHtmlOutputFromFile('dialog.html');
  widget.setTitle('ThoughtSpot');
  SlidesApp.getUi().showModalDialog(widget, 'Thoughtspot');
}

function resetTSInstance() {
  const userProps = PropertiesService.getUserProperties();
  userProps.deleteProperty('ts-cluster-url');
}

function getCandidateClusterUrl() {
  console.log('Hu0');
  const email = Session.getActiveUser().getEmail();
  const domain = email.substring(email.indexOf('@') + 1);
  let clusterName = domain.substring(0, domain.indexOf('.'));
  console.log('Hu1', email);
  let environment = 'thoughtspot';
  if (clusterName === 'thoughtspot') {
    clusterName = 'champagne';
    environment = 'thoughtspotstaging';
  }
  if (clusterName === 'gmail') {
    clusterName = 'my1';
  }
  console.log('reached', clusterName, environment);
  return `${clusterName}.${environment}.cloud`;
}

function getClusterUrl() {
  const userProps = PropertiesService.getUserProperties();
  if (userProps.getProperty('ts-cluster-url')) {
    return {
      url: userProps.getProperty('ts-cluster-url'),
      isCandidate: false,
    };
  }
  return {
    url: getCandidateClusterUrl(),
    isCandidate: true,
  };
}

function setClusterUrl(url) {
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty('ts-cluster-url', url);
}

function addImage() {
  const slide = SlidesApp.getActivePresentation().getSlides()[0];
  const images = slide.getImages().length;
  console.log('rifnirfnrf', images);
  const slideimage = slide.getImages()[0];
  const currentslide = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage();
  const currentslideimages = currentslide.getImages().length;
  const currentslideimage = currentslide.getImages();
  if (currentslideimages === 0) {
    console.log('in', slide, slideimage, currentslide);
    // slide.insertImage('https://upload.wikimedia.org/wikipedia/commons/5/56/Wiki_Eagle_Public_Domain.png', 250, 37, 350 , 350);
    // slide.insertTextBox('Eagle');
    currentslide.insertImage(
      'https://upload.wikimedia.org/wikipedia/commons/5/56/Wiki_Eagle_Public_Domain.png',
      250,
      37,
      350,
      350
    );
    currentslide.insertTextBox('Eagle');
  } else {
    SlidesApp.getUi().alert('Already added');
  }
  // currentslide.insertImage('https://upload.wikimedia.org/wikipedia/commons/5/56/Wiki_Eagle_Public_Domain.png', 250, 37, 350 , 350);
  // currentslide.insertTextBox('Eagle');
}

function updateImage() {
  const slide = SlidesApp.getActivePresentation().getSlides()[0];
  const images = slide.getImages().length;
  console.log('rifnirfnrf', images);
  const slideimage = slide.getImages()[0];
  const currentslide = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage();
  const currentslideimages = currentslide.getImages().length;
  const currentslideimage = currentslide.getImages()[0];
  if (currentslideimages === 0) {
    SlidesApp.getUi().alert('Add LB first');
  } else {
    console.log('ierfrefn', slide, slideimage, currentslide);
    // slideimage.remove();
    // slide.insertImage('https://amymhaddad.s3.amazonaws.com/morocco-blue.png', 250, 37, 350 , 350);
    currentslide.replaceAllText('Eagle', 'blue');
    currentslideimage.replace(
      'https://amymhaddad.s3.amazonaws.com/morocco-blue.png',
      true
    );
    // slide.replaceAllText('Eagle','blue');
  }
  // currentslide.insertImage('https://upload.wikimedia.org/wikipedia/commons/5/56/Wiki_Eagle_Public_Domain.png', 250, 37, 350 , 350);
  // currentslide.insertTextBox('Eagle');
}

function clearSlide() {
  const currentslideelements = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage()
    .getPageElements();
  // console.log(currentslideelements);
  // currentslideelements[0].remove();
  // currentslideelements[1].remove();
  currentslideelements.forEach(function (element) {
    console.log(element);
    element.remove();
  });
  // currentslideelements.forEach((s) => {console.log(s)});
}

function settext(text) {
  const currentslide = SlidesApp.getActivePresentation()
    .getSelection()
    .getCurrentPage();
  const elements = currentslide.getPageElements();
  console.log('Elements found', elements);
  // await clearSlide();
  console.log('cleared');
  currentslide.insertTextBox(text, 0, 0, 400, 400);
}
