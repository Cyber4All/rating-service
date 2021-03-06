import { getLearningObjectRatings } from '../RatingsInteractor';

const stubRating: Rating = {
    value: 0,
    comment: 'test comment',
    user: {
        username: 'test_username',
        name: 'test_name',
        email: 'test_email',
    },
};

jest.mock('../../RatingStore', () => ({
    __esModule: true,
    RatingStore: {
      getInstance: () => ({
        getLearningObjectsRatings: jest
            .fn()
            .mockResolvedValue([stubRating]),
      }),
    },
}));

jest.mock('../../../drivers/LearningObjectServiceConnector', () => ({
    __esModule: true,
    getLearningObject: jest.fn(),
}));

import { getLearningObject } from '../../../drivers/LearningObjectServiceConnector';
import { Rating } from '../../../types/Rating';

describe('When getLearningObjectRatings is called', () => {
    describe('and the requested Learning Object does not exist', () => {
        it('should throw a not found error', async () => {
            getLearningObject['mockImplementation']((params: {
                CUID: string;
                version: string;
            }): any => {
                return null;
            });

            await expect(getLearningObjectRatings({
                user: undefined,
                username: 'test_username',
                CUID: 'test_CUID',
                version: 'test_version',
            }))
            .rejects
            .toThrowError('does not exist');
        });
    });
    describe('and the requested Learning Object exists', () => {
        it('should return an array of rating objects', async () => {
            getLearningObject['mockImplementation']((params: {
                CUID: string;
                version: string;
            }): any => {
                return {
                    author: {
                        username: 'learning_object_author',
                    },
                };
            });

            await expect(getLearningObjectRatings({
                user: undefined,
                username: 'test_username',
                CUID: 'test_CUID',
                version: 'test_version',
            }))
            .resolves
            .toEqual([stubRating]);
        });
    });
});
