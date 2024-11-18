import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config(); // Load environment variables from .env file

// Initialize Supabase client
const supabase = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function createBucket(bucketName: string) {
	// Check if the bucket already exists
	const { data: listBuckets, error: listError } =
		await supabase.storage.listBuckets();
	if (listError) {
		console.error('Error listing buckets:', listError.message);
		return;
	}

	const bucketExists = listBuckets.some((bucket) => bucket.name === bucketName);

	if (!bucketExists) {
		// Create the bucket if it doesn't exist
		const { data, error } = await supabase.storage.createBucket(bucketName);

		if (error) {
			console.error('Error creating bucket:', error.message);
		} else {
			console.log(`Bucket "${bucketName}" created successfully.`);
		}
	} else {
		console.log(`Bucket "${bucketName}" already exists.`);
	}
}

// Call the function to create the required bucket
createBucket('route-images');
