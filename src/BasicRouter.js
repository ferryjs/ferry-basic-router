'use strict';

import {Router} from 'ferry';

class BasicRouterAdapter extends Router {

  constructor(config = {}) {
    super(config);
    this.name = 'Basic Router';
  }

}

export default BasicRouterAdapter;
