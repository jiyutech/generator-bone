'use strict';


module.exports = {
  Server: require('./inset/server'),
  middleware: {
    navigator: require('./middleware/navigator')
  }
};
