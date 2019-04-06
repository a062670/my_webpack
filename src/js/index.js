import '@/scss/index.scss';

import '@babel/polyfill';

class IndexClass {
  constructor() {
    this.name = 'Insowe';
    document
      .querySelector('.title')
      .addEventListener('click', this.OpenStateFn);
  }

  OpenStateFn = () => {
    console.log('name: ', this.name);
  };
}
new IndexClass();
