import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as wellknown from 'wellknown';

dotenv.config();

// Initialize Supabase client
const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function loadGeoJson(filePath: string) {
	try {
		// Read the GeoJSON file
		const geojsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

		// Iterate over each feature in the GeoJSON
		for (const feature of geojsonData.features) {
			const { properties, geometry } = feature;
			const objectId = properties.OBJECTID;

			// Convert the geometry to WKT format using turf
			const wkt = wellknown.stringify(geometry);

			// Construct the SQL query for inserting the data
			const { error } = await supabase.from('covered_linkways').insert([
				{
					object_id: objectId,
					route: `SRID=4326;${wkt}`,
				},
			]);

			if (error) {
				console.error(
					`Error inserting feature with OBJECTID ${objectId}:`,
					error.message,
				);
			} else {
				console.log(`Inserted feature with OBJECTID ${objectId}`);
			}
		}
	} catch (error) {
		console.error('Error loading GeoJSON:', error);
	}
}

// Run the script with a file path passed as a command-line argument
const filePath = process.argv[2];
if (!filePath) {
	console.error('Please provide the path to the GeoJSON file.');
	process.exit(1);
}

loadGeoJson(filePath);
