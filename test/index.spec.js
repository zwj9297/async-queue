var expect = require('chai').expect
var createQueue = require('../dist/sync-queue.cjs').createQueue

createQueue(
  [
    () => {
      return new Promise((resolve) => {
        const step = 1
        describe(`step ${step}`, function () {
          it(`step ${step}`, function () {
            expect(step).to.be.equal(1)
            resolve(step + 1)
          })
        })
      })
    },
    (step) => {
      return new Promise((resolve) => {
        describe(`step ${step}`, function () {
          it(`step ${step}`, function () {
            expect(step).to.be.equal(2)
            resolve(step + 0.1)
          })
        })
      }).then((step) => {
        describe(`step ${step}`, function () {
          it(`step ${step}`, function () {
            expect(step).to.be.equal(2.1)
          })
        })
        return 3
      })
    },
    (step) => {
      return new Promise((resolve) => {
        describe(`step ${step}`, function () {
          it(`step ${step}`, function () {
            expect(step).to.be.equal(3)
            resolve(step + 1)
          })
        })
      })
    },
  ],
  (step) => {
    describe('success', function () {
      it('success', function () {
        expect(step).to.be.equal(4)
      })
    })
  }
).start()
