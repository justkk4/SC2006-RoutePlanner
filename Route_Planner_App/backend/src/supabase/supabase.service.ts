import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PointDto } from 'src/routes/dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SupabaseService {
	private supabase;

	setAccessToken(token: string) {
		this.supabase = createClient(
			process.env.SUPABASE_URL,
			process.env.SUPABASE_KEY,
			{
				global: {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			},
		);
	}

	async uploadRouteImage(file: Express.Multer.File): Promise<string> {
		const bucket = 'route-images';
		const uniqueFilename = `${uuidv4()}-${file.originalname}`;

		const { data, error } = await this.supabase.storage
			.from(bucket)
			.upload(uniqueFilename, file.buffer, {
				contentType: file.mimetype,
			});

		if (error) {
			throw new Error(`Failed to upload image: ${error.message}`);
		}
		return uniqueFilename;
	}

	async getSignedUrl(filePath: string): Promise<string> {
		const { data: signedUrlData, error: signedUrlError } =
			await this.supabase.storage
				.from('route-images')
				.createSignedUrl(filePath, 60 * 60); // 1 hour expiration

		if (signedUrlError) {
			throw new Error(
				`Unable to retrieve signed URL: ${signedUrlError.message}`,
			);
		}

		if (!signedUrlData || !signedUrlData.signedUrl) {
			throw new Error('Unable to retrieve signed URL for the uploaded image.');
		}

		return signedUrlData.signedUrl;
	}

	async findNearbyShelters(pointDto: PointDto) {
		const { data, error } = await this.supabase.rpc('find_sheltered_route', {
			point_coords: pointDto.point, // The array of lat/lon pairs from the request body
			buffer_distance: pointDto.bufferDistance, // The buffer distance in meters
		});

		if (error) {
			console.error('Error running the query:', error);
		} else {
			console.log('Nearby shelters:', data);
		}
		return data;
	}

	async findIntersections(route: Number[][]) {
		console.log(route);
		const { data, error } = await this.supabase.rpc('find_intersections', {
			route_coords: route, // The array of lat/lon pairs from the request body
		});

		if (error) {
			console.error('Error running the query:', error);
		} else {
			console.log('Sheltered route segments:', data);
		}
		return data;
	}
}
