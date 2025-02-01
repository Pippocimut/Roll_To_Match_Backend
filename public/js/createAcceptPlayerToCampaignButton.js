export const createAcceptPlayerToCampaignButton = (campaignId, playerId) => {
    const button = document.createElement('button');
    button.id = 'accept-player-to-campaign-button';
    button.textContent = 'Accept request';

    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const result = await fetch(`/api/v1/campaign/${campaignId}/player/${playerId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (result.ok) {
                const response = await result.json()
                const parent = button.parentElement;
                parent.remove();
            } else {
                console.error('Errore nella richiesta:', await result.text())
            }
        } catch (error) {
            console.error('Errore nella richiesta:', error);
        }
    });
    console.log('button', button);
    return button;
}