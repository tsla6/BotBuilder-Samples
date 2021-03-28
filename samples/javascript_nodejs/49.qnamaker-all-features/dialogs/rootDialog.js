// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const { createQnAMakerDialog } = require('./myQnADialog');
const {
    Dialog,
    ComponentDialog,
    WaterfallDialog,
} = require('botbuilder-dialogs');

const ComplaintDialogId = 'ComplaintDialog';
const MyQnADialogId = 'MyQnADialog';

class RootDialog extends ComponentDialog {
    /**
     * Root dialog for this bot. Creates a QnAMakerDialog.
     * @param {string} knowledgeBaseId Knowledge Base ID of the QnA Maker instance.
     * @param {string} endpointKey Endpoint key needed to query QnA Maker.
     * @param {string} endpointHostName Host name of the QnA Maker instance.
     * @param {string} defaultAnswer (optional) Text used to create a fallback response when QnA Maker doesn't have an answer for a question.
     */
    constructor(knowledgeBaseId, endpointKey, endpointHostName, defaultAnswer) {
        super('RootDialog');

        // Use helper to create subclassed QnAMakerDialog and configure dialogId.
        const qnaMakerDialog = createQnAMakerDialog(knowledgeBaseId, endpointKey, endpointHostName, defaultAnswer);
        qnaMakerDialog.id = MyQnADialogId;

        // Add subclass to RootDialog and configure RootDialog to call qnaMakerDialog at beginning of conversations.
        this.addDialog(qnaMakerDialog);

        // Register WaterfallDialog for handling user complaints.
        this.addDialog(new WaterfallDialog(ComplaintDialogId, [
            this.beginFilingComplaint.bind(this),
            this.finishFilingComplaint.bind(this),
        ]));
        this.initialDialogId = qnaMakerDialog.id;
    }

    async beginFilingComplaint(step) {
        await step.context.sendActivity(`You've reached the ComplaintDialog. Please describe the issue encountered.`);
        return Dialog.EndOfTurn;
    }

    async finishFilingComplaint(step) {
        await step.context.sendActivity(`Whoops! Complaint filing process incomplete. Please try again later.`);
        return step.cancelAllDialogs(true);
    }
}

module.exports.RootDialog = RootDialog;
