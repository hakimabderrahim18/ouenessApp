require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

console.log('================================================================');
console.log('  🇩🇿 LogiNaft Smart System - Master Seeding Engine Starting...');
console.log('================================================================');

try {
  console.log('\n[1/3] Seeding Roles, Senior Management & Corporate Users...');
  execSync('node src/seeds/seedRolesAndAdmins.js', { stdio: 'inherit', cwd: path.join(__dirname, '../../') });

  console.log('\n[2/3] Seeding Strategic Warehouses & Energy Products...');
  execSync('node src/seeds/seedInventory.js', { stdio: 'inherit', cwd: path.join(__dirname, '../../') });

  console.log('\n[3/3] Seeding Fleet Tankers, Live Algerian Routes & Shipments...');
  execSync('node src/seeds/seedShipmentsAndFleet.js', { stdio: 'inherit', cwd: path.join(__dirname, '../../') });

  console.log('\n================================================================');
  console.log('  ✅ ALL LOGINAFT SMART SYSTEM DATA SEEDED SUCCESSFULLY!');
  console.log('================================================================\n');
} catch (error) {
  console.error('\n❌ Error during master seeding:', error.message);
  process.exit(1);
}
