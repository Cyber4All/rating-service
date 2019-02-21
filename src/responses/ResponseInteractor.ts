import { ResourceError, ResourceErrorReason, ServiceError, ServiceErrorType } from '../errors';
import { reportError } from '../drivers/SentryConnector';
import { ResponseDataStore } from './interfaces/ResponseDataStore';
import { Response } from '../types/Response';
import { hasResponseUpdateDeleteAccess, hasResponseCreateAccess } from './ResponseAuthorization';
import { UserToken } from '../types/UserToken';
import { ResponseStore } from './ResponseStore';

/**
 * Delete a response
 * @Authorization
 * *** Must be response author ***
 * @export
 * @param params
 * @property { ResponseDataStore } dataStore instance of ResponseDataStore
 * @property { string } responseId id of response being deleted
 *
 * @returns { Promise<void> }
 */
export async function deleteResponse(params: {
    responseId: string;
    user: UserToken;
}): Promise<void> {
    try {
        const hasAccess = hasResponseUpdateDeleteAccess({
            dataStore: getDataStore(),
            user: params.user,
            responseId: params.responseId,
        });
        if (hasAccess) {
            await getDataStore().deleteResponse({
                responseId: params.responseId,
            });
        } else {
            return Promise.reject(
                new ResourceError(
                    'Invalid Access',
                    ResourceErrorReason.INVALID_ACCESS,
                ),
            );
        }
    } catch (error) {
        reportError(error);
        return Promise.reject(
            new ResourceError(
                'Could not fetch rating',
                ResourceErrorReason.NOT_FOUND,
            ),
        );
    }
}

/**
 * Fetch the reponse for a given rating
 * @export
 * @param params
 * @property { ResponseDataStore } dataStore instance of ResponseDataStore
 * @property { string } ratingId id of rating that the reponse is attached to
 *
 * @returns { Promise<void> }
 */
export async function getResponses(params: {
    ratingIds: string[];
}): Promise<Response[]> {
    try {
        const responses = await getDataStore().getResponses({
            ratingIds: params.ratingIds,
        });
        return responses;
    } catch (error) {
        reportError(error);
        return Promise.reject(
            new ResourceError(
                'Could not fetch response',
                ResourceErrorReason.NOT_FOUND,
            ),
        );
    }
}

/**
 * Delete a response
 * @Authorization
 * *** Must be response author ***
 * @export
 * @param params
 * @property { ResponseDataStore } dataStore instance of ResponseDataStore
 * @property { string } responseId id of response being deleted
 *
 * @returns { Promise<void> }
 */
export async function updateResponse(params: {
    responseId: string;
    updates: Response;
    user: UserToken;
}): Promise<void> {
    try {
        const hasAccess = hasResponseUpdateDeleteAccess({
            dataStore: getDataStore(),
            user: params.user,
            responseId: params.responseId,
        });
        if (hasAccess) {
            await getDataStore().updateResponse({
                responseId: params.responseId,
                updates: params.updates,
            });
        } else {
            return Promise.reject(
                new ResourceError(
                    'Invalid Access',
                    ResourceErrorReason.INVALID_ACCESS,
                ),
            );
        }
    } catch (error) {
        reportError(error);
        return Promise.reject(
            new ServiceError(ServiceErrorType.INTERNAL),
        );
    }
}

/**
 * Create a response
 * @Authorization
 * *** Must be learning object author or contributor ***
 * @export
 * @param params
 * @property { ResponseDataStore } dataStore instance of ResponseDataStore
 * @property { string } responseId id of response being deleted
 *
 * @returns { Promise<void> }
 */
export async function createResponse(params: {
    ratingId: string;
    response: Response;
    user: UserToken;
}): Promise<void> {
    try {
        const hasAccess = hasResponseCreateAccess({
            dataStore: getDataStore(),
            user: params.user,
            ratingId: params.ratingId,
        });
        if (hasAccess) {
            const responseUser = {
                username: params.user.username,
                name: params.user.name,
                email: params.user.email,
            };
            await getDataStore().createResponse({
                ratingId: params.ratingId,
                response: params.response,
                user: responseUser,
            });
        } else {
            return Promise.reject(
                new ResourceError(
                    'Invalid Access',
                    ResourceErrorReason.INVALID_ACCESS,
                ),
            );
        }
    } catch (error) {
        reportError(error);
        return Promise.reject(
            new ServiceError(
                ServiceErrorType.INTERNAL,
            ),
        );
    }
}

function getDataStore() {
    return ResponseStore.getInstance();
}
