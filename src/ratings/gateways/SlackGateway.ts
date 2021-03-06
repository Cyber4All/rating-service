import { RatingNotifier } from '../interfaces/RatingNotifier';

const fetch = require('node-fetch');

const slackURI = process.env.SLACK_URI;
const nodeEnv = process.env.NODE_ENV;

export class SlackGateway implements RatingNotifier {

    /**
     * Structures the body of the message sent to slack
     *
     * @param ratingAuthor [the username of the creator of the rating]
     * @param ratingComment [the comment that was left with the rating]
     * @param learningObjectName [the name of the Learning Object]
     * @param learningObjectAuthorUsername [the username of the user that created the Learning Object]
     */
    private initializePayload(params: {
        ratingAuthor: string,
        ratingComment: string,
        learningObjectCuid: string,
        learningObjectAuthorUsername: string,
    }) {
        return {
            text: 'A rating has been created.',
            attachments: [
                {
                    'fallback': `<https://clark.center/details/${
                            encodeURIComponent(params.learningObjectAuthorUsername)
                        }/${
                            encodeURIComponent(params.learningObjectCuid)
                        }|View Rating>`,
                    'pretext': `<https://clark.center/details/${
                            encodeURIComponent(params.learningObjectAuthorUsername)
                        }/${
                            encodeURIComponent(params.learningObjectCuid)
                        }|View Rating>`,
                    'color': '#0000ff',
                    'fields': [
                        {
                            'title': `Created by ${params.ratingAuthor}`,
                            'value': `"${params.ratingComment}"`,
                            'short': 'true',
                        },
                    ],
                },
            ],
        };
    }

    /**
     * @inheritDoc
     */
    async sendRatingNotification(params: {
        ratingAuthor: string;
        ratingComment: string;
        learningObjectCuid: string;
        learningObjectAuthorUsername: string;
    }): Promise<void> {
        if (nodeEnv === 'production') {
            const options = {
                uri: slackURI,
                body: JSON.stringify(this.initializePayload({
                    ratingAuthor: params.ratingAuthor,
                    ratingComment: params.ratingComment,
                    learningObjectAuthorUsername: params.learningObjectAuthorUsername,
                    learningObjectCuid: params.learningObjectCuid,
                })),
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
            };
            await fetch(options.uri, options);
        } else {
            console.log('Sent to Slack');
        }
    }
}
