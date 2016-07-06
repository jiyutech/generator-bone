'use strict';

var chai = require('chai');
chai.should();

var getconf = require('./getconf.js');

describe('getconf.js', function() {
  it('getconf())', function () {
    getconf.should.be.a('function');
  });
  it('getconf.noPrivate())', function () {
    getconf.noPrivate.should.be.a('function');
  });
});
