const { ActionTypes, MessageFactory } = require('botbuilder');
const { QnAMakerDialog } = require('botbuilder-ai');

/**
 * Set process.env.OverrideMultiTurnStep value to override checkForMultiTurnPrompt.
 * Leave as empty string to use original QnAMakerDialog behavior.
 */
const OverrideMultiTurnStep = !!process.env.OverrideMultiTurnStep;

/**
 * Set process.env.OverrideDisplayQnAStep value to override displayQnAResult.
 * Leave as empty string to use original QnAMakerDialog behavior.
 */
const OverrideDisplayQnAStep = !!process.env.OverrideDisplayQnAStep;

const ComplaintDialogId = 'ComplaintDialog';

class MyQnADialog extends QnAMakerDialog {
    constructor(
        knowledgeBaseId,
        endpointKey,
        hostname,
        noAnswer,
        threshold,
        activeLearningCardTitle,
        cardNoMatchText,
        top,
        cardNoMatchResponse,
        strictFilters,
        dialogId,
        strictFiltersJoinOperator,
    ) {
        super(
            knowledgeBaseId,
            endpointKey,
            hostname,
            noAnswer,
            threshold,
            activeLearningCardTitle,
            cardNoMatchText,
            top,
            cardNoMatchResponse,
            strictFilters,
            dialogId,
            strictFiltersJoinOperator,
        );
    }

    // This member is private in TypeScript and cannot be overridden without writing poor TypeScript.
    async checkForMultiTurnPrompt(step) {
        if (OverrideMultiTurnStep) {
            const response = step.result || [];
            const beginComplaintDialog = response.find((result) => result.answer === '#ComplaintDialog');
            if (beginComplaintDialog) {
                await step.context.sendTraceActivity(
                    'ComplaintDialog Triggered Trace',
                    `User ${step.context.activity.from.id} asked to speak with Manager.`,
                    undefined,
                    'User Error',
                );
                return step.replaceDialog(ComplaintDialogId);
            } else {
                return super.checkForMultiTurnPrompt(step);
            }
        }

        return super.checkForMultiTurnPrompt(step);
    }

    // This member is protected and can be overriden in TypeScript.
    // Note the logic in overridden checkForMultiTurnPrompt() is the same except for the
    // answer-dependent logic.
    async displayQnAResult(step) {
        if (OverrideDisplayQnAStep) {
            const response = step.result || [];
            // Modify activity being sent to user if the answer is 'Here is the source.'
            const addSource = response.find((result) => result.answer === 'Here is the source.');
            if (addSource) {
                const cardActions = [
                    {
                        type: ActionTypes.OpenUrl,
                        title: 'Source',
                        value: 'https://github.com/microsoft/botbuilder-samples',
                    }
                ];

                const answerWithSource = MessageFactory.suggestedActions(cardActions, 'Here is the source.');
                await step.context.sendActivity(answerWithSource);
                return step.endDialog(step.result);
            } else {
                return super.displayQnAResult(step);
            }
        }

        return super.displayQnAResult(step);
    }
}

/**
 * Creates QnAMakerDialog instance with provided configuraton values.
 */
 const createQnAMakerDialog = (
    knowledgeBaseId,
    endpointKey,
    endpointHostName,
    defaultAnswer,
) => {
    let noAnswerActivity;
    if (typeof defaultAnswer === 'string' && defaultAnswer.length > 0) {
        noAnswerActivity = MessageFactory.text(defaultAnswer);
    }

    // Options not configured through invocation.
    const threshold = undefined;
    const activeLearningCardTitle = undefined;
    const cardNoMatchText = undefined;
    const top = undefined;
    const cardNoMatchResponse = undefined;
    const strictFilters = undefined;
    const dialogId = undefined;
    const strictFiltersJoinOperator = undefined;

    const qnaMakerDialog = new MyQnADialog(
        knowledgeBaseId,
        endpointKey,
        endpointHostName,
        noAnswerActivity,
        threshold,
        activeLearningCardTitle,
        cardNoMatchText,
        top,
        cardNoMatchResponse,
        strictFilters,
        dialogId,
        strictFiltersJoinOperator,
    );

    return qnaMakerDialog;
}

module.exports.createQnAMakerDialog = createQnAMakerDialog;
module.exports.MyQnADialog = MyQnADialog;