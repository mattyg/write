export default class ImageFromUrlBlock {
  static get toolbox() {
    return {
      title: 'Image (from URL)',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path fill="currentColor" d="M19 19H5V5h14m0-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-5.04 9.29l-2.75 3.54l-1.96-2.36L6.5 17h11l-3.54-4.71Z"/></svg>'
    };
  }

  data: any;

  constructor({data}){
    this.data = data;
    this.wrapper = undefined;
    console.log('constuctor', data);
  }

  render(){
    console.log('render');
    this.wrapper = document.createElement('div');
    const input = document.createElement('input');

    this.wrapper.classList.add('simple-image');
    this.wrapper.appendChild(input);

    input.placeholder = 'Paste an image URL...';
    input.value = this.data && this.data.url ? this.data.url : '';

    input.addEventListener('paste', (event) => {
      this._createImage(event.clipboardData.getData('text'));
    });

    if(this.data.url) {
      this._createImage(this.data.url);
    }

    return this.wrapper;
  }

  _createImage(url){
    const image = document.createElement('img');

    image.src = url;

    this.wrapper.innerHTML = '';
    this.wrapper.appendChild(image);
  }

  save(blockContent){
    console.log('save', blockContent);

    const image = blockContent.querySelector('img');

    return {
      url: image.src,
    }
  }

  validate(savedData: any){
    console.log('validate', savedData);

    if (!savedData.url.trim()){
      return false;
    }

    return true;
  }
}
