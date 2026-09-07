require('dotenv').config();
const { initDatabase, dbRun } = require('./db');

async function runSeed() {
  console.log('🚀 Memulai proses seed database E-Voting BPD Banyubiru...');
  try {
    await initDatabase();
    console.log('🎉 Seed database selesai dengan sukses!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal melakukan seed:', err);
    process.exit(1);
  }
}

runSeed();
