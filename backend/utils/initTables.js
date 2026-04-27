const Table = require("../models/Table");

function capacityForTableNumber(tableNumber) {
  if (tableNumber <= 5) return 2;
  if (tableNumber <= 20) return 4;
  return 6;
}

async function initTables() {
  const ops = [];
  for (let i = 1; i <= 30; i += 1) {
    ops.push({
      updateOne: {
        filter: { tableNumber: i },
        update: {
          $set: {
            capacity: capacityForTableNumber(i),
          },
          $setOnInsert: {
            tableNumber: i,
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
