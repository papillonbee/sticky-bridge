const openModal = (modal, targetElement) => {
    const rect = targetElement.getBoundingClientRect();
    modal.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
    modal.style.left = `${rect.left + rect.width / 2}px`;
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.display = "block";
};

const setupModalOutsideClick = () => {
    const bidModalContent = document.querySelector("#bid-modal .modal-content");
    const choosePartnerModalContent = document.querySelector("#choose-partner-modal .modal-content");
    const playCardModalContent = document.querySelector("#play-card-modal .modal-content");
    
    window.addEventListener("click", (event) => {
        if (!bidModalContent.contains(event.target)) {
            document.getElementById("bid-modal").style.display = "none";
        }
        if (!choosePartnerModalContent.contains(event.target)) {
            document.getElementById("choose-partner-modal").style.display = "none";
        }
        if (!playCardModalContent.contains(event.target)) {
            document.getElementById("play-card-modal").style.display = "none";
        }
    });
};

window.openModal = openModal;
document.addEventListener("DOMContentLoaded", setupModalOutsideClick);
