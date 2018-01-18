var klyng = require('klyng');

// This is the entry function
function main() {

  var size = klyng.size();
  var rank = klyng.rank();

  if (rank === 0) {
    var list = generateRandomData();
    var portionSize = Math.floor(1000000 / size);

    for (var p = 1; p < size; ++p) {
      var portion = list.slice((p - 1) * portionSize, p * portionSize);

      klyng.send({
        to: p,
        data: portion
      });
    }

    var rootPortion = list.slice((size - 1) * portionSize, 1000000);

    var localSum = rootPortion.reduce((prev, next) => prev + next);

    // here the root will wait for other processes partial sums
    for (var p = 1; p < size; ++p) {
      // it doesn't matter from where the partial sum is coming
      // we'll collect them all anyway, so no need to pass criteria
      var partialSum = klyng.recv();
      localSum += partialSum;
    }

    // report back the total sum to the user
    console.log("The Total Sum is %d", localSum);
  } else {
    var portion = klyng.recv({
      from: 0
    });
    var partialSum = portion.reduce((prev, next) => prev + next);

    // report back the partial sum to the root process
    klyng.send({
      to: 0,
      data: partialSum
    });
  }

  klyng.end();
}

klyng.init(main);

function generateRandomData() {
  var min = -10,
    max = 10;
  var list = new Array(10000000);
  for (var i = 0; i < 10000000; ++i) {
    list[i] = Math.random() * (max - min) + min;
  }

  return list;
}
