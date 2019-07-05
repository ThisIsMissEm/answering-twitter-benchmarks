const Benchmark = require("benchmark");

const cars = [
  {
    make: "ford",
    model: "fusion",
    year: 2012
  },
  {
    make: "ford",
    model: "escort",
    year: 1999
  },
  {
    make: "hyundai",
    model: "sonata",
    year: 2003
  }
];

function original(cars) {
  return cars.reduce(
    (h, car) =>
      Object.assign(h, {
        [car.make]: (h[car.make] || []).concat({
          model: car.model,
          year: car.year
        })
      }),
    {}
  );
}

function originalWithSpread(cars) {
  return cars.reduce(
    (h, { make, ...car }) =>
      Object.assign(h, { [make]: (h[make] || []).concat(car) }),
    {}
  );
}

/**
 * So, a couple of things:
 * - Data goes last. Ideally this function would also be curried,
 *   so you can say `const groupByMake = groupBy('make');
 * - `x` / `xs` is controversial, but argument naming can affect people's
 *   perception of reusabiliity. Naming the argument "cars" would've
 *   maybe lead people falsely believe this function only works on Car[].
 * - x / xs is common in FP lingo, depending on who'd be working on this code
 *   I'd probably have named it `item` / `items`. I would've then also named `y`
 *   something like `newItem`, or `itemWithoutGroupKey`.
 * - The first argument to the reduce callback is commonly called either `acc`
 *   (for accumulator) or `memo`. Either one would've been fine for me.
 * - Immutability is important as a matter of interface. Whether you're internally
 *   creating new objects and mutating those or just flat-out creating new objects
 *   everywhere is an implementation detail.
 * @param {String} groupKey
 * @param {Array} xs
 */
function groupBy(groupKey, xs) {
  return xs.reduce((acc, x) => {
    const value = x[groupKey];

    const y = { ...x };
    delete y[groupKey];

    if (acc[value]) {
      acc[value] = acc[value].concat(y);
      return acc;
    }

    acc[value] = [y];
    return acc;
  }, {});
}

function carsByMakeEmeliaLong(cars) {
  return cars.reduce((carsByMake, { make, ...car }) => {
    if (!carsByMake[make]) {
      carsByMake[make] = [];
    }
    carsByMake[make].push(car);
    return carsByMake;
  }, {});
}

function carsByMakeEmeliaShort(cars) {
  return cars.reduce(
    (carsByMake, { make, ...car }) => (
      (carsByMake[make] = (carsByMake[make] || []).concat(car)), carsByMake
    ),
    {}
  );
}

const suite = new Benchmark.Suite("Grouping", { delay: 1 });

// add tests
suite
  .add("Original", function() {
    original(cars);
  })
  .add("Original with Spread", function() {
    originalWithSpread(cars);
  })
  .add("Steven", function() {
    groupBy("make", cars);
  })
  .add("Emelia Long", function() {
    carsByMakeEmeliaLong(cars);
  })
  .add("Emelia Short", function() {
    carsByMakeEmeliaShort(cars);
  })
  // add listeners
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  // run async
  .run({ async: false });
