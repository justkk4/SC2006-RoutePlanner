import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Database connection configuration
const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false, // Necessary for Supabase connections
	},
});

async function setupDatabase() {
	try {
		await client.connect();
		console.log('Connected to the database.');
		// Enable PostGIS extension
		await client.query(`
            CREATE EXTENSION IF NOT EXISTS postgis;
        `);
		console.log('PostGIS extension enabled.');

		// Create the table for storing GeoJSON data
		await client.query(`
            CREATE TABLE IF NOT EXISTS covered_linkways (
            id SERIAL PRIMARY KEY,
            object_id INTEGER,
            route GEOMETRY(GEOMETRY, 4326)
            );
        `);
		console.log('Table "covered_linkways" created or already exists.');

		//Create spatial index on the route column
		await client.query(`
            CREATE INDEX idx_covered_linkways_geom ON public.covered_linkways USING GIST (route);
        `);
		console.log('Index "idx_covered_linkways_geom" created.');

		// Grant permissions on the table to service role
		await client.query(`
            GRANT USAGE ON SCHEMA public TO service_role;
            GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
            GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.covered_linkways TO service_role;
        `);
		console.log('Permissions granted to the service role.');

		// Grant permissions on the table to authenticated role
		await client.query(`
            GRANT USAGE ON SCHEMA public TO authenticated;
            GRANT SELECT ON TABLE public.covered_linkways TO authenticated;
            GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
        `);
		console.log('Permissions granted to the authenticated role.');

		await client.query(`
            CREATE OR REPLACE FUNCTION find_intersections(
  route_coords double precision[][]  -- Input: Array of lat/lon pairs
)
RETURNS TABLE(id int, coveredlinkway geometry, route double precision[][]) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.id, 
    cl.route AS coveredlinkway,
    ARRAY(
      SELECT ARRAY[ST_Y(geom), ST_X(geom)]  -- Convert each point in intersection back to lat/lon
      FROM ST_DumpPoints(ST_Transform(ST_Intersection(route_geometry, ST_Transform(cl.route, 3414)), 4326)) AS dump
    ) AS route
            FROM (
                -- Construct the LINESTRING from the array of coordinates
                SELECT ST_Transform(ST_SetSRID(ST_MakeLine(
                ARRAY(
                    -- Loop through the array of coordinates to create the POINTS
                    SELECT ST_MakePoint(route_coords[i][2], route_coords[i][1])  -- lon, lat
                    FROM generate_subscripts(route_coords, 1) AS i
                )
                ), 4326), 3414) AS route_geometry   -- Transform to SRID 3414 (meters)
            ) AS user_route,
            covered_linkways cl
            WHERE ST_Intersects(ST_Transform(cl.route, 3414), route_geometry);  
            END;
            $$ LANGUAGE plpgsql;
        `);
		console.log('Function "find_intersections" created.');

		await client.query(`
            CREATE OR REPLACE FUNCTION find_sheltered_route(
            point_coords double precision[],  -- Input: Array of lat/lon pairs
            buffer_distance double precision     -- Input: Buffer distance in meters
            )
            RETURNS TABLE(id int, coveredlinkway geometry) AS $$
            BEGIN
            RETURN QUERY
            SELECT cl.id, ST_SetSRID(
            ST_MakeLine(ARRAY(
                SELECT ST_MakePoint(
                ROUND(ST_X((dp).geom)::numeric, 5), 
                ROUND(ST_Y((dp).geom)::numeric, 5)
                )
                FROM ST_DumpPoints(cl.route) AS dp
            )), 4326
            ) as coveredlinkway
            FROM covered_linkways cl
            WHERE ST_DWithin(
                ST_Transform(cl.route, 3414), 
                ST_Transform(
                ST_SetSRID(ST_MakePoint(point_coords[2], point_coords[1]), 4326), 
                3414
                ), 
                buffer_distance
            );  
            END;
            $$ LANGUAGE plpgsql;
        `);
		console.log('Function "find_sheltered_route" created.');
	} catch (error) {
		console.error('Error setting up the database:', error);
	} finally {
		await client.end();
		console.log('Database connection closed.');
	}
}

// Run the setup function
setupDatabase().catch((error) => console.error('Setup script failed:', error));
