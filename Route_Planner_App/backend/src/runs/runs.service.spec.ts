import { Test, TestingModule } from '@nestjs/testing';
import { RunsService } from './runs.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRunDto } from './dto/create-run.dto';

describe('RunsService', () => {
	let runsService: RunsService;
	let prismaService: PrismaService;

	beforeEach(async () => {
		// Mock PrismaService
		const prismaServiceMock = {
			run: {
				create: jest.fn(),
				findMany: jest.fn(),
				findUnique: jest.fn(),
			},
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				RunsService,
				{
					provide: PrismaService,
					useValue: prismaServiceMock,
				},
			],
		}).compile();

		runsService = module.get<RunsService>(RunsService);
		prismaService = module.get<PrismaService>(PrismaService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(runsService).toBeDefined();
	});

	describe('create', () => {
		it('should create a new run and return a success message', async () => {
			const userId = 1;
			const createRunDto: CreateRunDto = {
				date: '2022-01-01',
				distance: '5',
				time: '18:00',
				pace: '6:00',
			};
			const routeImageUrl = 'https://example.com/route.jpg';

			(prismaService.run.create as jest.Mock).mockResolvedValue({
				id: 1,
				...createRunDto,
				routeImageUrl,
				userId,
			});

			const result = await runsService.create(
				userId,
				createRunDto,
				routeImageUrl,
			);
			expect(prismaService.run.create).toHaveBeenCalledWith({
				data: {
					...createRunDto,
					routeImageUrl,
					userId,
				},
			});
			expect(result).toEqual({ message: 'Successfully added run.' });
		});

		it('should throw an error if Prisma throws', async () => {
			const userId = 1;
			const createRunDto: CreateRunDto = {
				date: '2022-01-01',
				distance: '5',
				time: '18:00',
				pace: '6:00',
			};
			const routeImageUrl = 'https://example.com/route.jpg';

			(prismaService.run.create as jest.Mock).mockRejectedValue(
				new Error('Prisma error'),
			);

			await expect(
				runsService.create(userId, createRunDto, routeImageUrl),
			).rejects.toThrow('Prisma error');
		});
	});

	describe('findAll', () => {
		it('should return an array of runs for a given user', async () => {
			const userId = 1;
			const mockRuns = [
				{
					id: 1,
					date: '2022-01-01',
					distance: '5',
					time: '18:00',
					pace: '6:00',
					routeImageUrl: '',
					userId,
				},
				{
					id: 2,
					date: '2022-01-02',
					distance: '10',
					time: '36:00',
					pace: '6:00',
					routeImageUrl: '',
					userId,
				},
			];

			(prismaService.run.findMany as jest.Mock).mockResolvedValue(mockRuns);

			const result = await runsService.findAll(userId);
			expect(prismaService.run.findMany).toHaveBeenCalledWith({
				where: { userId },
			});
			expect(result).toEqual(mockRuns);
		});
	});

	describe('findOne', () => {
		it('should return a run with the specified id', async () => {
			const userId = 1;
			const runId = 1;
			const mockRun = {
				id: runId,
				date: '2022-01-01',
				distance: '5',
				time: '18:00',
				pace: '6:00',
				routeImageUrl: '',
				userId: 1,
			};

			(prismaService.run.findUnique as jest.Mock).mockResolvedValue(mockRun);

			const result = await runsService.findOne(userId, runId);
			expect(prismaService.run.findUnique).toHaveBeenCalledWith({
				where: { id: runId },
			});
			expect(result).toEqual(mockRun);
		});

		it('should return null if the run is not found', async () => {
			const userId = 1;
			const runId = 999;
			(prismaService.run.findUnique as jest.Mock).mockResolvedValue(null);

			const result = await runsService.findOne(userId, runId);
			expect(prismaService.run.findUnique).toHaveBeenCalledWith({
				where: { id: runId },
			});
			expect(result).toBeNull();
		});
	});
});
