import { reviews } from './dist/index.js';

async function test() {
  console.log('Testing voteSum/voteCount for app 6498935043...\n');

  const usReviews = await reviews({ id: 6498935043, country: 'us', page: 1 });

  console.log(`Found ${usReviews.length} reviews\n`);

  // Show first 3 reviews with vote data
  usReviews.slice(0, 3).forEach((r, i) => {
    console.log(`${i + 1}. "${r.title}" by ${r.userName}`);
    console.log(`   Score: ${r.score} | VoteSum: ${r.voteSum} | VoteCount: ${r.voteCount}`);
    console.log('');
  });

  // Show reviews with votes
  const withVotes = usReviews.filter(r => r.voteCount > 0);
  console.log(`Reviews with votes: ${withVotes.length}`);
  withVotes.forEach(r => {
    console.log(`  - "${r.title}" | VoteSum: ${r.voteSum} | VoteCount: ${r.voteCount}`);
  });
}

test().catch(console.error);
