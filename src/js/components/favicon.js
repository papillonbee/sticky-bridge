const createFaviconPlayingCard = () => {
    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.display = "none";
    document.body.appendChild(hiddenContainer);

    const card = document.createElement("playing-card");
    card.setAttribute("rank", "0");
    card.setAttribute("rank", "0");
    card.setAttribute("backcolor", "#44F");
    card.setAttribute("backtext", "");
    card.setAttribute("backtextcolor", "black");

    hiddenContainer.appendChild(card);
    
    setTimeout(() => setFaviconFromPlayingCard(card), 1000);
}

const setFaviconFromPlayingCard = (card) => {
    const image = card.querySelector("img");
    const svgSrc = image.getAttribute("src");
    if (svgSrc && svgSrc.startsWith("data:image/svg+xml")) {
        let favicon = document.querySelector("link[rel='icon']");
        if (!favicon) {
            favicon = document.createElement("link");
            favicon.rel = "icon";
            document.head.appendChild(favicon);
        }
        favicon.href = svgSrc;
        document.head.appendChild(favicon);
    }
}

document.addEventListener("DOMContentLoaded", createFaviconPlayingCard);
