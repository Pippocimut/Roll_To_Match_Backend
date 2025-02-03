import { createRemoveButton } from './createRemoveButton.js';
export const createJoinCampaignButton = (campaignId) => {
    const button = document.createElement('button');
    button.id = 'join-campaign-button';
    button.textContent = 'Join Campaign';

    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const result = await fetch(`/api/v1/campaign/${campaignId}/candidate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (result.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    return button;
}