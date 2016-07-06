'use strict';

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
chai.should();

describe('Sample', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal(-1, [1,2,3].indexOf(0));
      expect([1,2,3].indexOf(0)).to.equal(-1);
      [1,2,3].indexOf(0).should.be(-1);
    });
  });
});
