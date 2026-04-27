const Table = require("../models/Table");

function capacityForTableNumber(tableNumber) {
  // Mixed default: 2/4/6/8 repeating
  const pattern = [2, 4, 6, 8];
  return pattern[(tableNumber - 1) % pattern.length];
}

async function initTables() {
  const count = await Table.countDocuments();
  if (count >= 30) return;

  const ops = [];
  for (let i = 1; i <= 30; i += 1) {
    ops.push({
      updateOne: {
        filter: { tableNumber: i },
        update: {
          $setOnInsert: {
            tableNumber: i,
            capacity: capacityForTableNumber(i),
            status: "available",
          },
        },
        upsert: true,
      },
    });
  }

  await Table.bulkWrite(ops, { ordered: false });
}

module.exports = { initTables };

