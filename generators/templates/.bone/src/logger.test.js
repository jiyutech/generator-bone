'use strict';

var chai = require('chai');
var expect = chai.expect;
chai.should();

var Logger = require('./logger.js');

describe('Logger', function() {
  it('Logger should exists', function () {
    Logger.should.be.a('function');
  });
  it('logger.log()', function () {
    var logger = new Logger();
    expect(function(){
      logger.log('test logger.log()');
    }).to.not.throw(Error);
  });
  it('logger.info()', function () {
    var logger = new Logger();
    expect(function(){
      logger.info('test logger.info()');
    }).to.not.throw(Error);
  });
  it('logger.warn()', function () {
    var logger = new Logger();
    expect(function(){
      logger.warn('test logger.warn()');
    }).to.not.throw(Error);
  });
  it('logger.error()', function () {
    var logger = new Logger();
    expect(function(){
      logger.error('test logger.error()');
    }).to.not.throw(Error);
  });
  it('new logger( prefix )', function () {
    var prefix = 'prefix';
    var logger = new Logger(prefix);
    logger.log('test');
    logger.prefix.should.be.equal( prefix );
  });
  it('logger.resolve()', function () {
    var prefix = 'prefix';
    var logger = new Logger(prefix);
    logger.resolve( 'test' ).join('-').should.be.equal( [prefix+':', 'test'].join('-') );
  });
});
