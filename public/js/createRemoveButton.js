export const createRemoveButton = (campaignId, playerId) => {
    const button = document.createElement('button');
    button.id = 'remove-button';
    button.textContent = 'Remove';

    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const result = await fetch(`/api/v1/campaign/${campaignId}/player/${playerId}`, {
                method: 'DELETE',
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

    return button;
}