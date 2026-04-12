import { reviews } from './dist/index.js';

async function test() {
  console.log('Testing fix for app 6498935043...\n');

  // US
  const usReviews = await reviews({ id: 6498935043, country: 'us', page: 1 });
  console.log('US reviews:', usReviews.length);

  // TR
  const trReviews = await reviews({ id: 6498935043, country: 'tr', page: 1 });
  console.log('TR reviews:', trReviews.length);

  console.log('\nTotal:', usReviews.length + trReviews.length);
  console.log('\nExpected: US=16, TR=2, Total=18');
}

test().catch(console.error);
